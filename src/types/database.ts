/**
 * Tipos de la base de datos escritos a mano a partir de supabase/migrations.
 *
 * Cuando tengas el proyecto de Supabase enlazado, regenéralos automáticamente:
 *   npm run db:types
 * y este archivo será sustituido por la versión generada (misma forma).
 */

export type Visibility = 'private' | 'public'
export type CareerMode = 'player' | 'manager'
export type CareerStatus = 'active' | 'finished'
export type SeasonStatus = 'in_progress' | 'completed'
export type CompetitionType = 'league' | 'cup' | 'continental' | 'international' | 'other'
export type MatchEventType =
  | 'goal' | 'assist' | 'own_goal' | 'penalty_missed'
  | 'yellow_card' | 'red_card' | 'injury' | 'substitution'
export type TransferType =
  | 'purchase' | 'sale' | 'loan_in' | 'loan_out'
  | 'free_in' | 'free_out' | 'youth_promotion' | 'retirement'
export type PreferredFoot = 'left' | 'right' | 'both'

type Timestamps = { created_at: string; updated_at: string }

export type ProfileRow = Timestamps & {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  visibility: Visibility
  onboarding_completed: boolean
  is_admin: boolean
}

// Football data tables (admin-managed)
export type FootballLeagueRow = Timestamps & {
  id: string
  name: string
  country: string
  logo_url: string | null
}
export type FootballClubRow = Timestamps & {
  id: string
  name: string
  league_id: string | null
  badge_url: string | null
}
export type FootballCompetitionRow = Timestamps & {
  id: string
  name: string
  type: 'league' | 'cup' | 'international'
  country: string | null
  trophy_url: string | null
}
export type GameRow = { id: string; slug: string; name: string; publisher: string | null; created_at: string }
export type ClubRow = Timestamps & {
  id: string; owner_id: string | null; name: string; short_name: string | null
  country: string | null; logo_url: string | null; primary_color: string | null
}
export type PlayerRow = Timestamps & {
  id: string; owner_id: string | null; full_name: string; nationality: string | null
  birth_date: string | null; preferred_foot: PreferredFoot | null; positions: string[]; photo_url: string | null
}
export type CompetitionRow = Timestamps & {
  id: string; owner_id: string | null; name: string; type: CompetitionType; country: string | null
}
export type CareerRow = Timestamps & {
  id: string; owner_id: string; game_id: string; name: string; mode: CareerMode
  club_id: string | null; manager_name: string | null; start_year: number | null
  description: string | null; cover_url: string | null; status: CareerStatus; visibility: Visibility
  nationality: string | null; league_name: string | null; club_name: string | null
  position: 'portero' | 'defensa' | 'mediocampista' | 'delantero' | null
  national_team: string | null
}
export type SeasonRow = Timestamps & {
  id: string; career_id: string; owner_id: string; start_year: number; label: string
  club_id: string | null; club_name: string | null; status: SeasonStatus; notes: string | null
}
export type CareerSquadRow = Timestamps & {
  id: string; career_id: string; season_id: string; owner_id: string
  player_id: string | null; player_name: string; club_id: string | null
  position: string | null; shirt_number: number | null; age: number | null
  overall: number | null; potential: number | null; is_loan: boolean
  appearances: number; starts: number; minutes: number; goals: number; assists: number
  yellow_cards: number; red_cards: number; avg_rating: number | null
}
export type MatchRow = Timestamps & {
  id: string; career_id: string; season_id: string; owner_id: string
  competition_id: string | null; competition_name: string | null; round: string | null
  match_date: string | null; club_id: string | null; club_name: string | null
  opponent_id: string | null; opponent_name: string; is_home: boolean
  goals_for: number; goals_against: number
  penalties_for: number | null; penalties_against: number | null
  /** Columna generada por la base de datos: W / D / L. No se puede escribir. */
  result: 'W' | 'D' | 'L'
  notes: string | null
}
export type MatchEventRow = {
  id: string; match_id: string; career_id: string; owner_id: string
  event_type: MatchEventType; minute: number | null; extra_minute: number | null
  player_id: string | null; player_name: string | null
  related_player_id: string | null; related_player_name: string | null
  is_for_us: boolean; notes: string | null; created_at: string
}
export type TransferRow = Timestamps & {
  id: string; career_id: string; season_id: string; owner_id: string; type: TransferType
  player_id: string | null; player_name: string
  from_club_id: string | null; from_club_name: string | null
  to_club_id: string | null; to_club_name: string | null
  fee: number | null; currency: string; wage_weekly: number | null
  contract_until: number | null; transfer_date: string | null; notes: string | null
}
export type CareerTitleRow = {
  id: string; career_id: string; season_id: string; owner_id: string
  competition_id: string | null; competition_name: string
  club_id: string | null; club_name: string | null; notes: string | null; created_at: string
}
export type PlayerAwardRow = {
  id: string; career_id: string; season_id: string; owner_id: string
  player_id: string | null; player_name: string; award_name: string
  notes: string | null; created_at: string
}

// Insert: todo opcional salvo lo que la BD exige. Update: todo opcional.
type TableDef<Row, Required extends keyof Row, Generated extends keyof Row = never> = {
  Row: Row
  Insert: Partial<Omit<Row, Generated>> & Pick<Row, Required>
  Update: Partial<Omit<Row, Generated>>
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<ProfileRow, 'id' | 'username'>
      games: TableDef<GameRow, 'slug' | 'name'>
      clubs: TableDef<ClubRow, 'name'>
      players: TableDef<PlayerRow, 'full_name'>
      competitions: TableDef<CompetitionRow, 'name'>
      leagues: TableDef<FootballLeagueRow, 'name' | 'country'>
      football_clubs: TableDef<FootballClubRow, 'name'>
      football_competitions: TableDef<FootballCompetitionRow, 'name'>
      careers: TableDef<CareerRow, 'game_id' | 'name'>
      seasons: TableDef<SeasonRow, 'career_id' | 'start_year' | 'label'>
      career_squads: TableDef<CareerSquadRow, 'career_id' | 'season_id' | 'player_name'>
      matches: TableDef<
        MatchRow,
        'career_id' | 'season_id' | 'opponent_name' | 'goals_for' | 'goals_against',
        'result'
      >
      match_events: TableDef<MatchEventRow, 'match_id' | 'career_id' | 'event_type'>
      transfers: TableDef<TransferRow, 'career_id' | 'season_id' | 'type' | 'player_name'>
      career_titles: TableDef<CareerTitleRow, 'career_id' | 'season_id' | 'competition_name'>
      player_awards: TableDef<PlayerAwardRow, 'career_id' | 'season_id' | 'player_name' | 'award_name'>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      visibility: Visibility
      career_mode: CareerMode
      career_status: CareerStatus
      season_status: SeasonStatus
      competition_type: CompetitionType
      match_event_type: MatchEventType
      transfer_type: TransferType
      preferred_foot: PreferredFoot
    }
    CompositeTypes: Record<string, never>
  }
}
