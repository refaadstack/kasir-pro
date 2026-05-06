import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'
import { signToken } from '@/lib/jwt'
import { COOKIE_NAME } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  pin: z.string().length(4, 'PIN harus 4 digit'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, pin } = validation.data

    // Query user dari database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Email atau PIN salah' },
        { status: 401 }
      )
    }

    // Cek PIN - support plain text dan bcrypt hash
    let pinValid = false
    
    if (user.pin.startsWith('$2b$') || user.pin.startsWith('$2a$')) {
      // PIN di-hash dengan bcrypt
      pinValid = await bcrypt.compare(pin, user.pin)
    } else {
      // PIN plain text
      pinValid = user.pin === pin
    }

    if (!pinValid) {
      return NextResponse.json(
        { error: 'Email atau PIN salah' },
        { status: 401 }
      )
    }

    // Sign JWT token
    const token = await signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })

    // Tentukan redirect berdasarkan role
    const redirectMap: Record<string, string> = {
      KASIR: '/dashboard/kasir',
      SUPERVISOR: '/dashboard/supervisor',
      SUPERADMIN: '/dashboard/superadmin',
      MANAGER: '/dashboard/supervisor', // MANAGER sama dengan SUPERVISOR
    }

    const response = NextResponse.json({
      role: user.role,
      name: user.name,
      redirectTo: redirectMap[user.role] || '/dashboard/kasir',
    })

    // Set cookie HttpOnly
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 jam
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
