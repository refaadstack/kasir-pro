import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePlatformAdmin } from '@/lib/platform'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const admin = await requirePlatformAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { tenant: { select: { name: true } } },
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Platform invoices error:', error)
    return NextResponse.json({ error: 'Gagal memuat invoice' }, { status: 500 })
  }
}
