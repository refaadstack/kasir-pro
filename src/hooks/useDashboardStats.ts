'use client'

import { useState, useEffect } from 'react'

export type DashboardStats = {
  todaySales: number
  todayTransactions: number
  activeShifts: number
  lowStockProducts: number
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    todayTransactions: 0,
    activeShifts: 0,
    lowStockProducts: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/reports/summary')
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  }
}
