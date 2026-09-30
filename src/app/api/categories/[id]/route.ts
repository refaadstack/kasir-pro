import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTenant } from '@/lib/tenant'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await requireTenant()
    if (!ctx || !['SUPERADMIN', 'MANAGER'].includes(ctx.session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const existing = await prisma.category.findFirst({
      where: { id: params.id, tenantId: ctx.tenant.id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 })
    }

    const body = await req.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama kategori harus diisi' }, { status: 400 })
    }

    const data = await prisma.category.update({
      where: { id: params.id },
      data: { name: name.trim() },
    })

    await prisma.auditLog.create({
      data: {
        userId: ctx.session.id,
        action: 'UPDATE_CATEGORY',
        detail: `Kategori diupdate menjadi "${name}"`,
        tenantId: ctx.tenant.id,
      },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating category:', error)
    const message = error instanceof Error ? error.message : 'Gagal mengupdate kategori'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await requireTenant()
    if (!ctx || !['SUPERADMIN', 'MANAGER'].includes(ctx.session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const category = await prisma.category.findFirst({
      where: { id: params.id, tenantId: ctx.tenant.id },
    })
    if (!category) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 })
    }

    await prisma.category.delete({ where: { id: params.id } })

    await prisma.auditLog.create({
      data: {
        userId: ctx.session.id,
        action: 'DELETE_CATEGORY',
        detail: `Kategori "${category.name}" dihapus`,
        tenantId: ctx.tenant.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    const message = error instanceof Error ? error.message : 'Gagal menghapus kategori'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
