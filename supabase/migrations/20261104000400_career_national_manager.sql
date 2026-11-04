-- national_team: selección que dirige el DT o a la que está convocado el jugador
ALTER TABLE public.careers
  ADD COLUMN IF NOT EXISTS national_team text;
