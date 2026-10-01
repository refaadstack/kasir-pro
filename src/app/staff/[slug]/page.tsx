import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import StaffLoginForm from './StaffLoginForm'

export const dynamic = 'force-dynamic'

export default async function StaffLoginPage({ params }: { params: { slug: string } }) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: params.slug } })
  if (!tenant) notFound()

  const session = await getSession()
  if (session && session.tenantId === tenant.id) {
    redirect(session.role === 'MANAGER' ? '/dashboard/manager' : '/dashboard/kasir')
  }

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
          <h1 className="text-xl font-black text-white">{tenant.name}</h1>
          <p className="text-white/40 text-sm mt-1">Login Karyawan · KasirPro</p>
        </div>
        <StaffLoginForm slug={tenant.slug} storeName={tenant.name} />
      </div>
    </div>
  )
}
