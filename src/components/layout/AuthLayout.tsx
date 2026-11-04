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
      <div className="flex min-h-svh">
        {/* Left panel — always dark */}
        <div className="dark flex w-full flex-col justify-center bg-background px-8 py-12 md:w-[480px] md:shrink-0 lg:w-[520px]">
          <div className="mx-auto w-full max-w-sm">
            {/* Logo */}
            <div className="mb-8 flex items-center gap-3">
              <img src="/images/logo.webp" alt="MyFootballLife" className="h-10 w-auto object-contain" />
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              )}
            </div>

            {children}
          </div>
        </div>

        {/* Right panel — image */}
        <div className="relative hidden flex-1 md:block">
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      </div>
    )
  }

  /* Fallback: centered layout (forgot-password, etc.) */
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
