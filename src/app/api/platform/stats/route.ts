import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePlatformAdmin } from '@/lib/platform'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const admin = await requirePlatformAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [total, trialing, active, expired, revenueAgg] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'trialing' } }),
      prisma.tenant.count({ where: { status: 'active' } }),
      prisma.tenant.count({ where: { status: 'expired' } }),
      prisma.invoice.aggregate({ where: { status: 'paid' }, _sum: { amount: true } }),
    ])

    return NextResponse.json({
      totalTenants: total,
      trialing,
      active,
      expired,
      revenue: revenueAgg._sum.amount || 0,
    })
  } catch (error) {
    console.error('Platform stats error:', error)
    return NextResponse.json({ error: 'Gagal memuat statistik' }, { status: 500 })
  }
}
