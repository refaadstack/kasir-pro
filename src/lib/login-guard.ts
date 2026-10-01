import { prisma } from './prisma'

export const MAX_LOGIN_ATTEMPTS = 5
export const LOCK_MINUTES = 15

export function isLocked(lockedUntil: Date | null): boolean {
  return !!lockedUntil && lockedUntil.getTime() > Date.now()
}

export function lockMessage(lockedUntil: Date | null): string {
  const minutes = lockedUntil
    ? Math.max(1, Math.ceil((lockedUntil.getTime() - Date.now()) / 60000))
    : LOCK_MINUTES
  return `Terlalu banyak percobaan. Coba lagi dalam ${minutes} menit.`
}

export async function registerFailedAttempt(userId: string, currentAttempts: number): Promise<void> {
  const attempts = currentAttempts + 1
  const data: { failedLoginAttempts: number; lockedUntil?: Date } = { failedLoginAttempts: attempts }
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    data.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
  }
  await prisma.user.update({ where: { id: userId }, data })
}

export async function resetLoginAttempts(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  })
}
