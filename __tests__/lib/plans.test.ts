import { describe, it, expect } from 'vitest'
import { PLANS, isPlanCode, maxUsersFor, TRIAL_DAYS } from '@/lib/plans'

describe('plans', () => {
  it('prices: 1 bulan 100rb, 3 bulan 250rb', () => {
    expect(PLANS.monthly.amount).toBe(100000)
    expect(PLANS.monthly.months).toBe(1)
    expect(PLANS.quarterly.amount).toBe(250000)
    expect(PLANS.quarterly.months).toBe(3)
  })

  it('trial 14 hari, max 1 user', () => {
    expect(TRIAL_DAYS).toBe(14)
    expect(maxUsersFor('TRIAL')).toBe(1)
    expect(maxUsersFor('PREMIUM')).toBe(Infinity)
  })

  it('validates plan codes', () => {
    expect(isPlanCode('monthly')).toBe(true)
    expect(isPlanCode('quarterly')).toBe(true)
    expect(isPlanCode('yearly')).toBe(false)
    expect(isPlanCode(undefined)).toBe(false)
  })
})
