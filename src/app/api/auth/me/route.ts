import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let tenant = null
    if (session.tenantId) {
      tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId } })
    }

    return NextResponse.json({
      id: session.id,
      name: session.name,
      email: session.email,
      role: session.role,
      isPlatformAdmin: session.isPlatformAdmin,
      tenantId: session.tenantId,
      plan: tenant?.plan || session.plan,
      tenant: tenant
        ? {
            id: tenant.id,
            name: tenant.name,
            plan: tenant.plan,
            status: tenant.status,
            trialEndsAt: tenant.trialEndsAt,
            currentPeriodEnd: tenant.currentPeriodEnd,
          }
        : null,
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
