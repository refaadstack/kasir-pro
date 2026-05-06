import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// PATCH - End a shift
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || !['KASIR', 'SUPERVISOR', 'MANAGER', 'SUPERADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = params

    // Get shift data
    const { data: shift, error: shiftError } = await supabase
      .from('shifts')
      .select(`
        *,
        kasir:users!shifts_kasir_id_fkey(id, name, email)
      `)
      .eq('id', id)
      .single()

    if (shiftError || !shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    if (shift.ended_at) {
      return NextResponse.json(
        { error: 'Shift sudah ditutup' },
        { status: 400 }
      )
    }

    // Calculate total sales and transactions for this shift
    const { data: transactions } = await supabase
      .from('transactions')
      .select('total')
      .eq('shift_id', id)
      .eq('status', 'COMPLETED')

    const totalSales = transactions?.reduce((sum, t) => sum + t.total, 0) || 0
    const totalTransactions = transactions?.length || 0

    // End the shift
    const { data: updatedShift, error: updateError } = await supabase
      .from('shifts')
      .update({
        ended_at: new Date().toISOString(),
        total_sales: totalSales,
        total_transactions: totalTransactions,
      })
      .eq('id', id)
      .select(`
        *,
        kasir:users!shifts_kasir_id_fkey(id, name, email)
      `)
      .single()

    if (updateError) throw updateError

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: session.id,
      user_name: session.name,
      action: 'END_SHIFT',
      target: shift.kasir.name,
      detail: `Shift ditutup - ${totalTransactions} transaksi, ${new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(totalSales)}`,
    })

    return NextResponse.json(updatedShift)
  } catch (error) {
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
      .select(`
        *,
        kasir:users!shifts_kasir_id_fkey(id, name, email)
      `)
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
