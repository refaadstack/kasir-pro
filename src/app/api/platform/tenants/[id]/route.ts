import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePlatformAdmin } from '@/lib/platform'

function addMonths(date: Date, months: number) {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requirePlatformAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const tenant = await prisma.tenant.findUnique({ where: { id: params.id } })
    if (!tenant) return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 404 })

    const body = await req.json()
    const { action, months, plan } = body

    const data: Record<string, unknown> = {}

    switch (action) {
      case 'activate': {
        const base =
          tenant.currentPeriodEnd && tenant.currentPeriodEnd > new Date()
            ? tenant.currentPeriodEnd
            : new Date()
        data.plan = 'PREMIUM'
        data.status = 'active'
        data.currentPeriodEnd = tenant.currentPeriodEnd || addMonths(base, 1)
        break
      }
      case 'extend': {
        const m = Number(months) > 0 ? Number(months) : 1
        const base =
          tenant.currentPeriodEnd && tenant.currentPeriodEnd > new Date()
            ? tenant.currentPeriodEnd
            : new Date()
        data.plan = 'PREMIUM'
        data.status = 'active'
        data.currentPeriodEnd = addMonths(base, m)
        break
      }
      case 'suspend':
        data.status = 'expired'
        break
      case 'set_plan':
        if (!['TRIAL', 'PREMIUM'].includes(plan)) {
          return NextResponse.json({ error: 'Plan tidak valid' }, { status: 400 })
        }
        data.plan = plan
        break
      default:
        return NextResponse.json({ error: 'Action tidak dikenal' }, { status: 400 })
    }

    const updated = await prisma.tenant.update({ where: { id: params.id }, data })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Platform tenant update error:', error)
    return NextResponse.json({ error: 'Gagal mengubah tenant' }, { status: 500 })
  }
}
