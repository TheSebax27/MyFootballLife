import { useEffect, useState } from 'react'
import { supabase } from '@/services/supabase/client'
import type { GameRow } from '@/types/database'

export function useGames() {
  const [games, setGames] = useState<GameRow[]>([])

  useEffect(() => {
    supabase
      .from('games')
      .select('*')
      .order('name')
      .then(({ data }) => setGames(data ?? []))
  }, [])

  return games
}
