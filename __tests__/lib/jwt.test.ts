import { describe, it, expect } from 'vitest'
import { signToken, verifyToken } from '@/lib/jwt'

describe('JWT Helper', () => {
  const mockPayload = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'KASIR' as const,
  }

  it('should sign a token successfully', async () => {
    const token = await signToken(mockPayload)
    expect(token).toBeTruthy()
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3) // JWT format: header.payload.signature
  })

  it('should verify a valid token and return payload', async () => {
    const token = await signToken(mockPayload)
    const payload = await verifyToken(token)

    expect(payload).toBeTruthy()
    expect(payload?.id).toBe(mockPayload.id)
    expect(payload?.name).toBe(mockPayload.name)
    expect(payload?.email).toBe(mockPayload.email)
    expect(payload?.role).toBe(mockPayload.role)
  })

  it('should return null for invalid token', async () => {
    const payload = await verifyToken('invalid.token.here')
    expect(payload).toBeNull()
  })

  it('should return null for expired token', async () => {
    // Token yang sudah expired (dibuat dengan exp di masa lalu)
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsIm5hbWUiOiJUZXN0IFVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiS0FTSVIiLCJpYXQiOjE2MDk0NTkyMDAsImV4cCI6MTYwOTQ1OTIwMX0.invalid'
    const payload = await verifyToken(expiredToken)
    expect(payload).toBeNull()
  })

  it('should return null for tampered token', async () => {
    const token = await signToken(mockPayload)
    // Ubah sedikit token untuk simulasi tampering
    const tamperedToken = token.slice(0, -5) + 'xxxxx'
    const payload = await verifyToken(tamperedToken)
    expect(payload).toBeNull()
  })
})
