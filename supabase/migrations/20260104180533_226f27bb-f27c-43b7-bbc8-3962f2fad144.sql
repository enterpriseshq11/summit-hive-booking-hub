-- Voice Vault Booking & Package Tables

-- Create enum for payment status
CREATE TYPE public.voice_vault_payment_status AS ENUM (
  'pending',
  'active_payment',
  'paused_payment',
  'paid_in_full',
  'defaulted'
);

-- Create enum for content ownership status (Phase 3)
CREATE TYPE public.voice_vault_content_status AS ENUM (
  'not_applicable',
  'recording_in_progress',
  'editing_in_progress',
  'payment_active',
  'paid_in_full',
  'rights_released'
);

-- Create enum for product type
CREATE TYPE public.voice_vault_product_type AS ENUM (
  'hourly',
  'core_series',
  'white_glove'
);

-- Create enum for payment plan
CREATE TYPE public.voice_vault_payment_plan AS ENUM (
  'full',
  'weekly'
);

-- Voice Vault Bookings table (for hourly rentals)
CREATE TABLE public.voice_vault_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours NUMERIC(4,2) NOT NULL,
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 45.00,
  total_amount NUMERIC(10,2) NOT NULL,
  payment_status public.voice_vault_payment_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Voice Vault Packages table (for podcast packages)
CREATE TABLE public.voice_vault_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  product_type public.voice_vault_product_type NOT NULL,
  payment_plan public.voice_vault_payment_plan NOT NULL,
  package_price NUMERIC(10,2) NOT NULL,
  paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  balance_remaining NUMERIC(10,2) NOT NULL,
  next_payment_date DATE,
  payment_status public.voice_vault_payment_status NOT NULL DEFAULT 'pending',
  content_status public.voice_vault_content_status NOT NULL DEFAULT 'not_applicable',
  rights_released_at TIMESTAMPTZ,
  rights_released_by UUID,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  stripe_checkout_session_id TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_voice_vault_bookings_date ON public.voice_vault_bookings(booking_date);
CREATE INDEX idx_voice_vault_bookings_email ON public.voice_vault_bookings(customer_email);
CREATE INDEX idx_voice_vault_packages_email ON public.voice_vault_packages(customer_email);
CREATE INDEX idx_voice_vault_packages_payment_status ON public.voice_vault_packages(payment_status);
CREATE INDEX idx_voice_vault_packages_content_status ON public.voice_vault_packages(content_status);

-- Enable RLS
ALTER TABLE public.voice_vault_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_vault_packages ENABLE ROW LEVEL SECURITY;

-- RLS policies for voice_vault_bookings
-- Public can insert (for guest checkout)
CREATE POLICY "Anyone can create a booking"
ON public.voice_vault_bookings
FOR INSERT
WITH CHECK (true);

-- Only staff can view all bookings
CREATE POLICY "Staff can view all bookings"
ON public.voice_vault_bookings
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

-- Only admin can update bookings
CREATE POLICY "Admin can update bookings"
ON public.voice_vault_bookings
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- RLS policies for voice_vault_packages
-- Public can insert (for guest checkout)
CREATE POLICY "Anyone can create a package order"
ON public.voice_vault_packages
FOR INSERT
WITH CHECK (true);

-- Only staff can view all packages
CREATE POLICY "Staff can view all packages"
ON public.voice_vault_packages
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

-- Only admin can update packages
CREATE POLICY "Admin can update packages"
ON public.voice_vault_packages
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_voice_vault_bookings_updated_at
BEFORE UPDATE ON public.voice_vault_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_voice_vault_packages_updated_at
BEFORE UPDATE ON public.voice_vault_packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();