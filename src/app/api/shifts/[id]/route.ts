import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

// PATCH - End a shift with closing cash drawer
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || !['KASIR', 'MANAGER', 'SUPERADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = params
    const body = await req.json().catch(() => ({}))

    const schema = z.object({
      closing_cash: z.number().min(0).default(0),
      closing_notes: z.string().optional(),
    })

    const validated = schema.parse(body)

    // Get shift data
    const { data: shift, error: shiftError } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', id)
      .single()

    if (shiftError || !shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    if (shift.end_time) {
      return NextResponse.json(
        { error: 'Shift sudah ditutup' },
        { status: 400 }
      )
    }

    // Calculate total sales and transactions for this shift
    const { data: transactions } = await supabase
      .from('transactions')
      .select('total_amount, payment_method')
      .eq('shift_id', id)
      .eq('status', 'SUCCESS')

    const totalSales = transactions?.reduce((sum, t) => sum + t.total_amount, 0) || 0
    const totalTransactions = transactions?.length || 0

    // Calculate cash sales only (TUNAI)
    const cashSales = transactions
      ?.filter(t => t.payment_method === 'TUNAI')
      .reduce((sum, t) => sum + t.total_amount, 0) || 0

    // Expected cash = opening cash + cash sales
    const expectedCash = (shift.opening_cash || 0) + cashSales
    const cashDifference = validated.closing_cash - expectedCash

    // End the shift
    const { data: updatedShift, error: updateError } = await supabase
      .from('shifts')
      .update({
        end_time: new Date().toISOString(),
        total_sales: totalSales,
        total_transactions: totalTransactions,
        closing_cash: validated.closing_cash,
        expected_cash: expectedCash,
        cash_difference: cashDifference,
        closing_notes: validated.closing_notes || null,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Update shift error:', JSON.stringify(updateError))
      return NextResponse.json(
        { error: 'Failed to end shift', detail: updateError.message },
        { status: 500 }
      )
    }

    // Log activity
    supabase.from('activity_logs').insert({
      user_id: session.id,
      user_name: session.name,
      action: 'CLOSE_DRAWER',
      target: session.name,
      detail: `Tutup shift - ${totalTransactions} transaksi, Rp ${totalSales.toLocaleString('id-ID')}`,
    }).then(() => {})

    return NextResponse.json(updatedShift)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error ending shift:', error)
    return NextResponse.json(
      { error: 'Failed to end shift' },
      { status: 500 }
    )
  }
}

// GET - Get shift detail
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const { data: shift, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    return NextResponse.json(shift)
  } catch (error) {
    console.error('Error fetching shift:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shift' },
      { status: 500 }
    )
  }
}
