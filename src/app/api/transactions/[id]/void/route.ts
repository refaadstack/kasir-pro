import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTenant } from '@/lib/tenant'
import { z } from 'zod'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await requireTenant()
    if (!ctx || !['MANAGER', 'SUPERADMIN'].includes(ctx.session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    const { session, tenant } = ctx
    const { id } = params

    const body = await req.json()
    const schema = z.object({
      reason: z.string().min(5, 'Alasan minimal 5 karakter'),
      pin: z.string().length(4, 'PIN harus 4 digit'),
    })

    const validated = schema.parse(body)

    const user = await prisma.user.findFirst({
      where: { id: session.id, pin: validated.pin, tenantId: tenant.id },
      select: { id: true, name: true, role: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'PIN salah' }, { status: 403 })
    }

    const transaction = await prisma.transaction.findFirst({
      where: { id, tenantId: tenant.id },
      include: { items: true },
    })
    if (!transaction) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 })
    }

    if (transaction.status === 'VOID') {
      return NextResponse.json({ error: 'Transaksi sudah dibatalkan' }, { status: 400 })
    }

    const voidedTx = await prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id },
        data: {
          status: 'VOID',
          voidReason: validated.reason,
          voidBy: session.id,
          voidAt: new Date(),
        },
      })

      for (const item of transaction.items) {
        await tx.product.updateMany({
          where: { id: item.productId, tenantId: tenant.id },
          data: { stock: { increment: item.qty } },
        })
      }

      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: 'VOID_TRANSACTION',
          detail: `Alasan: ${validated.reason}`,
          tenantId: tenant.id,
        },
      })

      return updated
    })

    return NextResponse.json(voidedTx)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    console.error('Error voiding transaction:', error)
    return NextResponse.json({ error: 'Failed to void transaction' }, { status: 500 })
  }
}
