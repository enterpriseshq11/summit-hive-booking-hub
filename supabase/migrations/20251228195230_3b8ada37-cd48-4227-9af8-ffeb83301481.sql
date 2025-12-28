-- =============================================
-- A-Z BOOKING HUB - CORE DATABASE SCHEMA
-- Phase 1 Implementation: All Core Tables
-- =============================================

-- ENUMS
CREATE TYPE public.app_role AS ENUM (
  'owner',
  'manager',
  'event_coordinator',
  'spa_lead',
  'coworking_manager',
  'fitness_lead',
  'front_desk',
  'read_only'
);

CREATE TYPE public.business_type AS ENUM (
  'summit',
  'coworking',
  'spa',
  'fitness'
);

CREATE TYPE public.booking_mode AS ENUM (
  'instant',
  'request'
);

CREATE TYPE public.booking_status AS ENUM (
  'pending',
  'pending_payment',
  'pending_documents',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);

CREATE TYPE public.payment_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'partial_refund'
);

CREATE TYPE public.document_type AS ENUM (
  'contract',
  'waiver',
  'policy',
  'intake_form'
);

CREATE TYPE public.membership_status AS ENUM (
  'active',
  'paused',
  'cancelled',
  'expired',
  'pending'
);

CREATE TYPE public.resource_type AS ENUM (
  'room',
  'office',
  'suite',
  'equipment',
  'provider',
  'amenity'
);

CREATE TYPE public.lead_status AS ENUM (
  'new',
  'contacted',
  'qualified',
  'proposal_sent',
  'negotiating',
  'won',
  'lost'
);

CREATE TYPE public.notification_channel AS ENUM (
  'email',
  'sms',
  'push'
);

CREATE TYPE public.pricing_modifier_type AS ENUM (
  'percentage',
  'fixed_amount'
);

CREATE TYPE public.addon_pricing_mode AS ENUM (
  'flat',
  'per_hour',
  'per_guest',
  'time_based'
);

-- =============================================
-- CORE TABLES
-- =============================================

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  marketing_opt_in BOOLEAN DEFAULT false,
  sms_opt_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Roles (separate table for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  department public.business_type,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role, department)
);

-- Businesses
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.business_type NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bookable Types (categories within each business)
CREATE TABLE public.bookable_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  booking_mode public.booking_mode DEFAULT 'instant',
  min_duration_mins INTEGER DEFAULT 60,
  max_duration_mins INTEGER,
  buffer_before_mins INTEGER DEFAULT 0,
  buffer_after_mins INTEGER DEFAULT 0,
  hold_duration_mins INTEGER DEFAULT 10,
  min_advance_hours INTEGER DEFAULT 0,
  max_advance_days INTEGER DEFAULT 365,
  min_guests INTEGER DEFAULT 1,
  max_guests INTEGER,
  requires_deposit BOOLEAN DEFAULT false,
  deposit_percentage NUMERIC(5,2) DEFAULT 0,
  deposit_fixed_amount NUMERIC(10,2),
  balance_due_days_before INTEGER DEFAULT 0,
  requires_waiver BOOLEAN DEFAULT false,
  requires_contract BOOLEAN DEFAULT false,
  requires_intake BOOLEAN DEFAULT false,
  allow_guest_checkout BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, slug)
);

-- Resources (rooms, offices, equipment, etc.)
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  type public.resource_type NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  capacity INTEGER,
  square_footage INTEGER,
  amenities JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, slug)
);

-- Resource-Bookable Type mapping (which resources can be used for which bookable types)
CREATE TABLE public.resource_bookable_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  bookable_type_id UUID NOT NULL REFERENCES public.bookable_types(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(resource_id, bookable_type_id)
);

-- Providers (staff/service providers for spa, trainers, coordinators)
CREATE TABLE public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  avatar_url TEXT,
  specialties JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  accepts_bookings BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Provider Schedules
CREATE TABLE public.provider_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_id, day_of_week, start_time)
);

-- Availability Windows (operating hours per resource/bookable type)
CREATE TABLE public.availability_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  bookable_type_id UUID REFERENCES public.bookable_types(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (resource_id IS NOT NULL OR bookable_type_id IS NOT NULL)
);

-- Blackout Dates
CREATE TABLE public.blackout_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT,
  is_request_only BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Packages (service packages/bundles)
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bookable_type_id UUID NOT NULL REFERENCES public.bookable_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  duration_mins INTEGER NOT NULL,
  base_price NUMERIC(10,2) NOT NULL,
  member_price NUMERIC(10,2),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  included_items JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(bookable_type_id, slug)
);

