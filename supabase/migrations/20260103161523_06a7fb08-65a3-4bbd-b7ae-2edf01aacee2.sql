-- ===========================================
-- A-Z ENTERPRISES COMMAND CENTER - CRM SCHEMA
-- ===========================================

-- Enum for lead status
CREATE TYPE public.crm_lead_status AS ENUM (
  'new',
  'contacted',
  'qualified',
  'proposal_sent',
  'won',
  'lost'
);

-- Enum for lead source
CREATE TYPE public.crm_lead_source AS ENUM (
  'website',
  'referral',
  'walk_in',
  'phone',
  'social_media',
  'email',
  'event',
  'other'
);

-- Enum for activity event type
CREATE TYPE public.crm_activity_type AS ENUM (
  'login',
  'logout',
  'lead_created',
  'lead_updated',
  'lead_status_changed',
  'lead_assigned',
  'lead_note_added',
  'revenue_created',
  'commission_approved',
  'commission_paid',
  'admin_override',
  'setting_changed',
  'user_disabled',
  'user_enabled',
  'impersonation_started',
  'impersonation_ended'
);

-- Enum for commission status
CREATE TYPE public.commission_status AS ENUM (
  'pending',
  'approved',
  'queued',
  'paid'
);

-- ===========================================
-- CRM LEADS TABLE
-- ===========================================
CREATE TABLE public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_name TEXT,
  business_unit public.business_type NOT NULL,
  source public.crm_lead_source DEFAULT 'website',
  status public.crm_lead_status DEFAULT 'new',
  assigned_employee_id UUID REFERENCES public.profiles(id),
  follow_up_due TIMESTAMPTZ,
  revenue_attached DECIMAL(10,2) DEFAULT 0,
  lost_reason TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crm_leads
-- Admins/Managers can see all
CREATE POLICY "Staff can view all leads"
  ON public.crm_leads FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

-- Employees can only see assigned leads
CREATE POLICY "Employees see assigned leads"
  ON public.crm_leads FOR SELECT
  TO authenticated
  USING (assigned_employee_id = auth.uid());

-- Admins/Managers can insert
CREATE POLICY "Staff can create leads"
  ON public.crm_leads FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

-- Admins/Managers can update all, employees can update assigned
CREATE POLICY "Staff can update leads"
  ON public.crm_leads FOR UPDATE
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR 
    assigned_employee_id = auth.uid()
  );

-- Only admins can delete
CREATE POLICY "Admins can delete leads"
  ON public.crm_leads FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ===========================================
-- CRM LEAD NOTES TABLE
-- ===========================================
CREATE TABLE public.crm_lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crm_lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view lead notes"
  ON public.crm_lead_notes FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can create lead notes"
  ON public.crm_lead_notes FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

-- ===========================================
-- CRM ACTIVITY EVENTS TABLE (IMMUTABLE AUDIT LOG)
-- ===========================================
CREATE TABLE public.crm_activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type public.crm_activity_type NOT NULL,
  actor_id UUID REFERENCES public.profiles(id),
  entity_type TEXT,
  entity_id UUID,
  entity_name TEXT,
  before_data JSONB,
  after_data JSONB,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crm_activity_events ENABLE ROW LEVEL SECURITY;

-- Only staff can view activity
CREATE POLICY "Staff can view activity"
  ON public.crm_activity_events FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

-- Staff can insert activity (for logging)
CREATE POLICY "Staff can log activity"
  ON public.crm_activity_events FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

-- No updates or deletes - immutable log

-- ===========================================
-- CRM REVENUE EVENTS TABLE
-- ===========================================
CREATE TABLE public.crm_revenue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.crm_leads(id),
  business_unit public.business_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  revenue_date DATE DEFAULT CURRENT_DATE,
  recorded_by UUID NOT NULL REFERENCES public.profiles(id),
  employee_attributed_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crm_revenue_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view revenue"
  ON public.crm_revenue_events FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins can manage revenue"
  ON public.crm_revenue_events FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ===========================================
-- COMMISSION RULES TABLE
-- ===========================================
CREATE TABLE public.commission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  employee_id UUID REFERENCES public.profiles(id),
  business_unit public.business_type,
  commission_percent DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  min_revenue DECIMAL(10,2),
  max_revenue DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view commission rules"
  ON public.commission_rules FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins can manage commission rules"
  ON public.commission_rules FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ===========================================
-- COMMISSIONS TABLE
-- ===========================================
CREATE TABLE public.crm_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  revenue_event_id UUID NOT NULL REFERENCES public.crm_revenue_events(id),
  rule_id UUID REFERENCES public.commission_rules(id),
  amount DECIMAL(10,2) NOT NULL,
  status public.commission_status DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crm_commissions ENABLE ROW LEVEL SECURITY;

-- Staff can view all, employees can view their own
CREATE POLICY "Staff can view commissions"
  ON public.crm_commissions FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR 
    employee_id = auth.uid()
  );

CREATE POLICY "Admins can manage commissions"
  ON public.crm_commissions FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ===========================================
-- CRM ALERTS TABLE
-- ===========================================
CREATE TABLE public.crm_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  target_roles TEXT[],
  target_user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crm_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view alerts"
  ON public.crm_alerts FOR SELECT
  TO authenticated
  USING (
    public.is_staff(auth.uid()) AND
    (target_user_id IS NULL OR target_user_id = auth.uid())
  );

CREATE POLICY "Staff can update alerts"
  ON public.crm_alerts FOR UPDATE
  TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "System can create alerts"
  ON public.crm_alerts FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

-- ===========================================
-- USER SESSIONS TABLE (for tracking)
-- ===========================================
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sessions"
  ON public.user_sessions FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can manage own sessions"
  ON public.user_sessions FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- ===========================================
-- EMPLOYEE PERFORMANCE NOTES (Admin only)
-- ===========================================
CREATE TABLE public.employee_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'performance', 'warning', 'commendation')),
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.employee_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage employee notes"
  ON public.employee_notes FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================
CREATE INDEX idx_crm_leads_status ON public.crm_leads(status);
CREATE INDEX idx_crm_leads_assigned ON public.crm_leads(assigned_employee_id);
CREATE INDEX idx_crm_leads_business_unit ON public.crm_leads(business_unit);
CREATE INDEX idx_crm_leads_created ON public.crm_leads(created_at);
CREATE INDEX idx_crm_activity_type ON public.crm_activity_events(event_type);
CREATE INDEX idx_crm_activity_actor ON public.crm_activity_events(actor_id);
CREATE INDEX idx_crm_activity_created ON public.crm_activity_events(created_at);
CREATE INDEX idx_crm_revenue_employee ON public.crm_revenue_events(employee_attributed_id);
CREATE INDEX idx_crm_commissions_employee ON public.crm_commissions(employee_id);
CREATE INDEX idx_crm_commissions_status ON public.crm_commissions(status);
CREATE INDEX idx_crm_alerts_read ON public.crm_alerts(is_read);

-- ===========================================
-- UPDATED_AT TRIGGERS
-- ===========================================
CREATE TRIGGER update_crm_leads_updated_at
  BEFORE UPDATE ON public.crm_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_crm_revenue_updated_at
  BEFORE UPDATE ON public.crm_revenue_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_commission_rules_updated_at
  BEFORE UPDATE ON public.commission_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_crm_commissions_updated_at
  BEFORE UPDATE ON public.crm_commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();