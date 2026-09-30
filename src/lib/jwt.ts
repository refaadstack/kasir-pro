import { SignJWT, jwtVerify } from 'jose'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables')
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export type JWTPayload = {
  id: string
  name: string
  email: string
  role: 'KASIR' | 'MANAGER' | 'SUPERADMIN'
  tenantId: string | null
  plan: 'TRIAL' | 'PREMIUM'
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}
