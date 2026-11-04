import { useEffect, useRef, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, Upload, X } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/services/supabase/client'
import type { FootballCompetitionRow } from '@/types/database'

type CompType = 'league' | 'cup' | 'international'
type FormState = { name: string; type: CompType; country: string; trophyFile: File | null; trophyPreview: string }
const EMPTY: FormState = { name: '', type: 'cup', country: '', trophyFile: null, trophyPreview: '' }

const TYPE_LABEL: Record<CompType, string> = { league: 'Liga', cup: 'Copa', international: 'Internacional' }

export function AdminCompetitionsPage() {
  const [competitions, setCompetitions] = useState<FootballCompetitionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<FootballCompetitionRow | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function fetchCompetitions() {
    const { data } = await supabase.from('football_competitions').select('*').order('type').order('name')
    setCompetitions(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchCompetitions() }, [])

  function openNew() { setEditing(null); setForm(EMPTY); setError(null); setShowForm(true) }

  function openEdit(c: FootballCompetitionRow) {
    setEditing(c)
    setForm({ name: c.name, type: c.type as CompType, country: c.country ?? '', trophyFile: null, trophyPreview: c.trophy_url ?? '' })
    setError(null)
    setShowForm(true)
  }

  async function uploadTrophy(file: File): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `competitions/${Date.now()}.${ext}`
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
      let trophy_url = editing?.trophy_url ?? null
      if (form.trophyFile) trophy_url = await uploadTrophy(form.trophyFile)

      const payload = { name: form.name.trim(), type: form.type, country: form.country || null, trophy_url }

      if (editing) {
        const { error } = await supabase.from('football_competitions').update(payload).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('football_competitions').insert(payload)
        if (error) throw error
      }
      setShowForm(false)
      fetchCompetitions()
    } catch (e: any) {
      setError(e.message ?? 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta competición?')) return
    await supabase.from('football_competitions').delete().eq('id', id)
    fetchCompetitions()
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Competiciones</h1>
            <p className="text-sm text-muted-foreground">Ligas, copas y torneos internacionales</p>
          </div>
          <Button onClick={openNew} className="gap-2 bg-primary font-semibold text-primary-foreground">
            <Plus className="size-4" /> Nueva competición
          </Button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl border border-border/50 bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">{editing ? 'Editar competición' : 'Nueva competición'}</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-1">
                <Label>Nombre *</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="UEFA Champions League" />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CompType }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="league">Liga</option>
                  <option value="cup">Copa</option>
                  <option value="international">Internacional</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>País (opcional)</Label>
                <Input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} placeholder="England" />
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <Label>Imagen del trofeo</Label>
              <div className="flex items-center gap-4">
                {form.trophyPreview ? (
                  <img src={form.trophyPreview} alt="trophy" className="size-14 rounded-lg object-contain bg-background p-1 border border-border/50" />
                ) : (
                  <div className="size-14 rounded-lg border border-dashed border-border/50 flex items-center justify-center text-muted-foreground">
                    <Upload className="size-5" />
                  </div>
                )}
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1.5">
                  <Upload className="size-3.5" /> Subir imagen
                </Button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) setForm((s) => ({ ...s, trophyFile: f, trophyPreview: URL.createObjectURL(f) }))
                }} />
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
            <div className="mt-5 flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="bg-primary font-semibold text-primary-foreground">
                {saving && <Loader2 className="animate-spin size-4" />}
                {editing ? 'Guardar cambios' : 'Crear'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
        ) : competitions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/50 py-16 text-center">
            <p className="text-muted-foreground">No hay competiciones registradas.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30 rounded-xl border border-border/50 overflow-hidden">
            {competitions.map((comp) => (
              <div key={comp.id} className="flex items-center gap-4 bg-card px-4 py-3 hover:bg-accent/30">
                {comp.trophy_url ? (
                  <img src={comp.trophy_url} alt={comp.name} className="size-9 rounded object-contain bg-background p-0.5" />
                ) : (
                  <div className="size-9 rounded border border-dashed border-border/50 flex items-center justify-center text-muted-foreground/40 text-xs">?</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{comp.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {TYPE_LABEL[comp.type as CompType]}{comp.country ? ` · ${comp.country}` : ''}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(comp)} className="text-muted-foreground hover:text-foreground size-8">
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(comp.id)} className="text-muted-foreground hover:text-destructive size-8">
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
