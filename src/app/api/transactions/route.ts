import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// POST /api/transactions - Create new transaction
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { items, total, paymentMethod, amountPaid, change } = body

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items wajib diisi' }, { status: 400 })
    }

    if (!total || !paymentMethod) {
      return NextResponse.json({ error: 'Total dan metode pembayaran wajib diisi' }, { status: 400 })
    }

    // Get active shift for this user
    const { data: activeShift } = await supabase
      .from('shifts')
      .select('id')
      .eq('user_id', session.id)
      .is('end_time', null)
      .maybeSingle()

    if (!activeShift) {
      return NextResponse.json(
        { error: 'Tidak ada shift aktif. Buka shift terlebih dahulu.' },
        { status: 400 }
      )
    }

    // Generate transaction code
    const code = `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // 1. Insert transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        trx_code: code,
        user_id: session.id,
        shift_id: activeShift.id,
        total_amount: total,
        payment_method: paymentMethod,
        cash_received: amountPaid || total,
        change_amount: change || 0,
        status: 'COMPLETED',
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Transaction insert error:', JSON.stringify(transactionError))
      return NextResponse.json(
        { error: 'Gagal membuat transaksi', detail: transactionError.message },
        { status: 500 }
      )
    }

    // 2. Insert transaction items
    const transactionItems = items.map((item: { productId: string; productName: string; price: number; qty: number; subtotal: number }) => ({
      transaction_id: transaction.id,
      product_id: item.productId,
      price_at_sale: item.price,
      qty: item.qty,
      subtotal: item.subtotal,
    }))

    const { error: itemsError } = await supabase
      .from('transaction_items')
      .insert(transactionItems)

    if (itemsError) {
      console.error('Transaction items error:', JSON.stringify(itemsError))
      // Rollback transaction
      await supabase.from('transactions').delete().eq('id', transaction.id)
      return NextResponse.json(
        { error: 'Gagal menyimpan item transaksi', detail: itemsError.message },
        { status: 500 }
      )
    }

    // 3. Update product stock
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.productId)
        .single()

      if (product) {
        await supabase
          .from('products')
          .update({
            stock: Math.max(0, product.stock - item.qty),
          })
          .eq('id', item.productId)
      }
    }

    // 4. Log activity (fire and forget)
    supabase.from('activity_logs').insert({
      user_id: session.id,
      user_name: session.name,
      action: 'CREATE_TRANSACTION',
      target: code,
      detail: `Total: Rp ${total.toLocaleString('id-ID')}, Method: ${paymentMethod}`,
    }).then(() => {})

    return NextResponse.json({
      success: true,
      code: transaction.trx_code,
      id: transaction.id,
    })
  } catch (error) {
    console.error('Transaction error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// GET /api/transactions - Get all transactions
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const shiftId = searchParams.get('shift_id')
    const paymentMethodFilter = searchParams.get('payment_method')

    let query = supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    if (shiftId) {
      query = query.eq('shift_id', shiftId)
    }

    if (paymentMethodFilter) {
      query = query.eq('payment_method', paymentMethodFilter)
    }

    // If KASIR role, only show their own transactions
    if (session.role === 'KASIR') {
      query = query.eq('user_id', session.id)
    }

    const { data, error } = await query

    if (error) {
      console.error('Get transactions error:', JSON.stringify(error))
      return NextResponse.json(
        { error: 'Gagal memuat transaksi', detail: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
