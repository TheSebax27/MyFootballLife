import { createContext, useEffect, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useGames } from '@/hooks/useGames'
import { supabase } from '@/services/supabase/client'
import type { CareerRow, GameRow } from '@/types/database'

export type CareerWithGame = CareerRow & { game: GameRow | undefined }

export const MODE_LABEL: Record<string, string> = {
  manager: 'Director Técnico',
  player: 'Jugador',
}

export const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'warning'> = {
  active: 'success',
  finished: 'secondary',
  archived: 'warning',
}

export const STATUS_LABEL: Record<string, string> = {
  active: 'Activa',
  finished: 'Finalizada',
  archived: 'Archivada',
}

type CareerContextValue = {
  career: CareerWithGame
  refreshCareer: () => Promise<void>
}

export const CareerContext = createContext<CareerContextValue | null>(null)

type CareerProviderProps = {
  children: ReactNode
  onNotFound: () => void
}

export function CareerProvider({ children, onNotFound }: CareerProviderProps) {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const games = useGames()
  const [career, setCareer] = useState<CareerWithGame | null>(null)
  const [loaded, setLoaded] = useState(false)

  async function fetchCareer() {
    if (!id || !user) return
    const { data } = await supabase
      .from('careers')
      .select('*')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single()
    if (!data) {
      onNotFound()
      return
    }
    setCareer({ ...data, game: games.find((g) => g.id === data.game_id) })
    setLoaded(true)
  }

  async function refreshCareer() {
    await fetchCareer()
  }

  useEffect(() => {
    setLoaded(false)
    fetchCareer()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id, games.length])

  if (!loaded || !career) return null

  return (
    <CareerContext.Provider value={{ career, refreshCareer }}>
      {children}
    </CareerContext.Provider>
  )
}
