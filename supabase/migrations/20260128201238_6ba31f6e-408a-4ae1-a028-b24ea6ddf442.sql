-- Add UPDATE policy for app_config for authenticated users (admin check will be handled at app level)
CREATE POLICY "Authenticated users can update app config" 
ON public.app_config 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);