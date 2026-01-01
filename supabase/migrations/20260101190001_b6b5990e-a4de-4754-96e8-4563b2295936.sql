-- Create app_config table for storing configuration values
CREATE TABLE IF NOT EXISTS public.app_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Public read access (edge functions need this)
CREATE POLICY "App config is publicly readable" 
ON public.app_config 
FOR SELECT 
USING (true);

-- Only service role can modify (no user modifications)
-- This is enforced by not having any INSERT/UPDATE/DELETE policies

-- Insert VIP price config
INSERT INTO public.app_config (key, value, description)
VALUES ('VIP_PRICE_ID', 'price_1SkqpQPFNT8K72RIwLP5skz4', 'Stripe price ID for VIP Dopamine Club subscription ($2.99/mo)')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();