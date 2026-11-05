-- Add team result columns to player_season_stats for manual season summaries
ALTER TABLE public.player_season_stats
  ADD COLUMN IF NOT EXISTS wins         int NOT NULL DEFAULT 0 CHECK (wins         >= 0),
  ADD COLUMN IF NOT EXISTS draws        int NOT NULL DEFAULT 0 CHECK (draws        >= 0),
  ADD COLUMN IF NOT EXISTS losses       int NOT NULL DEFAULT 0 CHECK (losses       >= 0),
  ADD COLUMN IF NOT EXISTS goals_for    int NOT NULL DEFAULT 0 CHECK (goals_for    >= 0),
  ADD COLUMN IF NOT EXISTS goals_against int NOT NULL DEFAULT 0 CHECK (goals_against >= 0);
