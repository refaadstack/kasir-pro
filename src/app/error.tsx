'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-app p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-400">Terjadi Kesalahan</CardTitle>
          <CardDescription>
            Aplikasi mengalami kesalahan yang tidak terduga.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-sm text-red-400 font-mono">
              {error.message || 'Unknown error'}
            </p>
            {error.digest && (
              <p className="text-xs text-red-400/60 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1 bg-amber-400 hover:bg-amber-500 text-gray-900">
              Coba Lagi
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <a href="/">Kembali ke Beranda</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
