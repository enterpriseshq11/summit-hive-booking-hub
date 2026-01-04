-- Create webhook_events table for debugging/visibility
CREATE TABLE public.voice_vault_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  stripe_event_id TEXT,
  record_id UUID,
  record_type TEXT, -- 'booking' or 'package'
  payload JSONB,
  result TEXT, -- 'success' or 'error'
  result_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.voice_vault_webhook_events ENABLE ROW LEVEL SECURITY;

-- Staff can read webhook events
CREATE POLICY "Staff can read webhook events"
  ON public.voice_vault_webhook_events
  FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

-- Service role can insert
CREATE POLICY "Service role can insert webhook events"
  ON public.voice_vault_webhook_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);