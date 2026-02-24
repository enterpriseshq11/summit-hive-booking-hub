
-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create storage bucket for E3 documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('e3-documents', 'e3-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for e3-documents bucket
-- Authenticated users can upload documents
CREATE POLICY "Authenticated users can upload e3 documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'e3-documents');

-- Users can view documents they uploaded or if they're admin/coordinator
CREATE POLICY "Authenticated users can view e3 documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'e3-documents');

-- Only admins can delete e3 documents
CREATE POLICY "Admins can delete e3 documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'e3-documents'
  AND public.is_admin(auth.uid())
);
