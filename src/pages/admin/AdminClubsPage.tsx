import { useEffect, useRef, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, Upload, X } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/services/supabase/client'
import type { FootballClubRow, FootballLeagueRow } from '@/types/database'

type FormState = { name: string; league_id: string; badgeFile: File | null; badgePreview: string }
const EMPTY: FormState = { name: '', league_id: '', badgeFile: null, badgePreview: '' }

export function AdminClubsPage() {
  const [clubs, setClubs] = useState<(FootballClubRow & { league_name?: string })[]>([])
  const [leagues, setLeagues] = useState<FootballLeagueRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<FootballClubRow | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterLeague, setFilterLeague] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function fetchData() {
    const [{ data: clubsData }, { data: leaguesData }] = await Promise.all([
      supabase.from('football_clubs').select('*, leagues(name)').order('name'),
      supabase.from('leagues').select('*').order('name'),
    ])
    setClubs((clubsData ?? []).map((c: any) => ({ ...c, league_name: c.leagues?.name ?? null })))
    setLeagues(leaguesData ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  function openNew() {
    setEditing(null)
    setForm(EMPTY)
    setError(null)
    setShowForm(true)
  }

  function openEdit(club: FootballClubRow & { league_name?: string }) {
    setEditing(club)
    setForm({ name: club.name, league_id: club.league_id ?? '', badgeFile: null, badgePreview: club.badge_url ?? '' })
    setError(null)
    setShowForm(true)
  }

  async function uploadBadge(file: File): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `clubs/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('football-assets').upload(path, file, { upsert: true })
    if (error) throw new Error(error.message)
    const { data } = supabase.storage.from('football-assets').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('El nombre es requerido.'); return }
    setSaving(true)
    setError(null)
    try {
      let badge_url = editing?.badge_url ?? null
      if (form.badgeFile) badge_url = await uploadBadge(form.badgeFile)

      const payload = {
        name: form.name.trim(),
        league_id: form.league_id || null,
        badge_url,
      }

      if (editing) {
        const { error } = await supabase.from('football_clubs').update(payload).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('football_clubs').insert(payload)
        if (error) throw error
      }
      setShowForm(false)
      fetchData()
    } catch (e: any) {
      setError(e.message ?? 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este club?')) return
    await supabase.from('football_clubs').delete().eq('id', id)
    fetchData()
  }

  const filteredClubs = filterLeague
    ? clubs.filter((c) => c.league_id === filterLeague)
    : clubs

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Clubes</h1>
            <p className="text-sm text-muted-foreground">Gestiona los clubes del sistema</p>
          </div>
          <Button onClick={openNew} className="gap-2 bg-primary font-semibold text-primary-foreground">
            <Plus className="size-4" /> Nuevo club
          </Button>
        </div>

        {/* Form panel */}
        {showForm && (
          <div className="mb-6 rounded-xl border border-border/50 bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">{editing ? 'Editar club' : 'Nuevo club'}</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Nombre *</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Manchester City" />
              </div>
              <div className="space-y-1.5">
                <Label>Liga</Label>
                <select
                  value={form.league_id}
                  onChange={(e) => setForm((f) => ({ ...f, league_id: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Sin liga asignada</option>
                  {leagues.map((l) => (
                    <option key={l.id} value={l.id}>{l.name} ({l.country})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Badge upload */}
            <div className="mt-4 space-y-1.5">
              <Label>Escudo</Label>
              <div className="flex items-center gap-4">
                {form.badgePreview ? (
                  <img src={form.badgePreview} alt="badge" className="size-14 rounded-lg object-contain bg-background p-1 border border-border/50" />
                ) : (
                  <div className="size-14 rounded-lg border border-dashed border-border/50 flex items-center justify-center text-muted-foreground">
                    <Upload className="size-5" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1.5">
                    <Upload className="size-3.5" /> Subir escudo
                  </Button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setForm((s) => ({ ...s, badgeFile: f, badgePreview: URL.createObjectURL(f) }))
                  }} />
                </div>
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

            <div className="mt-5 flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="bg-primary font-semibold text-primary-foreground">
                {saving && <Loader2 className="animate-spin size-4" />}
                {editing ? 'Guardar cambios' : 'Crear club'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        {/* Filter by league */}
        <div className="mb-4">
          <select
            value={filterLeague}
            onChange={(e) => setFilterLeague(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">Todas las ligas</option>
            {leagues.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
        ) : filteredClubs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/50 py-16 text-center">
            <p className="text-muted-foreground">No hay clubes registrados.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30 rounded-xl border border-border/50 overflow-hidden">
            {filteredClubs.map((club) => (
              <div key={club.id} className="flex items-center gap-4 bg-card px-4 py-3 hover:bg-accent/30">
                {club.badge_url ? (
                  <img src={club.badge_url} alt={club.name} className="size-9 rounded object-contain bg-background p-0.5" />
                ) : (
                  <div className="size-9 rounded border border-dashed border-border/50 flex items-center justify-center text-muted-foreground/40 text-xs">?</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{club.name}</p>
                  {club.league_name && <p className="text-xs text-muted-foreground">{club.league_name}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(club)} className="text-muted-foreground hover:text-foreground size-8">
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(club.id)} className="text-muted-foreground hover:text-destructive size-8">
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
