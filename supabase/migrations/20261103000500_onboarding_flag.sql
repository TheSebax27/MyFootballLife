-- =============================================================================
-- Migración 5: bandera de onboarding en profiles
-- =============================================================================
-- Detectar si el usuario ya personalizó su perfil por primera vez.
-- El trigger auto-crea el perfil con onboarding_completed = false.
-- La app lo marca true cuando el usuario elige su username definitivo.

alter table public.profiles
  add column onboarding_completed boolean not null default false;
