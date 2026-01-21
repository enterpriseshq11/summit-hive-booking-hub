-- Add idempotency fields for Lindsey booking confirmation emails
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS email_sent_customer_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS email_sent_staff_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_bookings_email_sent_customer_at ON public.bookings (email_sent_customer_at);
CREATE INDEX IF NOT EXISTS idx_bookings_email_sent_staff_at ON public.bookings (email_sent_staff_at);
