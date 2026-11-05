-- Player-perspective transfer types and wage frequency
ALTER TYPE public.transfer_type ADD VALUE IF NOT EXISTS 'player_transfer';
ALTER TYPE public.transfer_type ADD VALUE IF NOT EXISTS 'player_loan';
ALTER TYPE public.transfer_type ADD VALUE IF NOT EXISTS 'player_free';
ALTER TYPE public.transfer_type ADD VALUE IF NOT EXISTS 'player_retirement';

ALTER TABLE public.transfers
  ADD COLUMN IF NOT EXISTS wage_frequency text
    CHECK (wage_frequency IN ('weekly', 'monthly', 'annual'));
