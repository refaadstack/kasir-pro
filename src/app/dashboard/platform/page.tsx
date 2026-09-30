'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

type Stats = {
  totalTenants: number
  trialing: number
  active: number
  expired: number
  revenue: number
}

type Tenant = {
  id: string
  name: string
  slug: string
  plan: 'TRIAL' | 'PREMIUM'
  status: string
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  owner: { name: string | null; email: string } | null
  counts: { users: number; transactions: number; products: number }
}

type Invoice = {
  id: string
  planCode: string
  amount: number
  status: string
  createdAt: string
  tenant: { name: string }
}

export default function PlatformPage() {
  const { toast } = useToast()
  const { logout } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const load = async () => {
    try {
      const [s, t, i] = await Promise.all([
        fetch('/api/platform/stats').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/platform/tenants').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/platform/invoices').then((r) => (r.ok ? r.json() : [])),
      ])
      setStats(s)
      setTenants(t)
      setInvoices(i)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const act = async (id: string, action: string, months?: number) => {
    setBusy(id)
    try {
      const res = await fetch(`/api/platform/tenants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, months }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal')
      await load()
      toast({ title: 'Berhasil', description: 'Tenant diperbarui' })
    } catch (error) {
      toast({
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      })
    } finally {
      setBusy(null)
    }
  }

  const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString('id-ID') : '-')

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-[#0f0f14] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">
              Platform <span className="text-amber-400">Admin</span>
            </h1>
            <p className="text-white/40 text-sm">Kelola tenant & langganan KasirPro</p>
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total Tenant', value: stats?.totalTenants ?? 0 },
            { label: 'Aktif', value: stats?.active ?? 0 },
            { label: 'Trial', value: stats?.trialing ?? 0 },
            { label: 'Expired', value: stats?.expired ?? 0 },
            { label: 'Pendapatan', value: rupiah(stats?.revenue ?? 0) },
          ].map((c) => (
            <Card key={c.label} className="border-white/10">
              <CardContent className="p-4">
                <div className="text-xs text-white/40 uppercase">{c.label}</div>
                <div className="text-xl font-black mt-1">{c.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-white/10">
          <CardHeader>
            <CardTitle>Tenant</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/40 border-b border-white/10">
                  <th className="py-2 pr-3">Toko</th>
                  <th className="py-2 pr-3">Owner</th>
                  <th className="py-2 pr-3">Plan</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Berakhir</th>
                  <th className="py-2 pr-3">Stat</th>
                  <th className="py-2 pr-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id} className="border-b border-white/5 align-top">
                    <td className="py-3 pr-3">
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-xs text-white/40">{t.slug}</div>
                    </td>
                    <td className="py-3 pr-3 text-white/60">
                      <div>{t.owner?.name || '-'}</div>
                      <div className="text-xs text-white/40">{t.owner?.email}</div>
                    </td>
                    <td className="py-3 pr-3">
                      <span className={t.plan === 'PREMIUM' ? 'text-amber-400' : 'text-white/60'}>{t.plan}</span>
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={
                          t.status === 'active'
                            ? 'text-emerald-400'
                            : t.status === 'trialing'
                              ? 'text-amber-400'
                              : 'text-red-400'
                        }
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-white/60">
                      {t.plan === 'TRIAL' ? fmt(t.trialEndsAt) : fmt(t.currentPeriodEnd)}
                    </td>
                    <td className="py-3 pr-3 text-xs text-white/40">
                      {t.counts.users}u · {t.counts.products}p · {t.counts.transactions}t
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex flex-wrap gap-1">
                        <Button size="sm" variant="outline" disabled={busy === t.id} onClick={() => act(t.id, 'activate')}>
                          Aktifkan
                        </Button>
                        <Button size="sm" variant="outline" disabled={busy === t.id} onClick={() => act(t.id, 'extend', 1)}>
                          +1bln
                        </Button>
                        <Button size="sm" variant="outline" disabled={busy === t.id} onClick={() => act(t.id, 'extend', 3)}>
                          +3bln
                        </Button>
                        <Button size="sm" variant="outline" disabled={busy === t.id} onClick={() => act(t.id, 'suspend')}>
                          Suspend
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tenants.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-white/40">
                      Belum ada tenant.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-white/10">
          <CardHeader>
            <CardTitle>Invoice Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-white/40">Belum ada invoice.</p>
            ) : (
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-sm">
                    <div>
                      <div className="font-semibold">{inv.tenant?.name}</div>
                      <div className="text-xs text-white/40">
                        {inv.planCode} · {fmt(inv.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{rupiah(inv.amount)}</div>
                      <div
                        className={
                          inv.status === 'paid'
                            ? 'text-xs text-emerald-400'
                            : inv.status === 'pending'
                              ? 'text-xs text-amber-400'
                              : 'text-xs text-red-400'
                        }
                      >
                        {inv.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
