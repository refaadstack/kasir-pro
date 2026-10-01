import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword, verifyPin } from '@/lib/password'

describe('password', () => {
  it('hashes and verifies a password', async () => {
    const hash = await hashPassword('secret123')
    expect(hash).not.toBe('secret123')
    expect(await verifyPassword('secret123', hash)).toBe(true)
    expect(await verifyPassword('wrong', hash)).toBe(false)
  })

  it('verifies plain and bcrypt PINs', async () => {
    expect(await verifyPin('1234', '1234')).toBe(true)
    expect(await verifyPin('9999', '1234')).toBe(false)
    const hash = await hashPassword('4321')
    expect(await verifyPin('4321', hash)).toBe(true)
    expect(await verifyPin('0000', hash)).toBe(false)
  })
})
