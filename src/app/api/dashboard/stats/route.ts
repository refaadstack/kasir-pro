import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTenant } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

const FINANCIAL_SELECT = {
  taxAmount: true,
  serviceChargeAmount: true,
  discountAmount: true,
  subtotalAmount: true,
  totalAmount: true,
} as const

export async function GET() {
  try {
    const ctx = await requireTenant()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = ctx.tenant.id

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayFinancials = await prisma.transaction.findMany({
      where: { tenantId, status: 'SUCCESS', createdAt: { gte: today, lt: tomorrow } },
      select: FINANCIAL_SELECT,
    })

    const sum = (rows: typeof todayFinancials, key: keyof (typeof todayFinancials)[number]) =>
      rows.reduce((acc, t) => acc + (Number(t[key]) || 0), 0)

    const todaySales = sum(todayFinancials, 'totalAmount')
    const todayTransactionsCount = todayFinancials.length
    const todayTax = sum(todayFinancials, 'taxAmount')
    const todayServiceCharge = sum(todayFinancials, 'serviceChargeAmount')
    const todayDiscount = sum(todayFinancials, 'discountAmount')
    const todaySubtotal = sum(todayFinancials, 'subtotalAmount')

    const todayShifts = await prisma.shift.findMany({
      where: { tenantId, createdAt: { gte: today, lt: tomorrow } },
      select: { openingCash: true },
    })
    const todayDrawerOpening = todayShifts.reduce((acc, s) => acc + (s.openingCash || 0), 0)

    const activeProductsCount = await prisma.product.count({ where: { tenantId, isActive: true } })
    const lowStockCount = await prisma.product.count({ where: { tenantId, stock: { lte: 5, gt: 0 } } })
    const criticalStockCount = await prisma.product.count({ where: { tenantId, stock: 0 } })
    const activeShiftsCount = await prisma.shift.count({ where: { tenantId, endTime: null } })
    const totalEmployees = await prisma.user.count({ where: { tenantId, isActive: true } })

    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const weekTransactions = await prisma.transaction.findMany({
      where: { tenantId, status: 'SUCCESS', createdAt: { gte: sevenDaysAgo } },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const dailySales: number[] = Array(7).fill(0)
    const dailyLabels: string[] = []
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dailyLabels.push(dayNames[date.getUTCDay()])
    }

    weekTransactions.forEach((transaction) => {
      const txDate = new Date(transaction.createdAt).toISOString().slice(0, 10)
      for (let i = 6; i >= 0; i--) {
        const checkDate = new Date()
        checkDate.setDate(checkDate.getDate() - i)
        if (txDate === checkDate.toISOString().slice(0, 10)) {
          dailySales[6 - i] += transaction.totalAmount || 0
          break
        }
      }
    })

    const maxSales = Math.max(...dailySales, 1)
    const dailyPercentages = dailySales.map((sales) =>
      sales > 0 ? Math.max(Math.round((sales / maxSales) * 100), 15) : 0
    )

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayTransactions = await prisma.transaction.findMany({
      where: { tenantId, status: 'SUCCESS', createdAt: { gte: yesterday, lt: today } },
      select: { totalAmount: true },
    })
    const yesterdaySales = yesterdayTransactions.reduce((acc, t) => acc + (t.totalAmount || 0), 0)
    const salesGrowth =
      yesterdaySales > 0 ? Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100) : 0

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    const monthlyFinancials = await prisma.transaction.findMany({
      where: { tenantId, status: 'SUCCESS', createdAt: { gte: monthStart, lt: monthEnd } },
      select: FINANCIAL_SELECT,
    })

    const monthlyTax = sum(monthlyFinancials, 'taxAmount')
    const monthlyServiceCharge = sum(monthlyFinancials, 'serviceChargeAmount')
    const monthlyDiscount = sum(monthlyFinancials, 'discountAmount')
    const monthlySubtotal = sum(monthlyFinancials, 'subtotalAmount')
    const monthlySales = sum(monthlyFinancials, 'totalAmount')

    const closedShiftsToday = await prisma.shift.findMany({
      where: { tenantId, endTime: { not: null }, createdAt: { gte: today, lt: tomorrow } },
      select: { closingCash: true, expectedCash: true, cashDifference: true },
    })
    const todayClosingCash = closedShiftsToday.reduce((acc, s) => acc + (s.closingCash || 0), 0)
    const todayExpectedCash = closedShiftsToday.reduce((acc, s) => acc + (s.expectedCash || 0), 0)
    const todayCashDifference = closedShiftsToday.reduce((acc, s) => acc + (s.cashDifference || 0), 0)

    return NextResponse.json({
      todaySales,
      todayTransactions: todayTransactionsCount,
      todayTax,
      todayServiceCharge,
      todayDiscount,
      todaySubtotal,
      todayGrossRevenue: todaySubtotal,
      todayNetIncome: todaySales,
      todayDrawerOpening,
      todayClosingCash,
      todayExpectedCash,
      todayCashDifference,
      monthlyTax,
      monthlyServiceCharge,
      monthlyDiscount,
      monthlySubtotal,
      monthlySales,
      monthlyNetIncome: monthlySales,
      activeProducts: activeProductsCount,
      lowStockProducts: lowStockCount + criticalStockCount,
      activeShifts: activeShiftsCount,
      totalEmployees,
      salesGrowth,
      weeklyChart: { labels: dailyLabels, data: dailySales, percentages: dailyPercentages },
      weekTotal: dailySales.reduce((acc, val) => acc + val, 0),
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
