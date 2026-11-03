import { createContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/services/supabase/client'
import type { ProfileRow } from '@/types/database'

type ProfileContextValue = {
  profile: ProfileRow | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

export const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile() {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(data)
    setLoading(false)
  }

  async function refreshProfile() {
    setLoading(true)
    await fetchProfile()
  }

  useEffect(() => {
    setLoading(true)
    fetchProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}
