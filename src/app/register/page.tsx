import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import RegisterForm from './RegisterForm'

export default async function RegisterPage() {
  const session = await getSession()
  if (session) redirect('/dashboard/superadmin')

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.08) 0%, transparent 55%), #0f0f14',
      }}
    >
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 flex items-center justify-center mx-auto mb-4 glow-amber">
            <span className="text-gray-900 text-3xl font-black">⬡</span>
          </div>
          <h1 className="text-2xl font-black">
            KASIR<span className="text-amber-400">PRO</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Daftar & coba gratis 14 hari</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
