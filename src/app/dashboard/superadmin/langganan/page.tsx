'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/hooks/use-toast'
import { PLANS } from '@/lib/plans'

type Invoice = {
  id: string
  planCode: string
  amount: number
  months: number
  status: string
  paymentUrl: string | null
  createdAt: string
  periodEnd: string | null
}

type Data = {
  tenant: {
    plan: 'TRIAL' | 'PREMIUM'
    status: string
    trialEndsAt: string | null
    currentPeriodEnd: string | null
  }
  invoices: Invoice[]
}

export default function LanggananPage() {
  const { toast } = useToast()
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState<string | null>(null)

  const load = async () => {
    try {
      const res = await fetch('/api/billing/invoices')
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const checkout = async (plan: 'monthly' | 'quarterly') => {
    setCheckingOut(plan)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal membuat pembayaran')
      window.location.href = json.paymentUrl
    } catch (error) {
      toast({
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      })
      setCheckingOut(null)
    }
  }

  const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`
  const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString('id-ID') : '-')

  if (loading) return <LoadingSpinner />

  const tenant = data?.tenant

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-white">Langganan</h1>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-white/70">
          <div className="flex justify-between">
            <span>Paket</span>
            <span className="font-bold text-white">{tenant?.plan ?? '-'}</span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span className="font-bold text-white">{tenant?.status ?? '-'}</span>
          </div>
          <div className="flex justify-between">
            <span>{tenant?.plan === 'TRIAL' ? 'Trial berakhir' : 'Aktif sampai'}</span>
            <span className="font-bold text-white">
              {tenant?.plan === 'TRIAL' ? fmtDate(tenant.trialEndsAt) : fmtDate(tenant?.currentPeriodEnd ?? null)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {(['monthly', 'quarterly'] as const).map((code) => {
          const plan = PLANS[code]
          return (
            <Card key={code} className="border-amber-400/30">
              <CardContent className="space-y-3">
                <div className="text-sm font-bold text-amber-400 uppercase">Premium · {plan.label}</div>
                <div className="text-3xl font-black text-white">{rupiah(plan.amount)}</div>
                <Button
                  className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold"
                  disabled={checkingOut !== null}
                  onClick={() => checkout(code)}
                >
                  {checkingOut === code ? 'Memproses...' : 'Bayar & Perpanjang'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          {!data?.invoices.length ? (
            <p className="text-sm text-white/40">Belum ada pembayaran.</p>
          ) : (
            <div className="space-y-3">
              {data.invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-sm"
                >
                  <div>
                    <div className="font-semibold text-white">
                      {PLANS[inv.planCode as 'monthly' | 'quarterly']?.label ?? inv.planCode}
                    </div>
                    <div className="text-xs text-white/40">{fmtDate(inv.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">{rupiah(inv.amount)}</div>
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
                  {inv.status === 'pending' && inv.paymentUrl && (
                    <a
                      href={inv.paymentUrl}
                      className="ml-3 text-xs text-amber-400 hover:underline shrink-0"
                    >
                      Bayar
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
