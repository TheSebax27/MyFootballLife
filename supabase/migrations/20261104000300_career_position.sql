ALTER TABLE public.careers
  ADD COLUMN IF NOT EXISTS position text
    CHECK (position IN ('portero', 'defensa', 'mediocampista', 'delantero'));
