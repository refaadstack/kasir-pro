import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTenant } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireTenant()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = ctx.tenant.id

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'today'

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

    const transactions = await prisma.transaction.findMany({
      where: { tenantId, status: 'SUCCESS', createdAt: { gte: startDate } },
      select: { totalAmount: true, createdAt: true },
    })

    const totalSales = transactions.reduce((acc, t) => acc + (t.totalAmount || 0), 0)
    const totalTransactions = transactions.length
    const avgTransaction = totalTransactions > 0 ? Math.round(totalSales / totalTransactions) : 0

    const items = await prisma.transactionItem.findMany({
      where: { tenantId, transaction: { status: 'SUCCESS', createdAt: { gte: startDate } } },
      select: { productName: true, qty: true, priceAtSale: true, subtotal: true },
    })

    const productMap = new Map<string, { sold: number; revenue: number }>()
    items.forEach((item) => {
      const name = item.productName || 'Unknown'
      const existing = productMap.get(name) || { sold: 0, revenue: 0 }
      productMap.set(name, {
        sold: existing.sold + item.qty,
        revenue: existing.revenue + (item.subtotal || item.priceAtSale * item.qty),
      })
    })

    const topProducts = Array.from(productMap.entries())
      .map(([name, data]) => ({ name, sold: data.sold, revenue: data.revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    return NextResponse.json({ totalSales, totalTransactions, avgTransaction, topProducts })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
