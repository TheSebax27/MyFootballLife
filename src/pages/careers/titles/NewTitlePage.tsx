import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { TitleForm } from './_TitleForm'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import type { TitleFormValues } from '@/schemas/title'
import type { SeasonRow } from '@/types/database'
import { Button } from '@/components/ui/button'

export function NewTitlePage() {
  const { career } = useCareer()
  const navigate = useNavigate()
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('seasons')
      .select('*')
      .eq('career_id', career.id)
      .order('start_year', { ascending: true })
      .then(({ data }) => {
        setSeasons(data ?? [])
        setLoading(false)
      })
  }, [career.id])

  async function onSubmit(values: TitleFormValues) {
    setServerError(null)
    const { data, error } = await supabase
      .from('career_titles')
      .insert({
        career_id: career.id,
        season_id: values.season_id,
        competition_name: values.competition_name,
        club_name: values.club_name || null,
        notes: values.notes || null,
      })
      .select('id')
      .single()

    if (error) {
      setServerError('No se pudo guardar el título. Inténtalo de nuevo.')
      return
    }
    navigate(`/careers/${career.id}/titles/${data.id}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (seasons.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="mb-4 text-muted-foreground">Necesitas al menos una temporada para registrar un título.</p>
        <Button asChild>
          <Link to={`/careers/${career.id}/seasons/new`}>Crear temporada</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Volver
      </button>

      <h1 className="mb-1 text-2xl font-bold tracking-tight">Añadir título</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Carrera: <span className="font-medium text-foreground">{career.name}</span>
      </p>

      <TitleForm
        seasons={seasons}
        onSubmit={onSubmit}
        serverError={serverError}
        submitLabel="Añadir título"
        onCancel={() => navigate(-1)}
      />
    </div>
  )
}
