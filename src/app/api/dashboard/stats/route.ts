import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get today's sales
    const { data: todayTransactions, error: todayError } = await supabase
      .from('transactions')
      .select('total_amount')
      .eq('status', 'SUCCESS')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())

    if (todayError) {
      console.error('Today transactions error:', JSON.stringify(todayError))
    }

    const todaySales = todayTransactions?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0
    const todayTransactionsCount = todayTransactions?.length || 0

    // Get today's tax and service charge totals
    const { data: todayFinancials } = await supabase
      .from('transactions')
      .select('tax_amount, service_charge_amount, discount_amount, subtotal_amount, total_amount')
      .eq('status', 'SUCCESS')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())

    const todayTax = todayFinancials?.reduce((sum, t) => sum + (t.tax_amount || 0), 0) || 0
    const todayServiceCharge = todayFinancials?.reduce((sum, t) => sum + (t.service_charge_amount || 0), 0) || 0
    const todayDiscount = todayFinancials?.reduce((sum, t) => sum + (t.discount_amount || 0), 0) || 0
    const todaySubtotal = todayFinancials?.reduce((sum, t) => sum + (t.subtotal_amount || 0), 0) || 0

    // Get today's drawer data (opening cash from active/closed shifts today)
    const { data: todayShifts } = await supabase
      .from('shifts')
      .select('opening_cash, closing_cash')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())

    const todayDrawerOpening = todayShifts?.reduce((sum, s) => sum + (s.opening_cash || 0), 0) || 0

    // Net revenue = total sales (what customer paid) - this is the grand total including tax & service
    // Gross profit = subtotal (product sales before tax/service/discount)
    // Deductions: discount given away
    // Collections: tax collected, service charge collected
    // Net income = subtotal - discount + tax + service = total_amount (what's actually received minus drawer)
    const todayNetIncome = todaySales // total_amount is what's received from customers
    const todayGrossRevenue = todaySubtotal // product revenue before adjustments

    // Get active products count
    const { count: activeProductsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Get low stock products count (stock <= 5)
    const { count: lowStockCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lte('stock', 5)
      .gt('stock', 0)

    // Get critical stock products count (stock = 0)
    const { count: criticalStockCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('stock', 0)

    // Get active shifts count
    const { count: activeShiftsCount } = await supabase
      .from('shifts')
      .select('*', { count: 'exact', head: true })
      .is('end_time', null)

    // Get total employees count
    const { count: totalEmployees } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Get last 7 days sales for chart
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: weekTransactions } = await supabase
      .from('transactions')
      .select('total_amount, created_at')
      .eq('status', 'SUCCESS')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    // Group by day - use UTC dates for consistency
    const dailySales: number[] = Array(7).fill(0)
    const dailyLabels: string[] = []
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

    // Generate labels for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dailyLabels.push(dayNames[date.getUTCDay()])
    }

    // Group transactions by date string (YYYY-MM-DD)
    weekTransactions?.forEach(transaction => {
      const txDate = new Date(transaction.created_at).toISOString().slice(0, 10)
      
      for (let i = 6; i >= 0; i--) {
        const checkDate = new Date()
        checkDate.setDate(checkDate.getDate() - i)
        const checkDateStr = checkDate.toISOString().slice(0, 10)
        
        if (txDate === checkDateStr) {
          dailySales[6 - i] += transaction.total_amount || 0
          break
        }
      }
    })

    const maxSales = Math.max(...dailySales, 1)
    const dailyPercentages = dailySales.map(sales => 
      sales > 0 ? Math.max(Math.round((sales / maxSales) * 100), 15) : 0
    )

    // Get yesterday's sales for comparison
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: yesterdayTransactions } = await supabase
      .from('transactions')
      .select('total_amount')
      .eq('status', 'SUCCESS')
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', today.toISOString())

    const yesterdaySales = yesterdayTransactions?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0
    const salesGrowth = yesterdaySales > 0
      ? Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100)
      : 0

    // Get monthly totals (current month) for tax & service obligations
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    const { data: monthlyFinancials } = await supabase
      .from('transactions')
      .select('tax_amount, service_charge_amount, discount_amount, subtotal_amount, total_amount')
      .eq('status', 'SUCCESS')
      .gte('created_at', monthStart.toISOString())
      .lt('created_at', monthEnd.toISOString())

    const monthlyTax = monthlyFinancials?.reduce((sum, t) => sum + (t.tax_amount || 0), 0) || 0
    const monthlyServiceCharge = monthlyFinancials?.reduce((sum, t) => sum + (t.service_charge_amount || 0), 0) || 0
    const monthlyDiscount = monthlyFinancials?.reduce((sum, t) => sum + (t.discount_amount || 0), 0) || 0
    const monthlySubtotal = monthlyFinancials?.reduce((sum, t) => sum + (t.subtotal_amount || 0), 0) || 0
    const monthlySales = monthlyFinancials?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0
    const monthlyNetIncome = monthlySales

    // Get closed shifts today for cash reconciliation
    const { data: closedShiftsToday } = await supabase
      .from('shifts')
      .select('closing_cash, expected_cash, cash_difference')
      .not('end_time', 'is', null)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())

    const todayClosingCash = closedShiftsToday?.reduce((sum, s) => sum + (s.closing_cash || 0), 0) || 0
    const todayExpectedCash = closedShiftsToday?.reduce((sum, s) => sum + (s.expected_cash || 0), 0) || 0
    const todayCashDifference = closedShiftsToday?.reduce((sum, s) => sum + (s.cash_difference || 0), 0) || 0

    return NextResponse.json({
      todaySales,
      todayTransactions: todayTransactionsCount,
      todayTax,
      todayServiceCharge,
      todayDiscount,
      todaySubtotal,
      todayGrossRevenue,
      todayNetIncome,
      todayDrawerOpening,
      todayClosingCash,
      todayExpectedCash,
      todayCashDifference,
      monthlyTax,
      monthlyServiceCharge,
      monthlyDiscount,
      monthlySubtotal,
      monthlySales,
      monthlyNetIncome,
      activeProducts: activeProductsCount || 0,
      lowStockProducts: (lowStockCount || 0) + (criticalStockCount || 0),
      activeShifts: activeShiftsCount || 0,
      totalEmployees: totalEmployees || 0,
      salesGrowth,
      weeklyChart: {
        labels: dailyLabels,
        data: dailySales,
        percentages: dailyPercentages,
      },
      weekTotal: dailySales.reduce((sum, val) => sum + val, 0),
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
