import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTenant } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const ctx = await requireTenant()
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const products = await prisma.product.findMany({
      where: { tenantId: ctx.tenant.id },
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Gagal memuat produk' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireTenant()
    if (!ctx || !['SUPERADMIN', 'MANAGER'].includes(ctx.session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, sku, price, stock, categoryId, emoji, isActive, tax_percent } = body

    if (!name || !sku || price === undefined || stock === undefined) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const existing = await prisma.product.findFirst({
      where: { tenantId: ctx.tenant.id, sku },
    })
    if (existing) {
      return NextResponse.json({ error: 'SKU sudah digunakan' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId: categoryId || null,
        emoji: emoji || '📦',
        isActive: isActive !== false,
        taxPercent: parseFloat(tax_percent) || 0,
        tenantId: ctx.tenant.id,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Gagal membuat produk' }, { status: 500 })
  }
}
