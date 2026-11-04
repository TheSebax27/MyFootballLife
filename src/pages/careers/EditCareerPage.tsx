import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { CareerForm } from './_CareerForm'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/services/supabase/client'
import type { CareerRow } from '@/types/database'
import type { CareerFormValues } from '@/schemas/career'

export function EditCareerPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [career, setCareer] = useState<CareerRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !user) return
    supabase
      .from('careers')
      .select('*')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single()
      .then(({ data }) => {
        setCareer(data)
        setLoading(false)
      })
  }, [id, user?.id])

  async function handleSubmit(values: CareerFormValues) {
    if (!id || !user) return
    setServerError(null)

    const { error } = await supabase
      .from('careers')
      .update({
        game_id: values.game_id,
        name: values.name,
        mode: values.mode,
        manager_name: values.manager_name || null,
        position: values.position || null,
        national_team: values.national_team ? values.national_team.replace(/^\S+\s/, '') : null,
        nationality: values.nationality ? values.nationality.replace(/^\S+\s/, '') : null,
        league_name: values.league_name || null,
        club_name: values.club_name || null,
        start_year: values.start_year ? parseInt(values.start_year, 10) : null,
        description: values.description || null,
        visibility: values.visibility,
      })
      .eq('id', id)
      .eq('owner_id', user.id)

    if (error) {
      setServerError('Ocurrió un error al guardar los cambios. Intenta nuevamente.')
      return
    }

    navigate(`/careers/${id}`)
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppShell>
    )
  }

  if (!career) {
    return (
      <AppShell>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <p className="font-medium">Carrera no encontrada.</p>
          <Link to="/careers" className="mt-4 text-sm text-primary hover:underline">
            Volver a carreras
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-xl px-4 py-10">
        <Link
          to={`/careers/${id}`}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Volver a la carrera
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Editar carrera</h1>
          <p className="mt-1 text-sm text-muted-foreground">{career.name}</p>
        </div>

        <CareerForm
          defaultValues={{
            name: career.name,
            game_id: career.game_id,
            mode: career.mode,
            manager_name: career.manager_name ?? '',
            position: career.position ?? undefined,
            national_team: career.national_team ?? '',
            nationality: career.nationality ?? '',
            league_name: career.league_name ?? '',
            club_name: career.club_name ?? '',
            start_year: career.start_year?.toString() ?? '',
            description: career.description ?? '',
            visibility: career.visibility,
          }}
          onSubmit={handleSubmit}
          serverError={serverError}
          submitLabel="Guardar cambios"
          onCancel={() => navigate(`/careers/${id}`)}
        />
      </div>
    </AppShell>
  )
}
