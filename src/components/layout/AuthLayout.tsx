import { Trophy } from 'lucide-react'
import type { ReactNode } from 'react'

type AuthLayoutProps = {
  children: ReactNode
  title: string
  description?: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Trophy className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">MyLifeFootball</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Tu historia futbolística, temporada a temporada.</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
