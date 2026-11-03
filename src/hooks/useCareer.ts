import { useContext } from 'react'
import { CareerContext } from '@/contexts/CareerContext'

export function useCareer() {
  const ctx = useContext(CareerContext)
  if (!ctx) throw new Error('useCareer debe usarse dentro de CareerProvider')
  return ctx
}
