import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTenant } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const ctx = await requireTenant()
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const categories = await prisma.category.findMany({
      where: { tenantId: ctx.tenant.id },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Gagal memuat kategori' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireTenant()
    if (!ctx || !['SUPERADMIN', 'MANAGER'].includes(ctx.session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama kategori harus diisi' }, { status: 400 })
    }

    const data = await prisma.category.create({
      data: { name: name.trim(), tenantId: ctx.tenant.id },
    })

    await prisma.auditLog.create({
      data: {
        userId: ctx.session.id,
        action: 'CREATE_CATEGORY',
        detail: `Kategori "${name}" ditambahkan`,
        tenantId: ctx.tenant.id,
      },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating category:', error)
    const message = error instanceof Error ? error.message : 'Gagal menambahkan kategori'
    const duplicate = message.includes('Unique constraint')
    return NextResponse.json(
      { error: duplicate ? 'Kategori sudah ada' : message },
      { status: duplicate ? 400 : 500 }
    )
  }
}