-- Addons
CREATE TABLE public.addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  bookable_type_id UUID REFERENCES public.bookable_types(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  pricing_mode public.addon_pricing_mode DEFAULT 'flat',
  base_price NUMERIC(10,2) NOT NULL,
  member_price NUMERIC(10,2),
  adds_duration_mins INTEGER DEFAULT 0,
  requires_resource BOOLEAN DEFAULT false,
  resource_type public.resource_type,
  max_quantity INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  constraints JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, slug)
);

-- Pricing Rules
CREATE TABLE public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  bookable_type_id UUID REFERENCES public.bookable_types(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '{}',
  modifier_type public.pricing_modifier_type NOT NULL,
  modifier_value NUMERIC(10,2) NOT NULL,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from DATE,
  valid_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT UNIQUE NOT NULL,
  business_id UUID NOT NULL REFERENCES public.businesses(id),
  bookable_type_id UUID NOT NULL REFERENCES public.bookable_types(id),
  package_id UUID REFERENCES public.packages(id),
  customer_id UUID REFERENCES auth.users(id),
  guest_email TEXT,
  guest_phone TEXT,
  guest_name TEXT,
  status public.booking_status DEFAULT 'pending',
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  guest_count INTEGER DEFAULT 1,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  deposit_amount NUMERIC(10,2) DEFAULT 0,
  balance_due NUMERIC(10,2) DEFAULT 0,
  balance_due_date DATE,
  notes TEXT,
  internal_notes TEXT,
  promo_code_id UUID,
  gift_card_id UUID,
  assigned_provider_id UUID REFERENCES public.providers(id),
  assigned_coordinator_id UUID REFERENCES public.providers(id),
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for bookings
CREATE INDEX idx_bookings_datetime ON public.bookings(start_datetime, end_datetime);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX idx_bookings_business ON public.bookings(business_id);

-- Booking Resources (resources consumed by a booking)
CREATE TABLE public.booking_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_resources_resource ON public.booking_resources(resource_id, start_datetime, end_datetime);

-- Booking Addons
CREATE TABLE public.booking_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES public.addons(id),
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Slot Holds (temporary holds during checkout)
CREATE TABLE public.slot_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bookable_type_id UUID NOT NULL REFERENCES public.bookable_types(id),
  resource_id UUID REFERENCES public.resources(id),
  provider_id UUID REFERENCES public.providers(id),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_slot_holds_expires ON public.slot_holds(expires_at, status);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id),
  membership_id UUID,
  customer_id UUID REFERENCES auth.users(id),
  amount NUMERIC(10,2) NOT NULL,
  payment_type TEXT NOT NULL,
  status public.payment_status DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  payment_method_type TEXT,
  payment_method_last4 TEXT,
  refund_amount NUMERIC(10,2) DEFAULT 0,
  refund_reason TEXT,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_due_date ON public.payments(due_date, status);

-- Payment Schedules
CREATE TABLE public.payment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id),
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gift Cards
CREATE TABLE public.gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  initial_amount NUMERIC(10,2) NOT NULL,
  current_balance NUMERIC(10,2) NOT NULL,
  purchased_by UUID REFERENCES auth.users(id),
  recipient_email TEXT,
  recipient_name TEXT,
  message TEXT,
  expires_at DATE,
  is_active BOOLEAN DEFAULT true,
  redeemed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Promo Codes
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type public.pricing_modifier_type NOT NULL,
  discount_value NUMERIC(10,2) NOT NULL,
  min_purchase_amount NUMERIC(10,2),
  max_discount_amount NUMERIC(10,2),
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  per_user_limit INTEGER DEFAULT 1,
  applicable_businesses UUID[],
  applicable_bookable_types UUID[],
  requires_membership BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Membership Tiers
CREATE TABLE public.membership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  monthly_price NUMERIC(10,2) NOT NULL,
  annual_price NUMERIC(10,2),
  features JSONB DEFAULT '[]',
  max_pauses_per_year INTEGER DEFAULT 2,
  max_pause_days INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, slug)
);

-- Memberships
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES public.membership_tiers(id),
  status public.membership_status DEFAULT 'pending',
  billing_cycle TEXT DEFAULT 'monthly',
  stripe_subscription_id TEXT,
  current_period_start DATE,
  current_period_end DATE,
  paused_at TIMESTAMPTZ,
  pause_resume_date DATE,
  pauses_used_this_year INTEGER DEFAULT 0,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Membership Benefits
