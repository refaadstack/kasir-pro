'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { AlertTriangle, Sparkles } from 'lucide-react'

export function TrialBanner() {
  const { user } = useAuth()
  const tenant = user?.tenant
  if (!tenant) return null

  if (tenant.status === 'expired') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border-b border-red-500/30 text-red-300 text-sm">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span className="flex-1">Langganan berakhir. Perpanjang untuk melanjutkan.</span>
        <Link
          href="/dashboard/superadmin/langganan"
          className="shrink-0 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold"
        >
          Perpanjang
        </Link>
      </div>
    )
  }

  if (tenant.plan === 'TRIAL') {
    const days = tenant.trialEndsAt
      ? Math.max(0, Math.ceil((new Date(tenant.trialEndsAt).getTime() - Date.now()) / 86400000))
      : 0
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-amber-400/10 border-b border-amber-400/30 text-amber-200 text-sm">
        <Sparkles className="w-4 h-4 shrink-0" />
        <span className="flex-1">
          Masa trial: <strong>{days} hari</strong> lagi · 1 pengguna.
        </span>
        <Link
          href="/dashboard/superadmin/langganan"
          className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-400 text-gray-900 text-xs font-bold"
        >
          Upgrade
        </Link>
      </div>
    )
  }

  return null
}
