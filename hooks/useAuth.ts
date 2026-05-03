import { useAuth as useSupabaseAuth } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

export function useAuth() {
  const supabaseAuth = useSupabaseAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch profile from Supabase or Prisma
  }, [supabaseAuth.user])

  return {
    user: supabaseAuth.user,
    profile,
    loading,
    signOut: supabaseAuth.signOut,
  }
}