CREATE TABLE public.membership_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id UUID NOT NULL REFERENCES public.membership_tiers(id) ON DELETE CASCADE,
  benefit_type TEXT NOT NULL,
  applicable_business_id UUID REFERENCES public.businesses(id),
  applicable_bookable_type_id UUID REFERENCES public.bookable_types(id),
  discount_type public.pricing_modifier_type,
  discount_value NUMERIC(10,2),
  free_units_per_period INTEGER,
  priority_booking_hours INTEGER DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Document Templates
CREATE TABLE public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  bookable_type_id UUID REFERENCES public.bookable_types(id),
  type public.document_type NOT NULL,
  name TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  content TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  requires_signature BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Signed Documents
CREATE TABLE public.signed_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.document_templates(id),
  template_version INTEGER NOT NULL,
  booking_id UUID REFERENCES public.bookings(id),
  membership_id UUID REFERENCES public.memberships(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  signature_data TEXT,
  ip_address INET,
  user_agent TEXT,
  content_hash TEXT,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  booking_id UUID REFERENCES public.bookings(id),
  channel public.notification_channel NOT NULL,
  template_type TEXT NOT NULL,
  recipient_email TEXT,
  recipient_phone TEXT,
  subject TEXT,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  admin_response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id),
  bookable_type_id UUID REFERENCES public.bookable_types(id),
  status public.lead_status DEFAULT 'new',
  source TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  event_type TEXT,
  preferred_dates JSONB DEFAULT '[]',
  guest_count INTEGER,
  budget_range TEXT,
  notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  converted_booking_id UUID REFERENCES public.bookings(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Waitlist Entries
CREATE TABLE public.waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id),
  bookable_type_id UUID REFERENCES public.bookable_types(id),
  resource_id UUID REFERENCES public.resources(id),
  user_id UUID REFERENCES auth.users(id),
  guest_email TEXT,
  guest_phone TEXT,
  preferred_date DATE,
  preferred_time_start TIME,
  preferred_time_end TIME,
  flexibility_days INTEGER DEFAULT 0,
  is_vip BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'waiting',
  claim_token TEXT UNIQUE,
  claim_expires_at TIMESTAMPTZ,
  notified_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  position INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Checklists (operational checklists for bookings)
CREATE TABLE public.checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  template_id UUID,
  name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  completed_items JSONB DEFAULT '[]',
  assigned_to UUID REFERENCES auth.users(id),
  due_datetime TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Checklist Templates
CREATE TABLE public.checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  bookable_type_id UUID REFERENCES public.bookable_types(id),
  name TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  trigger_type TEXT,
  trigger_offset_hours INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit Log
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before_json JSONB,
  after_json JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_actor ON public.audit_log(actor_user_id);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at);

-- Assumptions Register
CREATE TABLE public.assumptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assumption_text TEXT NOT NULL,
  reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active',
  replaced_by UUID REFERENCES public.assumptions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customer Wallet
CREATE TABLE public.customer_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wallet Transactions
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.customer_wallets(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  transaction_type TEXT NOT NULL,
  description TEXT,
  booking_id UUID REFERENCES public.bookings(id),
  gift_card_id UUID REFERENCES public.gift_cards(id),
  payment_id UUID REFERENCES public.payments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Referrals
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id),
  referred_id UUID REFERENCES auth.users(id),
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  reward_amount NUMERIC(10,2),
  reward_credited_at TIMESTAMPTZ,
  booking_id UUID REFERENCES public.bookings(id),
  membership_id UUID REFERENCES public.memberships(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Guest Passes (for coworking)
CREATE TABLE public.guest_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID NOT NULL REFERENCES public.memberships(id) ON DELETE CASCADE,
  pass_code TEXT UNIQUE NOT NULL,
  guest_name TEXT,
  guest_email TEXT,
  valid_date DATE NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- SECURITY FUNCTIONS
-- =============================================

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if user has any staff role
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- Check if user is owner or manager
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('owner', 'manager')
  )
$$;

-- Check department access
CREATE OR REPLACE FUNCTION public.has_department_access(_user_id UUID, _business_type public.business_type)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (
        role IN ('owner', 'manager')
        OR department = _business_type
        OR department IS NULL
      )
  )
$$;

-- Generate booking number
CREATE OR REPLACE FUNCTION public.generate_booking_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  prefix TEXT;
  seq_num TEXT;
BEGIN
  prefix := 'AZ';
  seq_num := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  RETURN prefix || TO_CHAR(NOW(), 'YYMMDD') || seq_num;
END;
$$;

