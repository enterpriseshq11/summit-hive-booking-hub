-- Add storage_bucket_path to lead_documents
ALTER TABLE public.lead_documents ADD COLUMN IF NOT EXISTS storage_bucket_path text;

-- Add confirmation email tracking to lead_intake_submissions
ALTER TABLE public.lead_intake_submissions ADD COLUMN IF NOT EXISTS confirmation_email_status text DEFAULT 'pending';
ALTER TABLE public.lead_intake_submissions ADD COLUMN IF NOT EXISTS confirmation_email_sent_at timestamptz;