import { Link, useLocation } from 'react-router-dom'
import { LogOut, LayoutDashboard, Briefcase, BarChart2, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { cn } from '@/utils/cn'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { signOut } = useAuth()
  const { profile } = useProfile()
  const location = useLocation()

  const displayName = profile?.display_name || profile?.username || '—'
  const initials = displayName.slice(0, 2).toUpperCase()
  const avatarSrc = profile?.avatar_url ?? null

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/careers', label: 'Carreras', icon: Briefcase },
    { to: '/stats', label: 'Estadísticas', icon: BarChart2, disabled: true },
    { to: '/community', label: 'Comunidad', icon: Users, disabled: true },
  ]

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b border-primary/30 bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          {/* Logo + nav */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src="/images/logo.webp" alt="MyFootballLife" className="h-8 w-auto object-contain" />
            </Link>

            <nav className="hidden items-center gap-0.5 md:flex">
              {navLinks.map(({ to, label, icon: Icon, disabled }) => {
                const active = !disabled && (
                  to === '/dashboard'
                    ? location.pathname === '/dashboard'
                    : location.pathname.startsWith(to)
                )
                return (
                  <Link
                    key={to}
                    to={disabled ? '#' : to}
                    onClick={disabled ? (e) => e.preventDefault() : undefined}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : disabled
                        ? 'cursor-default text-muted-foreground/40'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                    title={disabled ? 'Próximamente' : undefined}
                  >
                    <Icon className="size-3.5" />
                    {label}
                    {disabled && (
                      <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-medium text-muted-foreground/60">
                        Soon
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right: avatar + logout */}
          <div className="flex items-center gap-1">
            <div className="mx-2 hidden h-5 w-px bg-border/60 md:block" />
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <div className="size-7 overflow-hidden rounded-full bg-primary/20 ring-1 ring-primary/30">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-primary">
                    {initials}
                  </div>
                )}
              </div>
              <span className="hidden max-w-[120px] truncate text-sm font-medium md:inline">{displayName}</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              title="Cerrar sesión"
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" />
              <span className="sr-only">Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
