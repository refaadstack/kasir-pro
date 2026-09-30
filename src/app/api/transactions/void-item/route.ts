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
    const { session, tenant } = ctx

    const body = await req.json()

    const schema = z.object({
      pin: z.string().length(4, 'PIN harus 4 digit'),
      reason: z.string().min(3, 'Alasan minimal 3 karakter'),
      itemName: z.string(),
      itemQty: z.number(),
      itemPrice: z.number(),
    })

    const validated = schema.parse(body)

    const approvers = await prisma.user.findMany({
      where: {
        pin: validated.pin,
        role: { in: ['MANAGER', 'SUPERADMIN'] },
        isActive: true,
        tenantId: tenant.id,
      },
      select: { id: true, name: true, role: true },
    })

    if (approvers.length === 0) {
      return NextResponse.json(
        { error: 'PIN tidak valid. Hanya PIN Manager atau Admin yang dapat meng-approve void.' },
        { status: 403 }
      )
    }

    if (approvers.length > 1) {
      return NextResponse.json(
        { error: 'PIN ambigu — lebih dari satu akun memiliki PIN ini. Hubungi admin untuk mengubah PIN agar unik.' },
        { status: 409 }
      )
    }

    const approver = approvers[0]

    await prisma.auditLog.create({
      data: {
        userId: approver.id,
        action: 'VOID_ITEM',
        detail: `Void item: ${validated.itemName} (${validated.itemQty}x @ Rp ${validated.itemPrice.toLocaleString('id-ID')}). Alasan: ${validated.reason}. Kasir: ${session.name || session.id}`,
        tenantId: tenant.id,
      },
    })

    return NextResponse.json({ success: true, approvedBy: approver.name })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Input tidak valid' }, { status: 400 })
    }
    console.error('Error voiding item:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
