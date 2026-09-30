import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTenant } from '@/lib/tenant'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireTenant()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const active = searchParams.get('active') === 'true'
    const kasirId = searchParams.get('kasir_id')

    const where: Record<string, unknown> = { tenantId: ctx.tenant.id }
    if (active) where.endTime = null
    if (kasirId) where.userId = kasirId

    const shifts = await prisma.shift.findMany({
      where,
      orderBy: { startTime: 'desc' },
    })

    return NextResponse.json(shifts)
  } catch (error) {
    console.error('Error fetching shifts:', error)
    return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireTenant()
    if (!ctx || !['KASIR', 'MANAGER', 'SUPERADMIN'].includes(ctx.session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const schema = z.object({
      kasir_id: z.string(),
      opening_cash: z.number().min(0).default(0),
      opening_notes: z.string().optional(),
    })

    const validated = schema.parse(body)

    const kasir = await prisma.user.findFirst({
      where: { id: validated.kasir_id, tenantId: ctx.tenant.id },
    })
    if (!kasir) {
      return NextResponse.json({ error: 'Kasir tidak ditemukan' }, { status: 404 })
    }

    const activeShift = await prisma.shift.findFirst({
      where: { userId: validated.kasir_id, endTime: null },
    })
    if (activeShift) {
      return NextResponse.json({ error: 'Kasir sudah memiliki shift aktif' }, { status: 400 })
    }

    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '')
    const shiftCode = `SHF-${dateStr}-${timeStr}`

    const shift = await prisma.shift.create({
      data: {
        userId: validated.kasir_id,
        shiftCode,
        openingCash: validated.opening_cash,
        openingNotes: validated.opening_notes || null,
        tenantId: ctx.tenant.id,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: ctx.session.id,
        action: 'OPEN_DRAWER',
        detail: `Buka shift dengan modal kas Rp ${validated.opening_cash.toLocaleString('id-ID')}`,
        tenantId: ctx.tenant.id,
      },
    })

    return NextResponse.json(shift, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    console.error('Error starting shift:', error)
    return NextResponse.json({ error: 'Failed to start shift', detail: String(error) }, { status: 500 })
  }
}
