'use client'

import { useState, useEffect } from 'react'

export type Shift = {
  id: string
  kasir_id: string
  started_at: string
  ended_at: string | null
  total_sales: number
  total_transactions: number
}

export function useShift(kasirId?: string) {
  const [shift, setShift] = useState<Shift | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (kasirId) {
      fetchActiveShift()
    }
  }, [kasirId])

  const fetchActiveShift = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/shifts/active')
      if (res.ok) {
        const data = await res.json()
        setShift(data)
      } else {
        setShift(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setShift(null)
    } finally {
      setIsLoading(false)
    }
  }

  const startShift = async () => {
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kasir_id: kasirId }),
      })
      if (!res.ok) throw new Error('Failed to start shift')
      const data = await res.json()
      setShift(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const endShift = async (shiftId: string) => {
    try {
      const res = await fetch(`/api/shifts/${shiftId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ended_at: new Date().toISOString() }),
      })
      if (!res.ok) throw new Error('Failed to end shift')
      setShift(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  return {
    shift,
    isLoading,
    error,
    startShift,
    endShift,
    refetch: fetchActiveShift,
  }
}
