import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendMail, verificationEmail } from '@/lib/mail'
import { hashPassword } from '@/lib/password'

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing && existing.emailVerifiedAt) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)

    const user = existing
      ? await prisma.user.update({ where: { email }, data: { name, password: passwordHash } })
      : await prisma.user.create({
          data: { name, email, password: passwordHash, role: 'SUPERADMIN', isActive: true },
        })

    const token = crypto.randomBytes(32).toString('hex')
    await prisma.emailVerification.create({
      data: { token, userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    })

    const url = `${appUrl()}/api/auth/verify?token=${token}`
    try {
      await sendMail({ to: email, ...verificationEmail(name, url) })
    } catch (error) {
      console.error('Verification email failed:', error)
    }

    return NextResponse.json({ success: true, message: 'Cek email untuk verifikasi.' }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
