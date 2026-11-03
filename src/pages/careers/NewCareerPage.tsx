import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { CareerForm } from './_CareerForm'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/services/supabase/client'
import type { CareerFormValues } from '@/schemas/career'

export function NewCareerPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
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
      <div className="mx-auto max-w-xl px-4 py-10">
        <Link
          to="/careers"
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Volver a carreras
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Nueva carrera</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configura los datos básicos de tu nueva trayectoria.
          </p>
        </div>

        <CareerForm
          onSubmit={handleSubmit}
          serverError={serverError}
          submitLabel="Crear carrera"
          onCancel={() => navigate('/careers')}
        />
      </div>
    </AppShell>
  )
}
