import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendMail, verificationEmail } from '@/lib/mail'

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  pin: z.string().length(4, 'PIN harus 4 digit'),
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

    const { name, email, pin } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing && existing.emailVerifiedAt) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }

    const user = existing
      ? await prisma.user.update({ where: { email }, data: { name, pin } })
      : await prisma.user.create({
          data: { name, email, pin, role: 'SUPERADMIN', isActive: true },
        })

    const token = crypto.randomBytes(32).toString('hex')
    await prisma.emailVerification.create({
      data: { token, userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    })

    const url = `${appUrl()}/api/auth/verify?token=${token}`
    const mail = verificationEmail(name, url)
    try {
      await sendMail({ to: email, ...mail })
    } catch (error) {
      console.error('Verification email failed:', error)
    }

    return NextResponse.json({ success: true, message: 'Cek email untuk verifikasi.' }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
