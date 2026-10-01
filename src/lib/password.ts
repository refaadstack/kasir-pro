import bcrypt from 'bcryptjs'

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  if (stored.startsWith('$2b$') || stored.startsWith('$2a$')) {
    return bcrypt.compare(pin, stored)
  }
  return stored === pin
}