-- Trigger to auto-generate booking number
CREATE OR REPLACE FUNCTION public.set_booking_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.booking_number IS NULL THEN
    NEW.booking_number := public.generate_booking_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_booking_number
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_booking_number();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_bookable_types_updated_at BEFORE UPDATE ON public.bookable_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_addons_updated_at BEFORE UPDATE ON public.addons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON public.pricing_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_gift_cards_updated_at BEFORE UPDATE ON public.gift_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON public.promo_codes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_membership_tiers_updated_at BEFORE UPDATE ON public.membership_tiers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON public.document_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_checklists_updated_at BEFORE UPDATE ON public.checklists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_checklist_templates_updated_at BEFORE UPDATE ON public.checklist_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_customer_wallets_updated_at BEFORE UPDATE ON public.customer_wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  -- Create wallet for new user
  INSERT INTO public.customer_wallets (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookable_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_bookable_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blackout_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slot_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signed_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_passes ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES (for guest browsing)
CREATE POLICY "Businesses are publicly readable" ON public.businesses FOR SELECT USING (is_active = true);
CREATE POLICY "Bookable types are publicly readable" ON public.bookable_types FOR SELECT USING (is_active = true);
CREATE POLICY "Resources are publicly readable" ON public.resources FOR SELECT USING (is_active = true);
CREATE POLICY "Resource bookable types are publicly readable" ON public.resource_bookable_types FOR SELECT USING (true);
CREATE POLICY "Providers are publicly readable" ON public.providers FOR SELECT USING (is_active = true);
CREATE POLICY "Provider schedules are publicly readable" ON public.provider_schedules FOR SELECT USING (is_active = true);
CREATE POLICY "Availability windows are publicly readable" ON public.availability_windows FOR SELECT USING (is_active = true);
CREATE POLICY "Packages are publicly readable" ON public.packages FOR SELECT USING (is_active = true);
CREATE POLICY "Addons are publicly readable" ON public.addons FOR SELECT USING (is_active = true);
CREATE POLICY "Membership tiers are publicly readable" ON public.membership_tiers FOR SELECT USING (is_active = true);
CREATE POLICY "Membership benefits are publicly readable" ON public.membership_benefits FOR SELECT USING (is_active = true);
CREATE POLICY "Public reviews are readable" ON public.reviews FOR SELECT USING (is_public = true);
CREATE POLICY "Active promo codes are readable" ON public.promo_codes FOR SELECT USING (is_active = true);

-- PROFILE POLICIES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Staff can view profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- USER ROLES POLICIES
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'owner'));

-- BOOKING POLICIES
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid() OR customer_id IS NULL);
CREATE POLICY "Staff can view department bookings" ON public.bookings FOR SELECT TO authenticated 
  USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage department bookings" ON public.bookings FOR ALL TO authenticated 
  USING (public.is_admin(auth.uid()));
CREATE POLICY "Anon can create guest bookings" ON public.bookings FOR INSERT TO anon WITH CHECK (customer_id IS NULL);

-- BOOKING RESOURCES POLICIES
CREATE POLICY "Users can view own booking resources" ON public.booking_resources FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND customer_id = auth.uid()));
CREATE POLICY "Staff can view all booking resources" ON public.booking_resources FOR SELECT TO authenticated 
  USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage booking resources" ON public.booking_resources FOR ALL TO authenticated 
  USING (public.is_admin(auth.uid()));

-- BOOKING ADDONS POLICIES
CREATE POLICY "Users can view own booking addons" ON public.booking_addons FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND customer_id = auth.uid()));
CREATE POLICY "Staff can view all booking addons" ON public.booking_addons FOR SELECT TO authenticated 
  USING (public.is_staff(auth.uid()));

-- SLOT HOLDS POLICIES
CREATE POLICY "Users can manage own slot holds" ON public.slot_holds FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Anon can create slot holds" ON public.slot_holds FOR INSERT TO anon WITH CHECK (user_id IS NULL);
CREATE POLICY "Staff can view all slot holds" ON public.slot_holds FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- PAYMENT POLICIES
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Staff can view all payments" ON public.payments FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- PAYMENT SCHEDULE POLICIES
CREATE POLICY "Users can view own payment schedules" ON public.payment_schedules FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND customer_id = auth.uid()));
CREATE POLICY "Staff can view all payment schedules" ON public.payment_schedules FOR SELECT TO authenticated 
  USING (public.is_staff(auth.uid()));

