import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || !['SUPERADMIN', 'MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, phone, is_active')
      .order('created_at', { ascending: false })

    if (error) throw error

    const transformedUsers = users?.map(u => ({
      ...u,
      isActive: u.is_active,
    }))

    return NextResponse.json(transformedUsers || [])
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Gagal memuat users' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, email, pin, role, phone, isActive } = body

    if (!name || !email || !pin || !role) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    if (pin.length !== 4) {
      return NextResponse.json(
        { error: 'PIN harus 4 digit' },
        { status: 400 }
      )
    }

    // Cek email duplikat
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Email sudah digunakan' },
        { status: 400 }
      )
    }

    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        name,
        email,
        pin, // Plain text PIN
        role,
        phone: phone || null,
        is_active: isActive !== false,
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Gagal membuat user' },
      { status: 500 }
    )
  }
}
