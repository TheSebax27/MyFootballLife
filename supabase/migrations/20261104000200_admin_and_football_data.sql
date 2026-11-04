-- ============================================================
-- Admin flag + football data tables
-- ============================================================

-- 1. Add is_admin to profiles (only one user will ever have this true)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- 2. Leagues
CREATE TABLE IF NOT EXISTS public.leagues (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  country     text NOT NULL,
  logo_url    text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 3. Football clubs (admin-managed, distinct from user-defined clubs table)
CREATE TABLE IF NOT EXISTS public.football_clubs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  league_id   uuid REFERENCES public.leagues(id) ON DELETE SET NULL,
  badge_url   text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 4. Football competitions (admin-managed, distinct from user-defined competitions table)
CREATE TABLE IF NOT EXISTS public.football_competitions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  type        text NOT NULL DEFAULT 'cup', -- 'league' | 'cup' | 'international'
  country     text,
  trophy_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 5. updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'leagues_updated_at') THEN
    CREATE TRIGGER leagues_updated_at BEFORE UPDATE ON public.leagues
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'football_clubs_updated_at') THEN
    CREATE TRIGGER football_clubs_updated_at BEFORE UPDATE ON public.football_clubs
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'football_competitions_updated_at') THEN
    CREATE TRIGGER football_competitions_updated_at BEFORE UPDATE ON public.football_competitions
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- 6. Enable RLS
ALTER TABLE public.leagues              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.football_clubs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.football_competitions ENABLE ROW LEVEL SECURITY;

-- 7. RLS policies — everyone reads, only admin writes
CREATE POLICY "leagues_read_all"       ON public.leagues              FOR SELECT USING (true);
CREATE POLICY "football_clubs_read"    ON public.football_clubs       FOR SELECT USING (true);
CREATE POLICY "football_comps_read"    ON public.football_competitions FOR SELECT USING (true);

CREATE POLICY "leagues_admin_write" ON public.leagues
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "football_clubs_admin_write" ON public.football_clubs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "football_comps_admin_write" ON public.football_competitions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );
