export type PlanCode = 'monthly' | 'quarterly'

export const PLANS: Record<PlanCode, { code: PlanCode; label: string; months: number; amount: number }> = {
  monthly: { code: 'monthly', label: '1 Bulan', months: 1, amount: 100000 },
  quarterly: { code: 'quarterly', label: '3 Bulan', months: 3, amount: 250000 },
}

export const TRIAL_DAYS = 14

export function isPlanCode(value: unknown): value is PlanCode {
  return value === 'monthly' || value === 'quarterly'
}

export const PLAN_LIMITS = {
  TRIAL: { maxUsers: 1 },
  PREMIUM: { maxUsers: Infinity },
} as const

export function maxUsersFor(plan: 'TRIAL' | 'PREMIUM'): number {
  return PLAN_LIMITS[plan].maxUsers
}
