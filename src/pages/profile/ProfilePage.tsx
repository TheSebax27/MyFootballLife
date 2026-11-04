import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, CheckCircle2, Camera } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { supabase } from '@/services/supabase/client'
import { profileEditSchema, type ProfileEditValues } from '@/schemas/profile'
import { cn } from '@/utils/cn'

export function ProfilePage() {
  const { user } = useAuth()
  const { profile, refreshProfile } = useProfile()
  const [serverError, setServerError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileEditValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      username: profile?.username ?? '',
      display_name: profile?.display_name ?? '',
      bio: profile?.bio ?? '',
      visibility: profile?.visibility ?? 'private',
    },
  })

  const visibility = watch('visibility')

  const displayName = profile?.display_name || profile?.username || user?.email?.split('@')[0] || '?'
  const initials = displayName.slice(0, 2).toUpperCase()
  const avatarSrc = avatarPreview ?? profile?.avatar_url ?? null

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setAvatarUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`

      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      await refreshProfile()
    } catch {
      setServerError('No se pudo subir la foto. Verifica que el bucket "avatars" existe en Supabase Storage.')
    } finally {
      setAvatarUploading(false)
    }
  }

  async function onSubmit(values: ProfileEditValues) {
    if (!user) return
    setServerError(null)
    setSaved(false)

    const { error } = await supabase
      .from('profiles')
      .update({
        username: values.username,
        display_name: values.display_name || null,
        bio: values.bio || null,
        visibility: values.visibility,
      })
      .eq('id', user.id)

    if (error) {
      if (error.code === '23505') {
        setServerError('Ese nombre de usuario ya está en uso.')
      } else {
        setServerError('Ocurrió un error. Intenta nuevamente.')
      }
      return
    }

    await refreshProfile()
    setSaved(true)
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona tu información pública y preferencias.
          </p>
        </div>

        {/* Avatar */}
        <div className="mb-8 flex items-center gap-5">
          <div className="relative">
            <div className="size-20 overflow-hidden rounded-full border-2 border-border bg-muted">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-muted-foreground">
                  {initials}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              aria-label="Cambiar foto"
            >
              {avatarUploading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Camera className="size-3.5" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="font-medium">{displayName}</p>
            <p className="text-sm text-muted-foreground">@{profile?.username}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 text-xs text-primary hover:underline"
            >
              Cambiar foto
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="username">
              Nombre de usuario <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center rounded-md border border-input bg-transparent px-3 shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
              <span className="select-none text-sm text-muted-foreground">@</span>
              <Input
                id="username"
                autoComplete="username"
                aria-invalid={!!errors.username}
                className="border-0 shadow-none focus-visible:ring-0 pl-1"
                {...register('username')}
              />
            </div>
            <p className="text-xs text-muted-foreground">3–30 caracteres. Solo minúsculas, números y _</p>
            {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="display_name">
              Nombre para mostrar{' '}
              <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="display_name"
              autoComplete="name"
              placeholder="Tu nombre público"
              aria-invalid={!!errors.display_name}
              {...register('display_name')}
            />
            {errors.display_name && (
              <p className="text-xs text-destructive">{errors.display_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">
              Descripción{' '}
              <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="bio"
              placeholder="Cuéntale algo a la comunidad..."
              aria-invalid={!!errors.bio}
              {...register('bio')}
            />
            {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Visibilidad del perfil</Label>
            <div className="flex gap-2">
              {(['private', 'public'] as const).map((v) => (
                <label
                  key={v}
                  className={cn(
                    'flex flex-1 cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                    visibility === v
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input text-muted-foreground hover:bg-accent',
                  )}
                >
                  <input type="radio" value={v} className="sr-only" {...register('visibility')} />
                  {v === 'private' ? 'Privado' : 'Público'}
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {visibility === 'public'
                ? 'Tu perfil y carreras públicas serán visibles para todos.'
                : 'Solo tú puedes ver tu perfil y carreras.'}
            </p>
          </div>

          {serverError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </p>
          )}

          {saved && (
            <p className="flex items-center gap-2 text-sm text-primary">
              <CheckCircle2 className="size-4" /> Perfil guardado correctamente.
            </p>
          )}

          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Guardar cambios
          </Button>
        </form>
      </div>
    </AppShell>
  )
}
