import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-app p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-400">Akses Ditolak</CardTitle>
          <CardDescription>
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-white/60">
            Halaman yang Anda coba akses memerlukan level akses yang lebih tinggi.
            Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.
          </p>
          <div className="flex gap-2">
            <Button asChild className="flex-1 bg-amber-400 hover:bg-amber-500 text-gray-900">
              <Link href="/dashboard/kasir">Kembali ke Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/api/auth/logout">Logout</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
