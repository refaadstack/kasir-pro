import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type UserRole = 'SUPERADMIN' | 'MANAGER' | 'KASIR'

interface Profile {
  id: string
  name: string | null
  email: string
  role: UserRole
  isActive: boolean
}

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.email!)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.email!)
      else {
        setProfile(null)
        setRole(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (email: string) => {
    try {
      const res = await fetch(`/api/users/me?email=${email}`)
      const data = await res.json()
      setProfile(data)
      setRole(data.role)
    } catch (e) {
      console.error('Failed to fetch profile', e)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setRole(null)
    window.location.href = '/login'
  }

  return { user, profile, role, loading, signOut }
}