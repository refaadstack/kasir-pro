import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTenant } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireTenant()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { action, detail } = body

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    await prisma.auditLog.create({
      data: {
        userId: ctx.session.id,
        action,
        detail: detail || null,
        tenantId: ctx.tenant.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating log:', error)
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireTenant()
    if (!ctx || !['SUPERADMIN', 'MANAGER'].includes(ctx.session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '100')

    const logs = await prisma.auditLog.findMany({
      where: { tenantId: ctx.tenant.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const users = await prisma.user.findMany({
      where: { tenantId: ctx.tenant.id },
      select: { id: true, name: true },
    })
    const userMap = new Map(users.map((u) => [u.id, u.name]))

    const logsWithUser = logs.map((log) => ({
      ...log,
      user: { name: (log.userId && userMap.get(log.userId)) || 'System' },
    }))

    return NextResponse.json(logsWithUser)
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
