'use client'
import { useAuth } from '@/context/AuthContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-app-bg">
      {children}
    </div>
  )
}