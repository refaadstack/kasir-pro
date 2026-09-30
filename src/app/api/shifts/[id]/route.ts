import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTenant } from '@/lib/tenant'
import { z } from 'zod'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await requireTenant()
    if (!ctx || !['KASIR', 'MANAGER', 'SUPERADMIN'].includes(ctx.session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = params
    const body = await req.json().catch(() => ({}))

    const schema = z.object({
      closing_cash: z.number().min(0).default(0),
      closing_notes: z.string().optional(),
    })

    const validated = schema.parse(body)

    const shift = await prisma.shift.findFirst({
      where: { id, tenantId: ctx.tenant.id },
    })
    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    if (shift.endTime) {
      return NextResponse.json({ error: 'Shift sudah ditutup' }, { status: 400 })
    }

    const transactions = await prisma.transaction.findMany({
      where: { shiftId: id, status: 'SUCCESS', tenantId: ctx.tenant.id },
      select: { totalAmount: true, paymentMethod: true },
    })

    const totalSales = transactions.reduce((sum, t) => sum + t.totalAmount, 0)
    const totalTransactions = transactions.length
    const cashSales = transactions
      .filter((t) => t.paymentMethod === 'TUNAI')
      .reduce((sum, t) => sum + t.totalAmount, 0)

    const expectedCash = (shift.openingCash || 0) + cashSales
    const cashDifference = validated.closing_cash - expectedCash

    const updatedShift = await prisma.shift.update({
      where: { id },
      data: {
        endTime: new Date(),
        totalSales,
        totalTransactions,
        closingCash: validated.closing_cash,
        expectedCash,
        cashDifference,
        closingNotes: validated.closing_notes || null,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: ctx.session.id,
        action: 'CLOSE_DRAWER',
        detail: `Tutup shift - ${totalTransactions} transaksi, Rp ${totalSales.toLocaleString('id-ID')}`,
        tenantId: ctx.tenant.id,
      },
    })

    return NextResponse.json(updatedShift)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    console.error('Error ending shift:', error)
    return NextResponse.json({ error: 'Failed to end shift' }, { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await requireTenant()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shift = await prisma.shift.findFirst({
      where: { id: params.id, tenantId: ctx.tenant.id },
    })
    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    return NextResponse.json(shift)
  } catch (error) {
    console.error('Error fetching shift:', error)
    return NextResponse.json({ error: 'Failed to fetch shift' }, { status: 500 })
  }
}
