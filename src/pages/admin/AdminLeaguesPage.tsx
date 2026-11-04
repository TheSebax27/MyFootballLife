import { useEffect, useRef, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, Upload, X } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/services/supabase/client'
import type { FootballLeagueRow } from '@/types/database'

type FormState = { name: string; country: string; logo_url: string; logoFile: File | null; logoPreview: string }
const EMPTY: FormState = { name: '', country: '', logo_url: '', logoFile: null, logoPreview: '' }

export function AdminLeaguesPage() {
  const [leagues, setLeagues] = useState<FootballLeagueRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<FootballLeagueRow | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function fetchLeagues() {
    const { data } = await supabase.from('leagues').select('*').order('country').order('name')
    setLeagues(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchLeagues() }, [])

  function openNew() {
    setEditing(null)
    setForm(EMPTY)
    setError(null)
    setShowForm(true)
  }

  function openEdit(league: FootballLeagueRow) {
    setEditing(league)
    setForm({ name: league.name, country: league.country, logo_url: league.logo_url ?? '', logoFile: null, logoPreview: league.logo_url ?? '' })
    setError(null)
    setShowForm(true)
  }

  function handleFile(file: File) {
    const preview = URL.createObjectURL(file)
    setForm((f) => ({ ...f, logoFile: file, logoPreview: preview }))
  }

  async function uploadLogo(file: File): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `leagues/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('football-assets').upload(path, file, { upsert: true })
    if (error) throw new Error(error.message)
    const { data } = supabase.storage.from('football-assets').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSave() {
    if (!form.name.trim() || !form.country.trim()) {
      setError('Nombre y país son requeridos.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      let logo_url = form.logo_url || null
      if (form.logoFile) logo_url = await uploadLogo(form.logoFile)

      if (editing) {
        const { error } = await supabase.from('leagues').update({ name: form.name.trim(), country: form.country.trim(), logo_url }).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('leagues').insert({ name: form.name.trim(), country: form.country.trim(), logo_url })
        if (error) throw error
      }
      setShowForm(false)
      fetchLeagues()
    } catch (e: any) {
      setError(e.message ?? 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta liga? Los clubes asociados perderán su liga.')) return
    await supabase.from('leagues').delete().eq('id', id)
    fetchLeagues()
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ligas</h1>
            <p className="text-sm text-muted-foreground">Gestiona las ligas del sistema</p>
          </div>
          <Button onClick={openNew} className="gap-2 bg-primary font-semibold text-primary-foreground">
            <Plus className="size-4" /> Nueva liga
          </Button>
        </div>

        {/* Form panel */}
        {showForm && (
          <div className="mb-6 rounded-xl border border-border/50 bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">{editing ? 'Editar liga' : 'Nueva liga'}</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Nombre *</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Premier League" />
              </div>
              <div className="space-y-1.5">
                <Label>País *</Label>
                <Input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} placeholder="England" />
              </div>
            </div>

            {/* Logo upload */}
            <div className="mt-4 space-y-1.5">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                {form.logoPreview ? (
                  <img src={form.logoPreview} alt="logo" className="size-14 rounded-lg object-contain bg-background p-1 border border-border/50" />
                ) : (
                  <div className="size-14 rounded-lg border border-dashed border-border/50 flex items-center justify-center text-muted-foreground">
                    <Upload className="size-5" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1.5">
                    <Upload className="size-3.5" /> Subir imagen
                  </Button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                  <p className="text-xs text-muted-foreground">PNG, JPG, SVG, WebP</p>
                </div>
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

            <div className="mt-5 flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="bg-primary font-semibold text-primary-foreground">
                {saving && <Loader2 className="animate-spin size-4" />}
                {editing ? 'Guardar cambios' : 'Crear liga'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : leagues.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/50 py-16 text-center">
            <p className="text-muted-foreground">No hay ligas registradas.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30 rounded-xl border border-border/50 overflow-hidden">
            {leagues.map((league) => (
              <div key={league.id} className="flex items-center gap-4 bg-card px-4 py-3 hover:bg-accent/30">
                {league.logo_url ? (
                  <img src={league.logo_url} alt={league.name} className="size-9 rounded object-contain bg-background p-0.5" />
                ) : (
                  <div className="size-9 rounded border border-dashed border-border/50 flex items-center justify-center text-muted-foreground/40 text-xs">?</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{league.name}</p>
                  <p className="text-xs text-muted-foreground">{league.country}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(league)} className="text-muted-foreground hover:text-foreground size-8">
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(league.id)} className="text-muted-foreground hover:text-destructive size-8">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
