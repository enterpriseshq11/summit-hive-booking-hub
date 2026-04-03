
-- Add new roles for Elyse (marketing_lead), Rose (ops_lead), Kae (ads_lead)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'marketing_lead';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ops_lead';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ads_lead';

-- Add Elevated by Elyse business type
ALTER TYPE public.business_type ADD VALUE IF NOT EXISTS 'elevated_by_elyse';

-- Dashboard layouts table for drag-and-drop KPI customization
CREATE TABLE IF NOT EXISTS public.dashboard_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  layout_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_default boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.dashboard_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own dashboard layout"
  ON public.dashboard_layouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dashboard layout"
  ON public.dashboard_layouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard layout"
  ON public.dashboard_layouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_dashboard_layouts_updated_at
  BEFORE UPDATE ON public.dashboard_layouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Lead intake submissions table
CREATE TABLE IF NOT EXISTS public.lead_intake_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit public.business_type NOT NULL,
  form_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text DEFAULT 'website',
  lead_id uuid REFERENCES public.crm_leads(id),
  ghl_webhook_status text DEFAULT 'pending',
  ghl_webhook_response jsonb,
  submitted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_intake_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all intake submissions"
  ON public.lead_intake_submissions FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Anyone authenticated can submit intake forms"
  ON public.lead_intake_submissions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Public can submit intake forms"
  ON public.lead_intake_submissions FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add GHL sync columns to crm_leads
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS ghl_contact_id text;
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS ghl_last_synced_at timestamptz;
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS ghl_last_contact_method text;
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS ghl_last_contact_date timestamptz;
