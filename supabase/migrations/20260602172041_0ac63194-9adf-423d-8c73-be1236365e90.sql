
-- ============================================================
-- SECURITY HARDENING: fix critical RLS findings
-- ============================================================

-- 1. app_config: only admins may update Stripe price IDs etc.
DROP POLICY IF EXISTS "Authenticated users can update app config" ON public.app_config;
CREATE POLICY "Admins can update app config"
ON public.app_config FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert app config"
ON public.app_config FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete app config"
ON public.app_config FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- 2. notification_logs: replace public ALL with service_role-only
DROP POLICY IF EXISTS "Service role can manage notification logs" ON public.notification_logs;
CREATE POLICY "Service role manages notification logs"
ON public.notification_logs FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- 3. user_streaks: replace public ALL with service_role-only
DROP POLICY IF EXISTS "Service role can manage streaks" ON public.user_streaks;
CREATE POLICY "Service role manages streaks"
ON public.user_streaks FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- 4. voice_vault_bookings: drop public ALL
DROP POLICY IF EXISTS "Service role can manage voice vault bookings" ON public.voice_vault_bookings;
CREATE POLICY "Service role manages vv bookings"
ON public.voice_vault_bookings FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- 5. voice_vault_packages: drop public ALL
DROP POLICY IF EXISTS "Service role can manage voice vault packages" ON public.voice_vault_packages;
CREATE POLICY "Service role manages vv packages"
ON public.voice_vault_packages FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- 6. crm_lead_tasks: lock down to staff (admins always; non-admin staff
--    restricted away from spa leads unless they are spa_lead).
DROP POLICY IF EXISTS "Authenticated users can view lead tasks" ON public.crm_lead_tasks;
DROP POLICY IF EXISTS "Authenticated users can insert lead tasks" ON public.crm_lead_tasks;
DROP POLICY IF EXISTS "Authenticated users can update lead tasks" ON public.crm_lead_tasks;
DROP POLICY IF EXISTS "Authenticated users can delete lead tasks" ON public.crm_lead_tasks;

CREATE POLICY "Staff can view scoped lead tasks"
ON public.crm_lead_tasks FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR (
    public.is_staff(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.crm_leads cl
      WHERE cl.id = crm_lead_tasks.lead_id
        AND (
          NOT public.has_spa_lead_role(auth.uid())
          OR cl.business_unit = 'spa'
        )
    )
  )
);

CREATE POLICY "Staff can insert scoped lead tasks"
ON public.crm_lead_tasks FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
  OR (
    public.is_staff(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.crm_leads cl
      WHERE cl.id = crm_lead_tasks.lead_id
        AND (
          NOT public.has_spa_lead_role(auth.uid())
          OR cl.business_unit = 'spa'
        )
    )
  )
);

CREATE POLICY "Staff can update scoped lead tasks"
ON public.crm_lead_tasks FOR UPDATE
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR (
    public.is_staff(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.crm_leads cl
      WHERE cl.id = crm_lead_tasks.lead_id
        AND (
          NOT public.has_spa_lead_role(auth.uid())
          OR cl.business_unit = 'spa'
        )
    )
  )
)
WITH CHECK (
  public.is_admin(auth.uid()) OR public.is_staff(auth.uid())
);

CREATE POLICY "Admins can delete lead tasks"
ON public.crm_lead_tasks FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- 7. edge_function_errors: restrict INSERT to service_role
DROP POLICY IF EXISTS "Service role can insert errors" ON public.edge_function_errors;
CREATE POLICY "Service role inserts errors"
ON public.edge_function_errors FOR INSERT
TO service_role
WITH CHECK (true);

-- 8. stripe_webhook_events: restrict INSERT to service_role
DROP POLICY IF EXISTS "Service can insert webhook events" ON public.stripe_webhook_events;
CREATE POLICY "Service role inserts webhook events"
ON public.stripe_webhook_events FOR INSERT
TO service_role
WITH CHECK (true);

-- 9. payroll-pdfs storage bucket: admin-only SELECT
DROP POLICY IF EXISTS "Authenticated users can read payroll PDFs" ON storage.objects;
CREATE POLICY "Admins can read payroll PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payroll-pdfs'
  AND public.is_admin(auth.uid())
);

-- 10. realtime.messages: restrict subscriptions to staff to avoid
--     leaking booking row-change events to all authenticated users.
DROP POLICY IF EXISTS "Staff can read realtime messages" ON realtime.messages;
CREATE POLICY "Staff can read realtime messages"
ON realtime.messages FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));
