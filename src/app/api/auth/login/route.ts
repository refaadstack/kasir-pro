import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/jwt'
import { COOKIE_NAME } from '@/lib/auth'
import { verifyPassword } from '@/lib/password'
import { isLocked, lockMessage, registerFailedAttempt, resetLoginAttempts } from '@/lib/login-guard'

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 })
    }

    const { email, password } = validation.data

    const user = await prisma.user.findFirst({
      where: { email, isActive: true },
      include: { tenant: true },
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }

    if (isLocked(user.lockedUntil)) {
      return NextResponse.json({ error: lockMessage(user.lockedUntil) }, { status: 429 })
    }

    const valid = await verifyPassword(password, user.password)
    if (!valid) {
      await registerFailedAttempt(user.id, user.failedLoginAttempts)
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }

    if (!user.isPlatformAdmin && !user.emailVerifiedAt) {
      return NextResponse.json(
        { error: 'Email belum diverifikasi. Cek inbox untuk link verifikasi.' },
        { status: 403 }
      )
    }

    await resetLoginAttempts(user.id)

    const tenant = user.tenant
    const token = await signToken({
      id: user.id,
      name: user.name || '',
      email: user.email,
      username: user.username,
      role: user.role,
      tenantId: user.tenantId,
      plan: tenant?.plan || 'TRIAL',
      isPlatformAdmin: user.isPlatformAdmin,
    })

    const redirectMap: Record<string, string> = {
      KASIR: '/dashboard/kasir',
      MANAGER: '/dashboard/manager',
      SUPERADMIN: '/dashboard/superadmin',
    }
    const redirectTo = user.isPlatformAdmin
      ? '/dashboard/platform'
      : redirectMap[user.role] || '/dashboard/kasir'

    const response = NextResponse.json({ role: user.role, name: user.name, redirectTo })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
