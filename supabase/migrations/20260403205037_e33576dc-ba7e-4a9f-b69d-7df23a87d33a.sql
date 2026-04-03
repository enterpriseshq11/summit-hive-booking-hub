-- 1. Add source_filter to crm_alerts
ALTER TABLE public.crm_alerts ADD COLUMN IF NOT EXISTS source_filter text;

-- 2. stripe_transactions
CREATE TABLE public.stripe_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payment_intent_id text UNIQUE NOT NULL,
  stripe_charge_id text,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL,
  business_unit text,
  customer_email text,
  customer_name text,
  payment_method_type text,
  stripe_created_at timestamptz,
  synced_at timestamptz,
  revenue_event_id uuid REFERENCES public.crm_revenue_events(id),
  is_duplicate boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.stripe_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage stripe transactions" ON public.stripe_transactions FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Owner can delete stripe transactions" ON public.stripe_transactions FOR DELETE USING (has_role(auth.uid(), 'owner'));

-- 3. stripe_refunds
CREATE TABLE public.stripe_refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_refund_id text UNIQUE NOT NULL,
  stripe_payment_intent_id text NOT NULL,
  amount integer NOT NULL,
  reason text,
  status text NOT NULL,
  business_unit text,
  revenue_event_id uuid REFERENCES public.crm_revenue_events(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.stripe_refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage stripe refunds" ON public.stripe_refunds FOR ALL USING (is_admin(auth.uid()));

-- 4. stripe_webhook_events
CREATE TABLE public.stripe_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  stripe_event_id text UNIQUE NOT NULL,
  payload jsonb NOT NULL,
  received_at timestamptz DEFAULT now(),
  processed boolean DEFAULT false
);
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook events" ON public.stripe_webhook_events FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Service can insert webhook events" ON public.stripe_webhook_events FOR INSERT WITH CHECK (true);

-- 5. payroll_run_items
CREATE TABLE public.payroll_run_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id uuid NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.profiles(id),
  commission_id uuid REFERENCES public.crm_commissions(id),
  item_type text NOT NULL CHECK (item_type IN ('commission', 'base_pay')),
  amount numeric NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.payroll_run_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payroll items" ON public.payroll_run_items FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Employees can view own items" ON public.payroll_run_items FOR SELECT USING (employee_id = auth.uid());

-- 6. phase1_checklist_items
CREATE TABLE public.phase1_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_number integer NOT NULL UNIQUE,
  description text NOT NULL,
  confirmed_by_system boolean DEFAULT false,
  confirmed_by_owner boolean DEFAULT false,
  confirmed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.phase1_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage checklist" ON public.phase1_checklist_items FOR ALL USING (has_role(auth.uid(), 'owner'));

-- 7. Tighten settings-related RLS

-- ghl_webhook_config: change ALL from admin to owner for writes
DROP POLICY IF EXISTS "Admins can modify webhook configs" ON public.ghl_webhook_config;
CREATE POLICY "Owner can modify webhook configs" ON public.ghl_webhook_config FOR ALL USING (has_role(auth.uid(), 'owner'));

-- ghl_pipeline_stage_webhooks: same
DROP POLICY IF EXISTS "Admins can modify pipeline webhooks" ON public.ghl_pipeline_stage_webhooks;
CREATE POLICY "Owner can modify pipeline webhooks" ON public.ghl_pipeline_stage_webhooks FOR ALL USING (has_role(auth.uid(), 'owner'));

-- audit_log: tighten SELECT to owner only
DROP POLICY IF EXISTS "Admins can view audit log" ON public.audit_log;
CREATE POLICY "Owner can view audit log" ON public.audit_log FOR SELECT USING (has_role(auth.uid(), 'owner'));

-- user_roles: confirm owner-only write already in place (it is - "Admins can manage roles" uses owner)

-- 8. Revenue auto-creation trigger scaffold
CREATE OR REPLACE FUNCTION public.auto_create_revenue_from_stripe()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_revenue_id uuid;
BEGIN
  IF NEW.status != 'succeeded' THEN
    RETURN NEW;
  END IF;

  -- Skip duplicates
  IF NEW.is_duplicate THEN
    RETURN NEW;
  END IF;

  BEGIN
    INSERT INTO public.crm_revenue_events (
      amount, business_unit, description, recorded_by, revenue_date
    ) VALUES (
      NEW.amount::numeric / 100.0,
      COALESCE(NEW.business_unit, 'spa')::business_type,
      'Auto-created from Stripe payment ' || NEW.stripe_payment_intent_id,
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'),
      COALESCE(NEW.stripe_created_at, now())::date
    )
    RETURNING id INTO v_revenue_id;

    NEW.revenue_event_id := v_revenue_id;

    INSERT INTO public.crm_activity_events (event_type, entity_type, entity_id, entity_name, metadata)
    VALUES (
      'status_change',
      'stripe_transaction',
      NEW.id::text,
      'Stripe Payment',
      jsonb_build_object('action', 'revenue_auto_created', 'revenue_event_id', v_revenue_id, 'amount_cents', NEW.amount)
    );
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.crm_activity_events (event_type, entity_type, entity_id, entity_name, metadata)
    VALUES (
      'status_change',
      'stripe_transaction',
      NEW.id::text,
      'Stripe Payment',
      jsonb_build_object('action', 'revenue_auto_create_failed', 'error', SQLERRM, 'amount_cents', NEW.amount)
    );
  END;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_revenue_from_stripe
BEFORE INSERT ON public.stripe_transactions
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_revenue_from_stripe();

-- 9. Seed Phase 1 checklist items
INSERT INTO public.phase1_checklist_items (item_number, description, confirmed_by_system) VALUES
(1, 'Activity log shows real names for all team members', false),
(2, 'Kae auto-role assignment at kae@a-zenterpriseshq.com', false),
(3, 'Rose auto-role assignment at rose@a-zenterpriseshq.com', false),
(4, 'Dylan sees all 8 sidebar sections', false),
(5, 'Victoria cannot see Settings, Payroll, or others'' commission', false),
(6, 'Mark sees all units in global Sales, Summit and Mobile Homes under Businesses', false),
(7, 'Nasiya sees only Spa section, Spa leads only via RLS', true),
(8, 'Elyse Revenue view-only at UI and RLS level', true),
(9, 'Rose sees correct sections after account creation', false),
(10, 'Kae sees correct sections after account creation', false),
(11, 'Settings requireOwner guard with RLS on all settings tables', false),
(12, 'Sidebar 8-section full tree matches spec', true),
(13, 'Dashboard 25+ tiles with live data, payroll tile inline edit', true),
(14, 'Drag resize reorder persists after logout', false),
(15, 'All 6 intake forms live at public URLs, mobile responsive', false),
(16, 'Test submission creates lead correctly in all 6 units', true),
(17, 'GHL webhook fires on intake submissions and logs correctly', true),
(18, 'Confirmation email sends after each submission', false),
(19, 'Mobile Homes fully functional with void and gross profit', false),
(20, 'All sub-page routes role-protected with Phase 2 stubs', true),
(21, 'Lead detail and pipeline board GHL webhook on every stage movement', true),
(22, 'Alerts with correct role-based visibility including Kae structured field filter', false),
(23, 'All sidebar links resolve with no 404 errors', true),
(24, 'Build clean zero errors zero warnings', false),
(25, 'Orphaned files table, cleanup logic, and admin page built', true);