-- MEMBERSHIP POLICIES
CREATE POLICY "Users can view own memberships" ON public.memberships FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own memberships" ON public.memberships FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Staff can view all memberships" ON public.memberships FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins can manage memberships" ON public.memberships FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- DOCUMENT TEMPLATE POLICIES
CREATE POLICY "Document templates are publicly readable" ON public.document_templates FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage document templates" ON public.document_templates FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- SIGNED DOCUMENT POLICIES
CREATE POLICY "Users can view own signed documents" ON public.signed_documents FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can sign documents" ON public.signed_documents FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Staff can view signed documents" ON public.signed_documents FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- NOTIFICATION POLICIES
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Staff can manage notifications" ON public.notifications FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

-- GIFT CARD POLICIES
CREATE POLICY "Users can view purchased gift cards" ON public.gift_cards FOR SELECT TO authenticated USING (purchased_by = auth.uid() OR redeemed_by = auth.uid());
CREATE POLICY "Staff can view all gift cards" ON public.gift_cards FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins can manage gift cards" ON public.gift_cards FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- WALLET POLICIES
CREATE POLICY "Users can view own wallet" ON public.customer_wallets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Staff can view wallets" ON public.customer_wallets FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- WALLET TRANSACTION POLICIES
CREATE POLICY "Users can view own wallet transactions" ON public.wallet_transactions FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.customer_wallets WHERE id = wallet_id AND user_id = auth.uid()));
CREATE POLICY "Staff can view wallet transactions" ON public.wallet_transactions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- LEAD POLICIES
CREATE POLICY "Staff can view department leads" ON public.leads FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage department leads" ON public.leads FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Anon can create leads" ON public.leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Auth can create leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);

-- WAITLIST POLICIES
CREATE POLICY "Users can view own waitlist entries" ON public.waitlist_entries FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create waitlist entries" ON public.waitlist_entries FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Staff can manage waitlist" ON public.waitlist_entries FOR ALL TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Anon can join waitlist" ON public.waitlist_entries FOR INSERT TO anon WITH CHECK (user_id IS NULL);

-- REVIEW POLICIES
CREATE POLICY "Users can create reviews for own bookings" ON public.reviews FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND customer_id = auth.uid()));
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Staff can manage reviews" ON public.reviews FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- REFERRAL POLICIES
CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT TO authenticated USING (referrer_id = auth.uid() OR referred_id = auth.uid());
CREATE POLICY "Users can create referrals" ON public.referrals FOR INSERT TO authenticated WITH CHECK (referrer_id = auth.uid());
CREATE POLICY "Staff can view all referrals" ON public.referrals FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- GUEST PASS POLICIES
CREATE POLICY "Users can view own guest passes" ON public.guest_passes FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.memberships WHERE id = membership_id AND user_id = auth.uid()));
CREATE POLICY "Users can create guest passes" ON public.guest_passes FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.memberships WHERE id = membership_id AND user_id = auth.uid()));
CREATE POLICY "Staff can manage guest passes" ON public.guest_passes FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

-- CHECKLIST POLICIES
CREATE POLICY "Staff can view checklists" ON public.checklists FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage checklists" ON public.checklists FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

-- CHECKLIST TEMPLATE POLICIES
CREATE POLICY "Checklist templates are staff readable" ON public.checklist_templates FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins can manage checklist templates" ON public.checklist_templates FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- BLACKOUT DATE POLICIES
CREATE POLICY "Blackout dates are publicly readable" ON public.blackout_dates FOR SELECT USING (true);
CREATE POLICY "Staff can manage blackout dates" ON public.blackout_dates FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

-- PRICING RULES POLICIES
CREATE POLICY "Pricing rules are staff readable" ON public.pricing_rules FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins can manage pricing rules" ON public.pricing_rules FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- AUDIT LOG POLICIES
CREATE POLICY "Admins can view audit log" ON public.audit_log FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "System can insert audit log" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- ASSUMPTIONS POLICIES
CREATE POLICY "Staff can view assumptions" ON public.assumptions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins can manage assumptions" ON public.assumptions FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- =============================================
-- SEED INITIAL DATA
-- =============================================

-- Insert the four businesses
INSERT INTO public.businesses (type, name, slug, tagline, description) VALUES
  ('summit', 'The Summit', 'the-summit', 'Elevate Every Event', 'Where Life''s Most Important Moments Reach Their Highest Point'),
  ('coworking', 'The Hive Coworking', 'the-hive-coworking', 'Work Together, Grow Together', 'Modern coworking and private office spaces in Wapakoneta'),
  ('spa', 'The Hive Restoration Lounge', 'restoration-lounge', 'Restore. Renew. Revive.', 'Luxury spa and recovery services for total wellness'),
  ('fitness', 'Total Fitness by A-Z', 'total-fitness', 'Your Fitness, Your Way', '24/7 gym memberships with premium amenities');