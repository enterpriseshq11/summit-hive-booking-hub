-- Add Hive private office lease request pricing fields to existing office_inquiries
ALTER TABLE public.office_inquiries
  ADD COLUMN IF NOT EXISTS office_code text,
  ADD COLUMN IF NOT EXISTS lease_term_months integer,
  ADD COLUMN IF NOT EXISTS monthly_rate numeric,
  ADD COLUMN IF NOT EXISTS term_total numeric,
  ADD COLUMN IF NOT EXISTS deposit_amount numeric,
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS denial_reason text,
  ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS denied_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS idx_office_inquiries_approval_status
  ON public.office_inquiries (approval_status);

CREATE INDEX IF NOT EXISTS idx_office_inquiries_office_code
  ON public.office_inquiries (office_code);

CREATE INDEX IF NOT EXISTS idx_office_inquiries_created_at
  ON public.office_inquiries (created_at DESC);
