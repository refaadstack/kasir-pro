import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      jwt_secret: !!process.env.JWT_SECRET,
      database: false,
    },
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.checks.database = true
  } catch (error) {
    console.error('Database check failed:', error)
    checks.checks.database = false
  }

  const allChecksPass = checks.checks.jwt_secret && checks.checks.database

  return NextResponse.json(
    { status: allChecksPass ? 'healthy' : 'unhealthy', ...checks },
    { status: allChecksPass ? 200 : 503 }
  )
}
