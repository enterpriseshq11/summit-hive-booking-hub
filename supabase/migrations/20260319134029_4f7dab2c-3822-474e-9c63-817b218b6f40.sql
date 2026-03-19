
-- Add contact tracking columns to crm_leads
ALTER TABLE public.crm_leads
  ADD COLUMN IF NOT EXISTS contact_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz;

-- Create crm_lead_tasks table
CREATE TABLE public.crm_lead_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES public.profiles(id),
  due_date timestamptz,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on crm_lead_tasks
ALTER TABLE public.crm_lead_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for crm_lead_tasks (authenticated users with roles)
CREATE POLICY "Authenticated users can view lead tasks"
  ON public.crm_lead_tasks FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert lead tasks"
  ON public.crm_lead_tasks FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update lead tasks"
  ON public.crm_lead_tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete lead tasks"
  ON public.crm_lead_tasks FOR DELETE TO authenticated USING (true);

-- Updated at trigger for tasks
CREATE TRIGGER update_crm_lead_tasks_updated_at
  BEFORE UPDATE ON public.crm_lead_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Index for quick lookup
CREATE INDEX idx_crm_lead_tasks_lead_id ON public.crm_lead_tasks(lead_id);
CREATE INDEX idx_crm_lead_tasks_assigned_to ON public.crm_lead_tasks(assigned_to);
CREATE INDEX idx_crm_lead_tasks_due_date ON public.crm_lead_tasks(due_date);
CREATE INDEX idx_crm_leads_contact_attempts ON public.crm_leads(contact_attempts);
CREATE INDEX idx_crm_leads_last_contacted_at ON public.crm_leads(last_contacted_at);
