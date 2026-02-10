
ALTER TABLE public.specials
  ADD COLUMN IF NOT EXISTS action_type text NOT NULL DEFAULT 'route_only',
  ADD COLUMN IF NOT EXISTS destination_route text,
  ADD COLUMN IF NOT EXISTS promo_code text,
  ADD COLUMN IF NOT EXISTS discount_type text,
  ADD COLUMN IF NOT EXISTS discount_value numeric,
  ADD COLUMN IF NOT EXISTS terms text,
  ADD COLUMN IF NOT EXISTS requires_verification boolean NOT NULL DEFAULT false;
