
-- 1. Restrict app_config public reads to non-sensitive keys (toggles/multipliers only)
DROP POLICY IF EXISTS "App config is publicly readable" ON public.app_config;

CREATE POLICY "Public can read non-sensitive app config"
ON public.app_config
FOR SELECT
TO anon, authenticated
USING (
  key NOT ILIKE '%_ID'
  AND key NOT ILIKE '%PRICE%'
  AND key NOT ILIKE '%SECRET%'
  AND key NOT ILIKE '%KEY%'
  AND key NOT ILIKE '%TOKEN%'
);

CREATE POLICY "Admins can read all app config"
ON public.app_config
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- 2. Lock down giveaway_entries inserts to the authenticated user themselves
DROP POLICY IF EXISTS "Service role can insert entries" ON public.giveaway_entries;

CREATE POLICY "Users can insert their own entries"
ON public.giveaway_entries
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role manages giveaway entries"
ON public.giveaway_entries
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Remove bookings (which contains guest PII) from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.bookings;

-- 4. Add storage DELETE policy for lead-documents (admins only)
CREATE POLICY "Admins can delete lead documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'lead-documents' AND is_admin(auth.uid()));
