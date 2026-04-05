
-- Cadences table
CREATE TABLE public.cadences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trigger_stage text NOT NULL,
  business_unit text,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cadences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access cadences" ON public.cadences FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'owner')) WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE TRIGGER update_cadences_updated_at BEFORE UPDATE ON public.cadences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Cadence scheduled actions
CREATE TABLE public.cadence_scheduled_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  cadence_id uuid NOT NULL REFERENCES public.cadences(id) ON DELETE CASCADE,
  step_index int NOT NULL DEFAULT 0,
  scheduled_at timestamptz NOT NULL,
  fired boolean NOT NULL DEFAULT false,
  fired_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cadence_scheduled_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access cadence_actions" ON public.cadence_scheduled_actions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'owner')) WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE INDEX idx_cadence_actions_pending ON public.cadence_scheduled_actions (scheduled_at) WHERE fired = false;

-- Deployment checklist
CREATE TABLE public.deployment_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_key text NOT NULL UNIQUE,
  category text NOT NULL,
  label text NOT NULL,
  checked boolean NOT NULL DEFAULT false,
  checked_at timestamptz,
  checked_by uuid,
  notes text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.deployment_checklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access deployment_checklist" ON public.deployment_checklist FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'owner')) WITH CHECK (public.has_role(auth.uid(), 'owner'));
