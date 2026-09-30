import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTenant } from '@/lib/tenant'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await requireTenant()
    if (!ctx || !['SUPERADMIN', 'MANAGER'].includes(ctx.session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const target = await prisma.product.findFirst({
      where: { id: params.id, tenantId: ctx.tenant.id },
    })
    if (!target) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    }

    const body = await req.json()
    const { name, sku, price, stock, categoryId, emoji, isActive, tax_percent } = body

    if (sku) {
      const existing = await prisma.product.findFirst({
        where: { tenantId: ctx.tenant.id, sku, id: { not: params.id } },
      })
      if (existing) {
        return NextResponse.json({ error: 'SKU sudah digunakan' }, { status: 400 })
      }
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (sku !== undefined) updateData.sku = sku
    if (price !== undefined) updateData.price = parseFloat(price)
    if (stock !== undefined) updateData.stock = parseInt(stock)
    if (categoryId !== undefined) updateData.categoryId = categoryId || null
    if (emoji !== undefined) updateData.emoji = emoji
    if (isActive !== undefined) updateData.isActive = isActive
    if (tax_percent !== undefined) updateData.taxPercent = parseFloat(tax_percent) || 0

    const product = await prisma.product.update({ where: { id: params.id }, data: updateData })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Gagal mengupdate produk' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await requireTenant()
    if (!ctx || ctx.session.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const target = await prisma.product.findFirst({
      where: { id: params.id, tenantId: ctx.tenant.id },
    })
    if (!target) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    }

    await prisma.product.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Gagal menghapus produk' }, { status: 500 })
  }
}
