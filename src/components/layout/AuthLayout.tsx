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
      <div className="flex min-h-svh bg-[#060d07]">
        {/* Left panel */}
        <div className="relative flex w-full flex-col justify-center overflow-hidden px-8 py-12 md:w-[500px] md:shrink-0 lg:w-[560px]">
          {/* Subtle radial glow top-left */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -top-20 size-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.10) 0%, transparent 70%)' }}
          />
          {/* Bottom-right faint glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 right-0 size-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)' }}
          />

          <div className="relative mx-auto w-full max-w-sm">
            {/* Logo + tagline */}
            <div className="mb-10">
              <img
                src="/images/logo.webp"
                alt="MyFootballLife"
                className="mb-3 h-12 w-auto object-contain"
              />
              <p className="text-xs font-medium tracking-widest text-green-500/70 uppercase">
                Tu historia futbolística
              </p>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              {description && (
                <p className="mt-1.5 text-sm text-white/50">{description}</p>
              )}
            </div>

            {/* Form children */}
            <div className="auth-dark-form">
              {children}
            </div>
          </div>

          {/* Right border accent */}
          <div className="absolute right-0 top-1/4 h-1/2 w-px bg-gradient-to-b from-transparent via-green-500/20 to-transparent" />
        </div>

        {/* Right panel — image */}
        <div className="relative hidden flex-1 md:block">
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          {/* gradient blend into left panel */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#060d07] via-transparent to-transparent" style={{ width: '25%' }} />
          <div className="absolute inset-0 bg-black/25" />
        </div>
      </div>
    )
  }

  /* Fallback: centered (forgot-password, etc.) */
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
