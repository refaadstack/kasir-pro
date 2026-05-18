import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

// POST /api/transactions/void-item - Void an item from cart (requires manager/admin PIN)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const schema = z.object({
      pin: z.string().length(4, 'PIN harus 4 digit'),
      reason: z.string().min(3, 'Alasan minimal 3 karakter'),
      itemName: z.string(),
      itemQty: z.number(),
      itemPrice: z.number(),
    })

    const validated = schema.parse(body)

    // Verify PIN belongs to a MANAGER or SUPERADMIN
    // PIN must be unique per user - if somehow duplicates exist, reject to avoid ambiguity
    const { data: approvers } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('pin', validated.pin)
      .in('role', ['MANAGER', 'SUPERADMIN'])
      .eq('is_active', true)

    if (!approvers || approvers.length === 0) {
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

    // Log the void action - logged under the approver (manager/admin who granted it)
    const { error: logError } = await supabase.from('audit_logs').insert({
      user_id: approver.id,
      action: 'VOID_ITEM',
      detail: `Void item: ${validated.itemName} (${validated.itemQty}x @ Rp ${validated.itemPrice.toLocaleString('id-ID')}). Alasan: ${validated.reason}. Kasir: ${session.name || session.id}`,
    })

    if (logError) {
      console.error('Void item log error:', JSON.stringify(logError))
    }

    return NextResponse.json({
      success: true,
      approvedBy: approver.name,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Input tidak valid' },
        { status: 400 }
      )
    }
    console.error('Error voiding item:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
