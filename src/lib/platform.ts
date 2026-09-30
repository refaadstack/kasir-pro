import { getSession } from './auth'
import { JWTPayload } from './jwt'

export async function requirePlatformAdmin(): Promise<JWTPayload | null> {
  const session = await getSession()
  if (!session || !session.isPlatformAdmin) return null
  return session
}
