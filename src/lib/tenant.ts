import { getSession } from './auth'
import { prisma } from './prisma'
import { JWTPayload } from './jwt'
import { maxUsersFor } from './plans'
import type { Tenant } from '@prisma/client'

export type TenantSession = {
  session: JWTPayload
  tenant: Tenant
}

export async function requireTenant(): Promise<TenantSession | null> {
  const session = await getSession()
  if (!session || !session.tenantId) return null

  const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId } })
  if (!tenant) return null

  return { session, tenant }
}

export function isSubscriptionActive(tenant: Pick<Tenant, 'status' | 'trialEndsAt'>): boolean {
  if (tenant.status === 'active') return true
  if (tenant.status === 'trialing') {
    return !tenant.trialEndsAt || tenant.trialEndsAt.getTime() > Date.now()
  }
  return false
}

export async function countUsers(tenantId: string): Promise<number> {
  return prisma.user.count({ where: { tenantId } })
}

export async function canAddUser(tenant: Tenant): Promise<{ ok: boolean; message?: string }> {
  if (!isSubscriptionActive(tenant)) {
    return { ok: false, message: 'Langganan tidak aktif. Perpanjang langganan untuk menambah karyawan.' }
  }

  const max = maxUsersFor(tenant.plan)
  if (max === Infinity) return { ok: true }

  const count = await countUsers(tenant.id)
  if (count >= max) {
    return {
      ok: false,
      message: `Masa trial hanya mendukung ${max} pengguna. Upgrade ke Premium untuk menambah karyawan.`,
    }
  }

  return { ok: true }
}
