import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePlatformAdmin } from '@/lib/platform'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const admin = await requirePlatformAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { users: true, transactions: true, products: true } },
      },
    })

    const ownerIds = tenants.map((t) => t.ownerId)
    const owners = await prisma.user.findMany({
      where: { id: { in: ownerIds } },
      select: { id: true, name: true, email: true },
    })
    const ownerMap = new Map(owners.map((o) => [o.id, o]))

    const result = tenants.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      plan: t.plan,
      status: t.status,
      trialEndsAt: t.trialEndsAt,
      currentPeriodEnd: t.currentPeriodEnd,
      createdAt: t.createdAt,
      owner: ownerMap.get(t.ownerId) || null,
      counts: { users: t._count.users, transactions: t._count.transactions, products: t._count.products },
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Platform tenants error:', error)
    return NextResponse.json({ error: 'Gagal memuat tenant' }, { status: 500 })
  }
}
