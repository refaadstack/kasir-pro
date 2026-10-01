import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/jwt'
import { COOKIE_NAME } from '@/lib/auth'
import { verifyPin } from '@/lib/password'
import { isLocked, lockMessage, registerFailedAttempt, resetLoginAttempts } from '@/lib/login-guard'

const schema = z.object({
  slug: z.string().min(1),
  username: z.string().min(1, 'Username wajib diisi'),
  pin: z.string().length(4, 'PIN harus 4 digit'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { slug, username, pin } = parsed.data

    const tenant = await prisma.tenant.findUnique({ where: { slug } })
    if (!tenant) {
      return NextResponse.json({ error: 'Username atau PIN salah' }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        username,
        isActive: true,
        role: { in: ['MANAGER', 'KASIR'] },
      },
    })

    if (!user || !user.pin) {
      return NextResponse.json({ error: 'Username atau PIN salah' }, { status: 401 })
    }

    if (isLocked(user.lockedUntil)) {
      return NextResponse.json({ error: lockMessage(user.lockedUntil) }, { status: 429 })
    }

    const valid = await verifyPin(pin, user.pin)
    if (!valid) {
      await registerFailedAttempt(user.id, user.failedLoginAttempts)
      return NextResponse.json({ error: 'Username atau PIN salah' }, { status: 401 })
    }

    await resetLoginAttempts(user.id)

    const token = await signToken({
      id: user.id,
      name: user.name || '',
      email: user.email,
      username: user.username,
      role: user.role,
      tenantId: tenant.id,
      plan: tenant.plan,
      isPlatformAdmin: false,
    })

    const redirectMap: Record<string, string> = {
      KASIR: '/dashboard/kasir',
      MANAGER: '/dashboard/manager',
    }

    const response = NextResponse.json({
      role: user.role,
      name: user.name,
      redirectTo: redirectMap[user.role] || '/dashboard/kasir',
    })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 12,
      path: '/',
    })
    return response
  } catch (error) {
    console.error('Staff login error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
