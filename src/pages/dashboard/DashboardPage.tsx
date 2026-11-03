import { Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProfile } from '@/hooks/useProfile'

export function DashboardPage() {
  const { profile } = useProfile()

  const greeting = profile?.display_name || profile?.username || 'Entrenador'

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hola, {greeting}</h1>
            <p className="mt-1 text-muted-foreground">Tu historial futbolístico en un solo lugar.</p>
          </div>
          <Button asChild>
            <Link to="/careers/new">
              <Trophy className="size-4" />
              Nueva carrera
            </Link>
          </Button>
        </div>

        {/* Estado vacío — se reemplaza en la Phase 3 con stats reales */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Carreras', value: '—' },
            { label: 'Partidos', value: '—' },
            { label: 'Victorias', value: '—' },
            { label: 'Títulos', value: '—' },
          ].map(({ label, value }) => (
            <Card key={label}>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 rounded-xl border border-dashed py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <Trophy className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No tienes carreras todavía</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Crea tu primera carrera para empezar a registrar tu historia.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/careers/new">Crear carrera</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
