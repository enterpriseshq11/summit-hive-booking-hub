-- Add PandaDoc fields to crm_leads
ALTER TABLE public.crm_leads
  ADD COLUMN IF NOT EXISTS pandadoc_document_id text,
  ADD COLUMN IF NOT EXISTS pandadoc_status text;

-- Create pandadoc_webhook_events table
CREATE TABLE IF NOT EXISTS public.pandadoc_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  document_id text,
  payload jsonb,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed boolean NOT NULL DEFAULT false
);

ALTER TABLE public.pandadoc_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view pandadoc events"
  ON public.pandadoc_webhook_events
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Create pandadoc_template_tags table
CREATE TABLE IF NOT EXISTS public.pandadoc_template_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id text NOT NULL,
  template_name text,
  business_unit text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(template_id, business_unit)
);

ALTER TABLE public.pandadoc_template_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage pandadoc template tags"
  ON public.pandadoc_template_tags
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Fix any offices that were set to 'booked' to use 'leased' instead
UPDATE public.hive_private_offices SET status = 'leased' WHERE status = 'booked';