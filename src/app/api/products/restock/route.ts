import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

// POST /api/products/restock - Add stock to existing product
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const schema = z.object({
      product_id: z.string(),
      qty: z.number().min(1, 'Jumlah minimal 1'),
      notes: z.string().optional(),
    })

    const validated = schema.parse(body)

    // Get current stock
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, name, stock')
      .eq('id', validated.product_id)
      .single()

    if (fetchError || !product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    }

    // Update stock (add to existing)
    const newStock = product.stock + validated.qty

    const { data: updated, error: updateError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', validated.product_id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Gagal update stok', detail: updateError.message },
        { status: 500 }
      )
    }

    // Log activity
    supabase.from('audit_logs').insert({
      user_id: session.id,
      action: 'RESTOCK',
      detail: `${product.name}: +${validated.qty} (${product.stock} → ${newStock})${validated.notes ? ' | ' + validated.notes : ''}`,
    }).then(() => {})

    return NextResponse.json({
      success: true,
      product: updated,
      previousStock: product.stock,
      addedQty: validated.qty,
      newStock,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    console.error('Restock error:', error)
    return NextResponse.json(
      { error: 'Gagal restock', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
