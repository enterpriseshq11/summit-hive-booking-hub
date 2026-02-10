
-- Create promo_codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  business_unit text NOT NULL,
  discount_type text NOT NULL DEFAULT 'percent',
  discount_value numeric NOT NULL DEFAULT 0,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  start_date timestamptz,
  end_date timestamptz,
  max_uses integer,
  current_uses integer NOT NULL DEFAULT 0,
  stackable_with_service_discount boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active promo codes"
  ON public.promo_codes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage promo codes"
  ON public.promo_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'manager')
    )
  );

-- Create service_discount_config table
CREATE TABLE IF NOT EXISTS public.service_discount_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_unit text NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT true,
  discount_percent numeric NOT NULL DEFAULT 10,
  categories jsonb NOT NULL DEFAULT '["Military","First Responder","Police","Firefighter","EMT/Paramedic","Nurse/Healthcare","Teacher"]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_discount_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read service discount config"
  ON public.service_discount_config FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage service discount config"
  ON public.service_discount_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner', 'manager')
    )
  );

-- Seed default service discount configs
INSERT INTO public.service_discount_config (business_unit, enabled, discount_percent)
VALUES
  ('summit', true, 10),
  ('hive', true, 10),
  ('restoration', true, 10),
  ('photo_booth_360', true, 10),
  ('voice_vault', true, 10)
ON CONFLICT (business_unit) DO NOTHING;
