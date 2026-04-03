
-- GHL Webhook Config per business unit
CREATE TABLE public.ghl_webhook_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit text NOT NULL UNIQUE,
  webhook_url text,
  pipeline_stage_webhook_url text,
  is_active boolean DEFAULT false,
  last_tested_at timestamptz,
  last_fired_at timestamptz,
  last_status text DEFAULT 'never_fired',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ghl_webhook_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view webhook configs"
  ON public.ghl_webhook_config FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins can modify webhook configs"
  ON public.ghl_webhook_config FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- Pre-populate with all 7 business units
INSERT INTO public.ghl_webhook_config (business_unit) VALUES
  ('summit'), ('spa'), ('fitness'), ('coworking'),
  ('voice_vault'), ('elevated_by_elyse'), ('mobile_homes');

-- Add ghl_webhook_fired_at to lead_intake_submissions
ALTER TABLE public.lead_intake_submissions
  ADD COLUMN IF NOT EXISTS ghl_webhook_fired_at timestamptz;

-- GHL Pipeline Stage Webhooks
CREATE TABLE public.ghl_pipeline_stage_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_name text NOT NULL UNIQUE,
  webhook_url text,
  is_active boolean DEFAULT false,
  last_tested_at timestamptz,
  last_fired_at timestamptz,
  last_status text DEFAULT 'never_fired',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ghl_pipeline_stage_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view pipeline webhooks"
  ON public.ghl_pipeline_stage_webhooks FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins can modify pipeline webhooks"
  ON public.ghl_pipeline_stage_webhooks FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- Pre-populate pipeline stages
INSERT INTO public.ghl_pipeline_stage_webhooks (stage_name) VALUES
  ('new'), ('contact_attempted'), ('responded'), ('warm_lead'),
  ('hot_lead'), ('proposal_sent'), ('contract_out'),
  ('deposit_received'), ('booked'), ('completed'), ('lost');

-- Lead Documents table
CREATE TABLE public.lead_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text,
  file_url text NOT NULL,
  file_size_bytes bigint,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.lead_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view lead documents"
  ON public.lead_documents FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can upload lead documents"
  ON public.lead_documents FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Owners can delete lead documents"
  ON public.lead_documents FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- Storage bucket for lead documents
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('lead-documents', 'lead-documents', false, 26214400)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Staff can upload lead docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'lead-documents' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can view lead docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'lead-documents' AND public.is_staff(auth.uid()));
