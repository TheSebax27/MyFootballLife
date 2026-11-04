import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { CareerForm } from './_CareerForm'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/services/supabase/client'
import type { CareerFormValues } from '@/schemas/career'

type Mode = 'manager' | 'player'

function ModeSelector({ onSelect }: { onSelect: (mode: Mode) => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        to="/careers"
        className="mb-6 flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Volver a carreras
      </Link>

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Nueva carrera</h1>
        <p className="mt-2 text-sm text-muted-foreground">¿Cómo quieres jugar esta carrera?</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* DT Card */}
        <button
          type="button"
          onClick={() => onSelect('manager')}
          className="group relative overflow-hidden rounded-2xl border-2 border-transparent bg-card shadow-sm transition-all hover:border-primary hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="relative h-56 overflow-hidden bg-gradient-to-b from-primary/5 to-background">
            <img
              src="/images/dt.webp"
              alt="Director Técnico"
              className="h-full w-full object-contain object-bottom transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex items-center justify-between border-t bg-card px-5 py-4">
            <div className="text-left">
              <p className="text-lg font-bold">Director Técnico</p>
              <p className="text-xs text-muted-foreground">Gestiona tu club y conquista títulos</p>
            </div>
            <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent transition-all group-hover:ring-primary/30" />
        </button>

        {/* Jugador Card */}
        <button
          type="button"
          onClick={() => onSelect('player')}
          className="group relative overflow-hidden rounded-2xl border-2 border-transparent bg-card shadow-sm transition-all hover:border-primary hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="relative h-56 overflow-hidden bg-gradient-to-b from-primary/5 to-background">
            <img
              src="/images/jugador.webp"
              alt="Jugador"
              className="h-full w-full object-contain object-bottom transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex items-center justify-between border-t bg-card px-5 py-4">
            <div className="text-left">
              <p className="text-lg font-bold">Jugador</p>
              <p className="text-xs text-muted-foreground">Vive tu carrera como futbolista</p>
            </div>
            <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent transition-all group-hover:ring-primary/30" />
        </button>
      </div>
    </div>
  )
}

export function NewCareerPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  async function handleSubmit(values: CareerFormValues) {
    if (!user) return
    setServerError(null)

    const { data, error } = await supabase
      .from('careers')
      .insert({
        owner_id: user.id,
        game_id: values.game_id,
        name: values.name,
        mode: values.mode,
        manager_name: values.manager_name || null,
        nationality: values.nationality ? values.nationality.replace(/^\S+\s/, '') : null,
        league_name: values.league_name || null,
        club_name: values.club_name || null,
        start_year: values.start_year ? parseInt(values.start_year, 10) : null,
        description: values.description || null,
        visibility: values.visibility,
      })
      .select('id')
      .single()

    if (error) {
      setServerError('Ocurrió un error al crear la carrera. Intenta nuevamente.')
      return
    }

    navigate(`/careers/${data.id}`, { replace: true })
  }

  return (
    <AppShell>
      {mode === null ? (
        <ModeSelector onSelect={setMode} />
      ) : (
        <div className="mx-auto max-w-xl px-4 py-10">
          <button
            type="button"
            onClick={() => setMode(null)}
            className="mb-6 flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Cambiar modo
          </button>

          <div className="mb-6 flex items-center gap-3">
            <img
              src={mode === 'manager' ? '/images/dt.webp' : '/images/jugador.webp'}
              alt={mode === 'manager' ? 'DT' : 'Jugador'}
              className="size-12 rounded-lg object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Nueva carrera</h1>
              <p className="text-sm text-muted-foreground">
                Modo: <span className="font-medium text-foreground">{mode === 'manager' ? 'Director Técnico' : 'Jugador'}</span>
              </p>
            </div>
          </div>

          <CareerForm
            defaultValues={{ mode }}
            lockedMode
            onSubmit={handleSubmit}
            serverError={serverError}
            submitLabel="Crear carrera"
            onCancel={() => setMode(null)}
          />
        </div>
      )}
    </AppShell>
  )
}
