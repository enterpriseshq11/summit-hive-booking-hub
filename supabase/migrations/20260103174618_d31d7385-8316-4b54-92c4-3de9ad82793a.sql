-- Phase 2: Payroll & Payout Automation Schema

-- Payroll runs table with workflow states
CREATE TABLE public.payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'locked', 'approved', 'paid')),
  total_amount NUMERIC(12,2) DEFAULT 0,
  commission_count INTEGER DEFAULT 0,
  locked_at TIMESTAMPTZ,
  locked_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  paid_at TIMESTAMPTZ,
  paid_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(period_start, period_end)
);

-- Link commissions to payroll runs
ALTER TABLE public.crm_commissions 
ADD COLUMN IF NOT EXISTS payroll_run_id UUID REFERENCES public.payroll_runs(id);

-- Commission rule versioning columns
ALTER TABLE public.commission_rules
ADD COLUMN IF NOT EXISTS effective_from DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS effective_until DATE,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_rule_id UUID REFERENCES public.commission_rules(id);

-- Enable RLS on payroll_runs
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;

-- Admins have full access to payroll runs
CREATE POLICY "Admins can manage payroll runs" ON public.payroll_runs
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Employees can view payroll runs they have commissions in
CREATE POLICY "Employees can view their payroll runs" ON public.payroll_runs
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.crm_commissions 
    WHERE crm_commissions.payroll_run_id = payroll_runs.id 
    AND crm_commissions.employee_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_payroll_runs_updated_at
BEFORE UPDATE ON public.payroll_runs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable pg_cron and pg_net for scheduled alerts
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;