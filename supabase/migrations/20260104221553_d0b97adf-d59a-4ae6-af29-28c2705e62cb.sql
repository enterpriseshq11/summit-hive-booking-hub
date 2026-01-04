-- Add canceled_at column to voice_vault_bookings for tracking cancellation timestamps
ALTER TABLE public.voice_vault_bookings 
ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP WITH TIME ZONE;