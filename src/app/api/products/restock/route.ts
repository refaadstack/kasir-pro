import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTenant } from '@/lib/tenant'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireTenant()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const schema = z.object({
      product_id: z.string(),
      qty: z.number().min(1, 'Jumlah minimal 1'),
      notes: z.string().optional(),
    })

    const validated = schema.parse(body)

    const product = await prisma.product.findFirst({
      where: { id: validated.product_id, tenantId: ctx.tenant.id },
      select: { id: true, name: true, stock: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    }

    const newStock = product.stock + validated.qty

    const updated = await prisma.product.update({
      where: { id: validated.product_id },
      data: { stock: newStock },
    })

    await prisma.auditLog.create({
      data: {
        userId: ctx.session.id,
        action: 'RESTOCK',
        detail: `${product.name}: +${validated.qty} (${product.stock} → ${newStock})${validated.notes ? ' | ' + validated.notes : ''}`,
        tenantId: ctx.tenant.id,
      },
    })

    return NextResponse.json({
      success: true,
      product: updated,
      previousStock: product.stock,
      addedQty: validated.qty,
      newStock,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    console.error('Restock error:', error)
    return NextResponse.json(
      { error: 'Gagal restock', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
