-- Add unique constraint on stripe_event_id for true idempotency
ALTER TABLE public.voice_vault_webhook_events 
ADD CONSTRAINT voice_vault_webhook_events_stripe_event_id_unique 
UNIQUE (stripe_event_id);