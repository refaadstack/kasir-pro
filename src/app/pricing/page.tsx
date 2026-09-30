'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { PLANS } from '@/lib/plans'

type Me = { id: string; role: string } | null

export default function PricingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [me, setMe] = useState<Me>(null)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => setMe(null))
  }, [])

  const checkout = async (plan: 'monthly' | 'quarterly') => {
    if (!me) {
      router.push('/register')
      return
    }
    setLoadingPlan(plan)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal membuat pembayaran')
      window.location.href = data.paymentUrl
    } catch (error) {
      toast({
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      })
      setLoadingPlan(null)
    }
  }

  const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`

  return (
    <div className="min-h-screen bg-[#0f0f14] text-white p-6">
      <div className="max-w-4xl mx-auto py-10">
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-black">
            KASIR<span className="text-amber-400">PRO</span>
          </Link>
          <h1 className="text-3xl font-black mt-6">Harga Sederhana</h1>
          <p className="text-white/50 mt-2">Coba gratis 14 hari. Upgrade untuk tambah karyawan.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <Card className="border-white/10">
            <CardContent className="space-y-4">
              <div className="text-sm font-bold text-white/50 uppercase">Trial</div>
              <div className="text-3xl font-black">Gratis</div>
              <ul className="text-sm text-white/60 space-y-2">
                <li>14 hari penuh</li>
                <li>1 pengguna</li>
                <li>Produk & transaksi unlimited</li>
              </ul>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(me ? '/dashboard/superadmin' : '/register')}
              >
                {me ? 'Buka Dashboard' : 'Mulai Gratis'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-400/40 ring-1 ring-amber-400/30">
            <CardContent className="space-y-4">
              <div className="text-sm font-bold text-amber-400 uppercase">Premium · 1 Bulan</div>
              <div className="text-3xl font-black">{rupiah(PLANS.monthly.amount)}</div>
              <ul className="text-sm text-white/60 space-y-2">
                <li>Multi karyawan</li>
                <li>Produk & transaksi unlimited</li>
                <li>Semua fitur laporan</li>
              </ul>
              <Button
                className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold"
                disabled={loadingPlan !== null}
                onClick={() => checkout('monthly')}
              >
                {loadingPlan === 'monthly' ? 'Memproses...' : 'Pilih'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10">
            <CardContent className="space-y-4">
              <div className="text-sm font-bold text-white/50 uppercase">Premium · 3 Bulan</div>
              <div className="text-3xl font-black">{rupiah(PLANS.quarterly.amount)}</div>
              <div className="text-xs text-emerald-400">Hemat {rupiah(PLANS.monthly.amount * 3 - PLANS.quarterly.amount)}</div>
              <ul className="text-sm text-white/60 space-y-2">
                <li>Multi karyawan</li>
                <li>Produk & transaksi unlimited</li>
                <li>Semua fitur laporan</li>
              </ul>
              <Button
                className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold"
                disabled={loadingPlan !== null}
                onClick={() => checkout('quarterly')}
              >
                {loadingPlan === 'quarterly' ? 'Memproses...' : 'Pilih'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
