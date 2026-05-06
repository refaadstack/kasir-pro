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
      return NextResponse.json({ error: 'Items required' }, { status: 400 })
    }

    if (!total || !paymentMethod) {
      return NextResponse.json({ error: 'Total and payment method required' }, { status: 400 })
    }

    // Generate transaction code
    const code = `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Start transaction
    // 1. Insert transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        code,
        kasir_id: session.id,
        total,
        payment_method: paymentMethod,
        amount_paid: amountPaid || total,
        change: change || 0,
        status: 'COMPLETED',
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Transaction error:', transactionError)
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
    }

    // 2. Insert transaction items
    const transactionItems = items.map((item: any) => ({
      transaction_id: transaction.id,
      product_id: item.productId,
      product_name: item.productName,
      price: item.price,
      qty: item.qty,
      subtotal: item.subtotal,
    }))

    const { error: itemsError } = await supabase
      .from('transaction_items')
      .insert(transactionItems)

    if (itemsError) {
      console.error('Transaction items error:', itemsError)
      // Rollback transaction
      await supabase.from('transactions').delete().eq('id', transaction.id)
      return NextResponse.json({ error: 'Failed to create transaction items' }, { status: 500 })
    }

    // 3. Update product stock and total_sold
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('stock, total_sold')
        .eq('id', item.productId)
        .single()

      if (product) {
        await supabase
          .from('products')
          .update({
            stock: Math.max(0, product.stock - item.qty),
            total_sold: (product.total_sold || 0) + item.qty,
          })
          .eq('id', item.productId)
      }
    }

    // 4. Log activity
    await supabase.from('activity_logs').insert({
      user_id: session.id,
      user_name: session.name,
      action: 'CREATE_TRANSACTION',
      target: code,
      detail: `Total: Rp ${total.toLocaleString('id-ID')}, Method: ${paymentMethod}`,
    })

    return NextResponse.json({
      success: true,
      code: transaction.code,
      id: transaction.id,
    })
  } catch (error) {
    console.error('Transaction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

    let query = supabase
      .from('transactions')
      .select(`
        *,
        kasir:users!kasir_id(name, email),
        items:transaction_items(*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    // If KASIR role, only show their own transactions
    if (session.role === 'KASIR') {
      query = query.eq('kasir_id', session.id)
    }

    const { data, error } = await query

    if (error) {
      console.error('Get transactions error:', error)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
