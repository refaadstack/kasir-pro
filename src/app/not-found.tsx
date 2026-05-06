import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-app p-4">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-black text-white/10">404</h1>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white">Halaman Tidak Ditemukan</h2>
          <p className="text-white/60">
            Halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>
        <Button asChild size="lg" className="bg-amber-400 hover:bg-amber-500 text-gray-900">
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  )
}
