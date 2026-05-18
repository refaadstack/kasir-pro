import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// Helper to generate transaction code based on settings
function generateTrxCode(prefix: string, format: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 5).toUpperCase()
  const date = new Date()
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`

  switch (format) {
    case 'PREFIX-DATE-RANDOM':
      return `${prefix}-${dateStr}-${random}`
    case 'PREFIX-RANDOM':
      return `${prefix}-${random}${Math.random().toString(36).substr(2, 3).toUpperCase()}`
    case 'PREFIX-TIMESTAMP-RANDOM':
    default:
      return `${prefix}-${timestamp}-${random}`
  }
}

// POST /api/transactions - Create new transaction
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      items,
      total,
      paymentMethod,
      amountPaid,
      change,
      taxAmount,
      serviceChargeAmount,
      discountAmount,
      discountCode,
      discountLabel,
      edcCode,
      grandTotal,
    } = body

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

    // Get settings for transaction code generation
    const { data: settings } = await supabase
      .from('store_settings')
      .select('receipt_prefix, trx_code_format')
      .limit(1)
      .maybeSingle()

    const prefix = settings?.receipt_prefix || 'TRX'
    const format = settings?.trx_code_format || 'PREFIX-TIMESTAMP-RANDOM'

    // Generate transaction code
    const code = generateTrxCode(prefix, format)

    // 1. Insert transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        trx_code: code,
        user_id: session.id,
        shift_id: activeShift.id,
        total_amount: grandTotal || total,
        subtotal_amount: total,
        tax_amount: taxAmount || 0,
        service_charge_amount: serviceChargeAmount || 0,
        discount_amount: discountAmount || 0,
        discount_code: discountCode || null,
        discount_label: discountLabel || null,
        edc_code: edcCode || null,
        payment_method: paymentMethod,
        cash_received: amountPaid || grandTotal || total,
        change_amount: change || 0,
        status: 'SUCCESS',
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Transaction insert error:', JSON.stringify(transactionError))
      return NextResponse.json(
        { error: 'Gagal membuat transaksi', detail: transactionError.message || transactionError.details || transactionError.hint || JSON.stringify(transactionError) },
        { status: 500 }
      )
    }

    // 2. Insert transaction items
    const transactionItems = items.map((item: { productId: string; productName: string; price: number; qty: number; subtotal: number; taxPercent?: number; taxAmount?: number }) => ({
      transaction_id: transaction.id,
      product_id: item.productId,
      product_name: item.productName,
      price_at_sale: item.price,
      qty: item.qty,
      tax_percent_at_sale: item.taxPercent || 0,
      tax_amount: item.taxAmount || 0,
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
    supabase.from('audit_logs').insert({
      user_id: session.id,
      action: 'CREATE_TRANSACTION',
      detail: `Total: Rp ${(grandTotal || total).toLocaleString('id-ID')}, Method: ${paymentMethod}${edcCode ? `, EDC: ${edcCode}` : ''}${discountCode ? `, Kupon: ${discountCode}` : ''}`,
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
    const withItems = searchParams.get('with_items') === 'true'

    let query = supabase
      .from('transactions')
      .select(withItems ? '*, items:transaction_items(*)' : '*')
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
