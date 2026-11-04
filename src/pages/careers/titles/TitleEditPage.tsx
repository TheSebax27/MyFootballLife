import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { TitleForm } from './_TitleForm'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import type { TitleFormValues } from '@/schemas/title'
import type { SeasonRow } from '@/types/database'

export function TitleEditPage() {
  const { career } = useCareer()
  const { titleId } = useParams<{ titleId: string }>()
  const navigate = useNavigate()
  const [titleData, setTitleData] = useState<Record<string, unknown> | null>(null)
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (!titleId) return
    Promise.all([
      supabase.from('career_titles').select('*').eq('id', titleId).eq('career_id', career.id).single(),
      supabase.from('seasons').select('*').eq('career_id', career.id).order('start_year', { ascending: true }),
    ]).then(([{ data: t }, { data: s }]) => {
      if (!t) { navigate(`/careers/${career.id}/titles`, { replace: true }); return }
      setTitleData(t)
      setSeasons(s ?? [])
      setLoading(false)
    })
  }, [titleId, career.id])

  async function onSubmit(values: TitleFormValues) {
    if (!titleId) return
    setServerError(null)
    const { error } = await supabase
      .from('career_titles')
      .update({
        season_id: values.season_id,
        competition_name: values.competition_name,
        club_name: values.club_name || null,
        notes: values.notes || null,
      })
      .eq('id', titleId)
      .eq('career_id', career.id)

    if (error) {
      setServerError('No se pudo guardar los cambios. Inténtalo de nuevo.')
      return
    }
    navigate(`/careers/${career.id}/titles/${titleId}`, { replace: true })
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!titleData) return null

  const t = titleData
  const defaultValues: Partial<TitleFormValues> = {
    season_id: t.season_id as string,
    competition_name: t.competition_name as string,
    club_name: (t.club_name as string) ?? '',
    notes: (t.notes as string) ?? '',
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

      <h1 className="mb-1 text-2xl font-bold tracking-tight">Editar título</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Carrera: <span className="font-medium text-foreground">{career.name}</span>
      </p>

      <TitleForm
        defaultValues={defaultValues}
        seasons={seasons}
        onSubmit={onSubmit}
        serverError={serverError}
        submitLabel="Guardar cambios"
        onCancel={() => navigate(-1)}
      />
    </div>
  )
}
