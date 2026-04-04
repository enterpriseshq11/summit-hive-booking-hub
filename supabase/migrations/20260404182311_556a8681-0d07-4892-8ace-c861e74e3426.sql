-- Add 'rejected' to commission_status enum
ALTER TYPE public.commission_status ADD VALUE IF NOT EXISTS 'rejected';

-- Add rejection fields to crm_commissions
ALTER TABLE public.crm_commissions
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS rejected_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz;

-- Add pdf_url to payroll_runs
ALTER TABLE public.payroll_runs
  ADD COLUMN IF NOT EXISTS pdf_url text;

-- Create storage bucket for payroll PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payroll-pdfs', 'payroll-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to read payroll PDFs
CREATE POLICY "Authenticated users can read payroll PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'payroll-pdfs');

-- Allow service role to upload (edge functions use service role)
CREATE POLICY "Service role can upload payroll PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payroll-pdfs');