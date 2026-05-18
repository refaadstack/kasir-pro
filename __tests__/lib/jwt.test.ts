import { describe, it, expect, beforeAll } from 'vitest'
import { signToken, verifyToken } from '@/lib/jwt'

describe('JWT Functions', () => {
  let validToken: string

  beforeAll(async () => {
    // Create a valid token for testing
    validToken = await signToken({
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'KASIR',
    })
  })

  describe('signToken', () => {
    it('should generate a valid JWT token', async () => {
      const token = await signToken({
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'KASIR',
      })

      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should generate different tokens for different payloads', async () => {
      const token1 = await signToken({
        id: '123',
        name: 'User 1',
        email: 'user1@example.com',
        role: 'KASIR',
      })

      const token2 = await signToken({
        id: '456',
        name: 'User 2',
        email: 'user2@example.com',
        role: 'SUPERADMIN',
      })

      expect(token1).not.toBe(token2)
    })
  })

  describe('verifyToken', () => {
    it('should verify and decode a valid token', async () => {
      const payload = await verifyToken(validToken)

      expect(payload).toBeTruthy()
      expect(payload?.id).toBe('123')
      expect(payload?.name).toBe('Test User')
      expect(payload?.email).toBe('test@example.com')
      expect(payload?.role).toBe('KASIR')
    })

    it('should return null for invalid token', async () => {
      const payload = await verifyToken('invalid.token.here')

      expect(payload).toBeNull()
    })

    it('should return null for malformed token', async () => {
      const payload = await verifyToken('not-a-jwt-token')

      expect(payload).toBeNull()
    })

    it('should return null for empty token', async () => {
      const payload = await verifyToken('')

      expect(payload).toBeNull()
    })
  })
})
