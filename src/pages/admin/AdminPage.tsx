import { Link } from 'react-router-dom'
import { Trophy, Briefcase, Star } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'

const sections = [
  { to: '/admin/leagues', label: 'Ligas', description: 'Agrega, edita o elimina ligas y sus logos', icon: Briefcase, color: 'text-blue-400' },
  { to: '/admin/clubs', label: 'Clubes', description: 'Gestiona clubes y escudos por liga', icon: Star, color: 'text-primary' },
  { to: '/admin/competitions', label: 'Competiciones', description: 'Copas, ligas y torneos con imagen del trofeo', icon: Trophy, color: 'text-yellow-400' },
]

export function AdminPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Panel de administración</h1>
          <p className="text-sm text-muted-foreground">Solo visible para el admin del sistema</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {sections.map(({ to, label, description, icon: Icon, color }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-xl border border-border/50 bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className={`mb-3 ${color}`}><Icon className="size-6" /></div>
              <p className="font-semibold">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
