import type { ReactNode } from 'react'

type AuthLayoutProps = {
  children: ReactNode
  title: string
  description?: string
  image?: string
}

export function AuthLayout({ children, title, description, image }: AuthLayoutProps) {
  if (image) {
    return (
      <div className="flex min-h-svh bg-background">
        {/* Left panel */}
        <div className="relative flex w-full flex-col justify-center overflow-hidden px-8 py-12 md:w-[500px] md:shrink-0 lg:w-[560px]">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -top-20 size-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.09) 0%, transparent 70%)' }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 right-0 size-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.05) 0%, transparent 70%)' }}
          />

          <div className="relative mx-auto w-full max-w-sm">
            <div className="mb-10">
              <img src="/images/logo.webp" alt="MyFootballLife" className="mb-3 h-12 w-auto object-contain" />
              <p className="text-xs font-semibold tracking-widest text-primary/70 uppercase">
                Tu historia futbolística
              </p>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              {description && (
                <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
              )}
            </div>

            {children}
          </div>

          <div className="absolute right-0 top-1/4 h-1/2 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        </div>

        {/* Right panel */}
        <div className="relative hidden flex-1 md:block">
          <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/5 to-transparent" style={{ width: '20%' }} />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <img src="/images/logo.webp" alt="MyFootballLife" className="h-20 w-auto object-contain" />
          <p className="text-sm text-muted-foreground">Tu historia futbolística, temporada a temporada.</p>
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
