import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

// POST - Void a transaction
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || !['MANAGER', 'SUPERADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = params
    const body = await req.json()
    
    const schema = z.object({
      reason: z.string().min(5, 'Alasan minimal 5 karakter'),
      pin: z.string().length(4, 'PIN harus 4 digit'),
    })

    const validated = schema.parse(body)

    // Verify PIN
    const { data: user } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('id', session.id)
      .eq('pin', validated.pin)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'PIN salah' }, { status: 403 })
    }

    // Get transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*, items:transaction_items(*)')
      .eq('id', id)
      .single()

    if (txError || !transaction) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 })
    }

    if (transaction.status === 'VOID') {
      return NextResponse.json({ error: 'Transaksi sudah dibatalkan' }, { status: 400 })
    }

    // Void transaction
    const { data: voidedTx, error: voidError } = await supabase
      .from('transactions')
      .update({
        status: 'VOID',
        void_reason: validated.reason,
        void_by: session.id,
        void_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (voidError) throw voidError

    // Restore stock for each item
    for (const item of transaction.items) {
      await supabase.rpc('increment_stock', {
        product_id: item.product_id,
        qty: item.qty,
      })
    }

    // Log activity
    await supabase.from('audit_logs').insert({
      user_id: session.id,
      action: 'VOID_TRANSACTION',
      detail: `Alasan: ${validated.reason}`,
    })

    return NextResponse.json(voidedTx)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error voiding transaction:', error)
    return NextResponse.json(
      { error: 'Failed to void transaction' },
      { status: 500 }
    )
  }
}
