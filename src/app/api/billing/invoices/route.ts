import { NextResponse } from 'next/server'
import { requireTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const ctx = await requireTenant()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoices = await prisma.invoice.findMany({
      where: { tenantId: ctx.tenant.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      tenant: {
        plan: ctx.tenant.plan,
        status: ctx.tenant.status,
        trialEndsAt: ctx.tenant.trialEndsAt,
        currentPeriodEnd: ctx.tenant.currentPeriodEnd,
      },
      invoices,
    })
  } catch (error) {
    console.error('Invoices error:', error)
    return NextResponse.json({ error: 'Gagal memuat invoice' }, { status: 500 })
  }
}
