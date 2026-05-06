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
    let startDate = new Date()

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
    const { data: transactions } = await supabase
      .from('transactions')
      .select('total, created_at')
      .eq('status', 'COMPLETED')
      .gte('created_at', startDate.toISOString())

    const totalSales = transactions?.reduce((sum, t) => sum + t.total, 0) || 0
    const totalTransactions = transactions?.length || 0
    const avgTransaction = totalTransactions > 0 ? Math.round(totalSales / totalTransactions) : 0

    // Get top products
    const { data: transactionItems } = await supabase
      .from('transaction_items')
      .select(`
        product_name,
        qty,
        subtotal,
        transaction:transactions!inner(status, created_at)
      `)
      .gte('transaction.created_at', startDate.toISOString())
      .eq('transaction.status', 'COMPLETED')

    // Aggregate products
    const productMap = new Map<string, { sold: number; revenue: number }>()
    
    transactionItems?.forEach((item: any) => {
      const existing = productMap.get(item.product_name) || { sold: 0, revenue: 0 }
      productMap.set(item.product_name, {
        sold: existing.sold + item.qty,
        revenue: existing.revenue + item.subtotal,
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
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}
