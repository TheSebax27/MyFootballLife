import { useEffect, useState } from 'react'
import { supabase } from '@/services/supabase/client'

/**
 * Returns the player/manager's current club for a given career.
 * Logic: latest transfer's to_club_name → fallback to career's own club_name.
 */
export function useCurrentClub(careerId: string, fallback: string | null): string {
  const [club, setClub] = useState<string>(fallback ?? '')

  useEffect(() => {
    if (!careerId) return
    supabase
      .from('transfers')
      .select('to_club_name')
      .eq('career_id', careerId)
      .not('to_club_name', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.to_club_name) {
          setClub(data.to_club_name)
        } else {
          setClub(fallback ?? '')
        }
      })
  }, [careerId, fallback])

  return club
}
