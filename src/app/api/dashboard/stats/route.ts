import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

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

    // Get today's sales total
    const { data: todayTransactions } = await supabase
      .from('transactions')
      .select('total')
      .eq('status', 'COMPLETED')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())

    const todaySales = todayTransactions?.reduce((sum, t) => sum + t.total, 0) || 0
    const todayTransactionsCount = todayTransactions?.length || 0

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

    // Get active shifts count (shifts without ended_at)
    const { count: activeShiftsCount } = await supabase
      .from('shifts')
      .select('*', { count: 'exact', head: true })
      .is('ended_at', null)

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
      .select('total, created_at')
      .eq('status', 'COMPLETED')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    // Group by day
    const dailySales = Array(7).fill(0)
    const dailyLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
    
    weekTransactions?.forEach(transaction => {
      const date = new Date(transaction.created_at)
      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff >= 0 && daysDiff < 7) {
        dailySales[6 - daysDiff] += transaction.total
      }
    })

    // Calculate percentage for each day (relative to max)
    const maxSales = Math.max(...dailySales, 1)
    const dailyPercentages = dailySales.map(sales => Math.round((sales / maxSales) * 100))

    // Get yesterday's sales for comparison
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: yesterdayTransactions } = await supabase
      .from('transactions')
      .select('total')
      .eq('status', 'COMPLETED')
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', today.toISOString())

    const yesterdaySales = yesterdayTransactions?.reduce((sum, t) => sum + t.total, 0) || 0
    const salesGrowth = yesterdaySales > 0 
      ? Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100)
      : 0

    return NextResponse.json({
      todaySales,
      todayTransactions: todayTransactionsCount,
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
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
