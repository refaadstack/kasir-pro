import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import LoginForm from './LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { verified?: string; error?: string }
}) {
  const session = await getSession()

  // Redirect jika sudah login
  if (session) {
    if (session.isPlatformAdmin) redirect('/dashboard/platform')
    const redirectMap: Record<string, string> = {
      KASIR: '/dashboard/kasir',
      MANAGER: '/dashboard/manager',
      SUPERADMIN: '/dashboard/superadmin',
    }
    redirect(redirectMap[session.role] || '/dashboard/kasir')
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.08) 0%, transparent 55%), #0f0f14'
      }}
    >
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 flex items-center justify-center mx-auto mb-4 glow-amber">
            <span className="text-gray-900 text-3xl font-black">⬡</span>
          </div>
          <h1 className="text-2xl font-black">
            KASIR<span className="text-amber-400">PRO</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Sistem Point of Sale</p>
        </div>

        {searchParams.verified && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm text-center">
            Email terverifikasi. Silakan login.
          </div>
        )}
        {searchParams.error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center">
            {searchParams.error === 'expired'
              ? 'Link verifikasi kedaluwarsa. Minta link baru.'
              : 'Link verifikasi tidak valid.'}
          </div>
        )}

        <LoginForm />

        <p className="text-center text-sm text-white/40 mt-5">
          Belum punya akun?{' '}
          <Link href="/register" className="text-amber-400 hover:underline">
            Daftar gratis
          </Link>
        </p>
        <p className="text-center text-sm text-white/40 mt-2">
          Karyawan?{' '}
          <Link href={'/staff' as any} className="text-amber-400 hover:underline">
            Login Karyawan
          </Link>
        </p>
      </div>
    </div>
  )
}
