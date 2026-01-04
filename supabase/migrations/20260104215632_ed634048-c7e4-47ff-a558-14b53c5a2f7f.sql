-- Add voice_vault to business_type enum
ALTER TYPE public.business_type ADD VALUE IF NOT EXISTS 'voice_vault';