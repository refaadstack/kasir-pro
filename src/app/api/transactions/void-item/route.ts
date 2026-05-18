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
    const { data: approver } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('pin', validated.pin)
      .in('role', ['MANAGER', 'SUPERADMIN'])
      .eq('is_active', true)
      .maybeSingle()

    if (!approver) {
      return NextResponse.json(
        { error: 'PIN tidak valid. Hanya PIN Manager atau Admin yang dapat meng-approve void.' },
        { status: 403 }
      )
    }

    // Log the void action
    const { error: logError } = await supabase.from('audit_logs').insert({
      user_id: session.id,
      action: 'VOID_ITEM',
      detail: `Void item: ${validated.itemName} (${validated.itemQty}x @ Rp ${validated.itemPrice.toLocaleString('id-ID')}). Alasan: ${validated.reason}. Approved by: ${approver.name} (${approver.role})`,
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
