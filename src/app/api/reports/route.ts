import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'today'

    // Calculate date range based on period
    const now = new Date()
    const startDate = new Date()

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'month':
        startDate.setDate(now.getDate() - 30)
        startDate.setHours(0, 0, 0, 0)
        break
    }

    // Get transactions for the period
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('total_amount, created_at')
      .eq('status', 'SUCCESS')
      .gte('created_at', startDate.toISOString())

    if (txError) {
      console.error('Reports transactions error:', JSON.stringify(txError))
    }

    const totalSales = transactions?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0
    const totalTransactions = transactions?.length || 0
    const avgTransaction = totalTransactions > 0 ? Math.round(totalSales / totalTransactions) : 0

    // Get top products - simple query without join
    const { data: transactionItems } = await supabase
      .from('transaction_items')
      .select('product_id, qty, price_at_sale, subtotal')

    // Get product names
    const { data: products } = await supabase
      .from('products')
      .select('id, name')

    const productNameMap = new Map<string, string>()
    products?.forEach(p => productNameMap.set(p.id, p.name))

    // Aggregate products
    const productMap = new Map<string, { sold: number; revenue: number }>()

    transactionItems?.forEach((item) => {
      const name = productNameMap.get(item.product_id) || 'Unknown'
      const existing = productMap.get(name) || { sold: 0, revenue: 0 }
      productMap.set(name, {
        sold: existing.sold + item.qty,
        revenue: existing.revenue + (item.subtotal || item.price_at_sale * item.qty),
      })
    })

    // Convert to array and sort by revenue
    const topProducts = Array.from(productMap.entries())
      .map(([name, data]) => ({
        name,
        sold: data.sold,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    return NextResponse.json({
      totalSales,
      totalTransactions,
      avgTransaction,
      topProducts,
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
