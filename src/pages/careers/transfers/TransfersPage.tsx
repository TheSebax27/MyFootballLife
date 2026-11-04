import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCareer } from '@/hooks/useCareer'
import { supabase } from '@/services/supabase/client'
import { TRANSFER_TYPE_LABEL } from '@/schemas/transfer'
import type { TransferRow, SeasonRow } from '@/types/database'

const TYPE_VARIANT: Record<string, 'success' | 'destructive' | 'secondary' | 'outline' | 'warning'> = {
  purchase: 'success',
  free_in: 'success',
  loan_in: 'success',
  youth_promotion: 'success',
  sale: 'destructive',
  free_out: 'destructive',
  loan_out: 'warning',
  retirement: 'secondary',
}

export function TransfersPage() {
  const { career } = useCareer()
  const [transfers, setTransfers] = useState<TransferRow[]>([])
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [filterSeason, setFilterSeason] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase
        .from('transfers')
        .select('*')
        .eq('career_id', career.id)
        .order('transfer_date', { ascending: false }),
      supabase
        .from('seasons')
        .select('*')
        .eq('career_id', career.id)
        .order('start_year', { ascending: true }),
    ]).then(([{ data: t }, { data: s }]) => {
      setTransfers(t ?? [])
      setSeasons(s ?? [])
      setLoading(false)
    })
  }, [career.id])

  const filtered =
    filterSeason === 'all' ? transfers : transfers.filter((t) => t.season_id === filterSeason)

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Fichajes</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {filtered.length === 0
              ? 'Sin fichajes'
              : `${filtered.length} movimiento${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {seasons.length > 0 && (
            <select
              value={filterSeason}
              onChange={(e) => setFilterSeason(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            >
              <option value="all">Todas las temporadas</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          )}
          <Button asChild size="sm">
            <Link to={`/careers/${career.id}/transfers/new`}>
              <Plus className="size-4" />
              Nuevo fichaje
            </Link>
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <ArrowLeftRight className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 font-medium">No hay fichajes</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Registra tus altas, bajas y préstamos.
          </p>
          <Button asChild size="sm" className="mt-4">
            <Link to={`/careers/${career.id}/transfers/new`}>
              <Plus className="size-4" />
              Nuevo fichaje
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((transfer) => {
            const season = seasons.find((s) => s.id === transfer.season_id)
            return (
              <Link
                key={transfer.id}
                to={`/careers/${career.id}/transfers/${transfer.id}`}
                className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/50"
              >
                <Badge variant={TYPE_VARIANT[transfer.type] ?? 'secondary'} className="shrink-0 whitespace-nowrap">
                  {TRANSFER_TYPE_LABEL[transfer.type] ?? transfer.type}
                </Badge>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{transfer.player_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[
                      transfer.from_club_name && `De: ${transfer.from_club_name}`,
                      transfer.to_club_name && `A: ${transfer.to_club_name}`,
                      season?.label,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>

                {transfer.fee != null && (
                  <p className="shrink-0 text-sm font-medium">
                    {Number(transfer.fee).toLocaleString('es-ES')} {transfer.currency}
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
