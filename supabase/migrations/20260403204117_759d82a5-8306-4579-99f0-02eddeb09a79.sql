
-- ============================================================
-- 1. Fix crm_leads RLS for spa_lead restriction
-- ============================================================

-- Helper function: check if user has spa_lead role
CREATE OR REPLACE FUNCTION public.has_spa_lead_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'spa_lead'
  )
$$;

-- Helper: get user's department from user_roles
CREATE OR REPLACE FUNCTION public.get_user_department(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT department::text FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Drop the overly permissive "Staff can view all leads"
DROP POLICY IF EXISTS "Staff can view all leads" ON public.crm_leads;

-- Keep existing more restrictive policies, but add spa_lead restriction
-- The existing "Staff can view leads" policy allows admin, assigned, or created_by
-- We need to ADD a policy for spa_lead that restricts to spa only
-- And ensure other staff roles can still see all leads in global views

-- Drop and recreate the existing SELECT policies to consolidate
DROP POLICY IF EXISTS "Staff can view leads" ON public.crm_leads;
DROP POLICY IF EXISTS "Employees see assigned leads" ON public.crm_leads;

-- New consolidated SELECT policy
CREATE POLICY "Staff can view leads with department scoping"
ON public.crm_leads
FOR SELECT
TO authenticated
USING (
  -- Admins (owner, manager) see all
  public.is_admin(auth.uid())
  -- spa_lead sees only spa leads
  OR (public.has_spa_lead_role(auth.uid()) AND business_unit = 'spa')
  -- Other staff see all leads (sales_acquisitions, marketing_lead, ops_lead, ads_lead)
  OR (public.is_staff(auth.uid()) AND NOT public.has_spa_lead_role(auth.uid()))
);

-- spa_lead can only INSERT spa leads
DROP POLICY IF EXISTS "Staff can insert leads" ON public.crm_leads;
DROP POLICY IF EXISTS "Staff can create leads" ON public.crm_leads;

CREATE POLICY "Staff can insert leads with scoping"
ON public.crm_leads
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
  OR (public.has_spa_lead_role(auth.uid()) AND business_unit = 'spa')
  OR (public.is_staff(auth.uid()) AND NOT public.has_spa_lead_role(auth.uid()))
);

-- spa_lead can only UPDATE spa leads
DROP POLICY IF EXISTS "Staff can update leads" ON public.crm_leads;

CREATE POLICY "Staff can update leads with scoping"
ON public.crm_leads
FOR UPDATE
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR (public.has_spa_lead_role(auth.uid()) AND business_unit = 'spa')
  OR (public.is_staff(auth.uid()) AND NOT public.has_spa_lead_role(auth.uid()) AND (assigned_employee_id = auth.uid() OR public.is_admin(auth.uid())))
);

-- ============================================================
-- 2. Restrict lead_documents for spa_lead
-- ============================================================
DROP POLICY IF EXISTS "Staff can view lead documents" ON public.lead_documents;

CREATE POLICY "Staff can view lead documents scoped"
ON public.lead_documents
FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR (
    public.has_spa_lead_role(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.crm_leads cl
      WHERE cl.id = lead_documents.lead_id AND cl.business_unit = 'spa'
    )
  )
  OR (public.is_staff(auth.uid()) AND NOT public.has_spa_lead_role(auth.uid()))
);

DROP POLICY IF EXISTS "Staff can upload lead documents" ON public.lead_documents;

CREATE POLICY "Staff can upload lead documents scoped"
ON public.lead_documents
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
  OR (
    public.has_spa_lead_role(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.crm_leads cl
      WHERE cl.id = lead_documents.lead_id AND cl.business_unit = 'spa'
    )
  )
  OR (public.is_staff(auth.uid()) AND NOT public.has_spa_lead_role(auth.uid()))
);

-- ============================================================
-- 3. Restrict crm_lead_notes for spa_lead
-- ============================================================
DROP POLICY IF EXISTS "Staff can view lead notes" ON public.crm_lead_notes;

CREATE POLICY "Staff can view lead notes scoped"
ON public.crm_lead_notes
FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR (
    public.has_spa_lead_role(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.crm_leads cl
      WHERE cl.id = crm_lead_notes.lead_id AND cl.business_unit = 'spa'
    )
  )
  OR (public.is_staff(auth.uid()) AND NOT public.has_spa_lead_role(auth.uid()))
);

DROP POLICY IF EXISTS "Staff can create lead notes" ON public.crm_lead_notes;

CREATE POLICY "Staff can create lead notes scoped"
ON public.crm_lead_notes
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
  OR (
    public.has_spa_lead_role(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.crm_leads cl
      WHERE cl.id = crm_lead_notes.lead_id AND cl.business_unit = 'spa'
    )
  )
  OR (public.is_staff(auth.uid()) AND NOT public.has_spa_lead_role(auth.uid()))
);

-- ============================================================
-- 4. Restrict lead_intake_submissions for spa_lead
-- ============================================================
DROP POLICY IF EXISTS "Staff can view all intake submissions" ON public.lead_intake_submissions;

CREATE POLICY "Staff can view intake submissions scoped"
ON public.lead_intake_submissions
FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR (public.has_spa_lead_role(auth.uid()) AND business_unit = 'spa')
  OR (public.is_staff(auth.uid()) AND NOT public.has_spa_lead_role(auth.uid()))
);

-- ============================================================
-- 5. Revenue: remove staff insert, add marketing_lead read-only
-- ============================================================
DROP POLICY IF EXISTS "Staff can insert revenue" ON public.crm_revenue_events;

-- Staff can view revenue remains as-is (admin or attributed or recorded_by)
-- The existing "Admins can manage revenue" handles write for admins
-- Marketing lead can view all revenue but not write
DROP POLICY IF EXISTS "Staff can view revenue" ON public.crm_revenue_events;

CREATE POLICY "Staff can view revenue scoped"
ON public.crm_revenue_events
FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR employee_attributed_id = auth.uid()
  OR recorded_by = auth.uid()
  OR public.is_staff(auth.uid()) -- all staff can view revenue
);

-- Only admins can INSERT/UPDATE/DELETE revenue (already covered by "Admins can manage revenue")
-- No additional INSERT policy for staff = marketing_lead cannot write
