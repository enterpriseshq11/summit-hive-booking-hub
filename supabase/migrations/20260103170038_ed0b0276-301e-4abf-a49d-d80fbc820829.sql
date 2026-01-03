-- Drop existing policies on crm_leads and recreate with employee scoping
DROP POLICY IF EXISTS "Staff can view leads" ON public.crm_leads;
DROP POLICY IF EXISTS "Staff can insert leads" ON public.crm_leads;
DROP POLICY IF EXISTS "Staff can update leads" ON public.crm_leads;

-- Employees see only their assigned leads; Admins see all
CREATE POLICY "Staff can view leads" ON public.crm_leads
FOR SELECT TO authenticated
USING (
  public.is_admin(auth.uid()) 
  OR assigned_employee_id = auth.uid()
  OR created_by = auth.uid()
);

CREATE POLICY "Staff can insert leads" ON public.crm_leads
FOR INSERT TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update leads" ON public.crm_leads
FOR UPDATE TO authenticated
USING (
  public.is_admin(auth.uid()) 
  OR assigned_employee_id = auth.uid()
);

-- Drop existing policies on crm_commissions and recreate with employee scoping
DROP POLICY IF EXISTS "Staff can view commissions" ON public.crm_commissions;
DROP POLICY IF EXISTS "Admins can manage commissions" ON public.crm_commissions;

-- Employees see only their own commissions; Admins see all
CREATE POLICY "Staff can view commissions" ON public.crm_commissions
FOR SELECT TO authenticated
USING (
  public.is_admin(auth.uid()) 
  OR employee_id = auth.uid()
);

CREATE POLICY "Admins can manage commissions" ON public.crm_commissions
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Drop existing policies on profiles and recreate with employee scoping
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Users see their own profile; Admins see all profiles
CREATE POLICY "Users can view profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = auth.uid() 
  OR public.is_admin(auth.uid())
);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid());

-- Drop existing policies on crm_revenue_events and recreate with employee scoping
DROP POLICY IF EXISTS "Staff can view revenue" ON public.crm_revenue_events;
DROP POLICY IF EXISTS "Staff can insert revenue" ON public.crm_revenue_events;

-- Employees see revenue they recorded or are attributed; Admins see all
CREATE POLICY "Staff can view revenue" ON public.crm_revenue_events
FOR SELECT TO authenticated
USING (
  public.is_admin(auth.uid()) 
  OR employee_attributed_id = auth.uid()
  OR recorded_by = auth.uid()
);

CREATE POLICY "Staff can insert revenue" ON public.crm_revenue_events
FOR INSERT TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

-- Drop existing policies on employee_notes
DROP POLICY IF EXISTS "Admins can manage employee notes" ON public.employee_notes;

-- Only admins can view/manage employee notes
CREATE POLICY "Admins can manage employee notes" ON public.employee_notes
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));