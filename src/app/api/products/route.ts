import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories!category_id(name)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform data untuk match dengan tipe frontend
    const transformedProducts = products?.map(p => ({
      ...p,
      categoryId: p.category_id,
      isActive: p.is_active,
      category: p.category ? { name: p.category.name } : null,
    }))

    return NextResponse.json(transformedProducts || [])
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Gagal memuat produk' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !['SUPERADMIN', 'MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, sku, price, stock, categoryId, emoji, isActive, tax_percent } = body

    // Validasi
    if (!name || !sku || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    // Cek SKU duplikat
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('sku', sku)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'SKU sudah digunakan' },
        { status: 400 }
      )
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert([{
        name,
        sku,
        price: parseFloat(price),
        stock: parseInt(stock),
        category_id: categoryId || null,
        emoji: emoji || '📦',
        is_active: isActive !== false,
        tax_percent: parseFloat(tax_percent) || 0,
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Gagal membuat produk' },
      { status: 500 }
    )
  }
}
