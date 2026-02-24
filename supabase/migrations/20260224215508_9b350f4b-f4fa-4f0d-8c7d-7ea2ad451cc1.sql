
-- ============================================================
-- E³ EVENT OPERATING SYSTEM - Core Schema
-- Built alongside existing Summit; no existing tables modified
-- ============================================================

-- 1. Venues
CREATE TABLE public.e3_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  total_sqft INTEGER,
  base_cost_per_hour NUMERIC(10,2) NOT NULL DEFAULT 55.00,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Halls
CREATE TABLE public.e3_halls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.e3_venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  allocation_percentage NUMERIC(5,2) NOT NULL DEFAULT 33.33,
  reset_buffer NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Time Blocks
CREATE TABLE public.e3_time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.e3_venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_editable BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Coordinators
CREATE TABLE public.e3_coordinators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  access_code_hash TEXT NOT NULL,
  referred_by UUID REFERENCES public.e3_coordinators(id) ON DELETE SET NULL,
  current_tier_percent NUMERIC(5,2) NOT NULL DEFAULT 25,
  is_active BOOLEAN NOT NULL DEFAULT true,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Booking state enum
CREATE TYPE public.e3_booking_state AS ENUM (
  'red_hold',
  'yellow_contract',
  'green_booked',
  'completed',
  'cancelled',
  'expired'
);

CREATE TYPE public.e3_payment_status AS ENUM (
  'unpaid',
  'deposit_received',
  'paid_in_full',
  'refunded',
  'defaulted'
);

CREATE TYPE public.e3_commission_status AS ENUM (
  'pending',
  'approved',
  'paid'
);

-- 6. Bookings
CREATE TABLE public.e3_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.e3_venues(id),
  coordinator_id UUID NOT NULL REFERENCES public.e3_coordinators(id),
  time_block_id UUID NOT NULL REFERENCES public.e3_time_blocks(id),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  event_type TEXT,
  guest_count INTEGER,
  event_date DATE NOT NULL,
  booking_state public.e3_booking_state NOT NULL DEFAULT 'red_hold',
  gross_revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  building_overhead NUMERIC(12,2) NOT NULL DEFAULT 0,
  reset_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_contribution NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_percentage NUMERIC(5,2) NOT NULL DEFAULT 25,
  commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_status public.e3_payment_status NOT NULL DEFAULT 'unpaid',
  contract_version_id UUID,
  recurring_parent_id UUID REFERENCES public.e3_bookings(id) ON DELETE SET NULL,
  is_full_facility BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  admin_approved BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Booking-Hall junction (many-to-many)
CREATE TABLE public.e3_booking_halls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.e3_bookings(id) ON DELETE CASCADE,
  hall_id UUID NOT NULL REFERENCES public.e3_halls(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(booking_id, hall_id)
);

-- 8. Documents / Templates
CREATE TABLE public.e3_document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  file_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.e3_booking_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.e3_bookings(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.e3_document_templates(id),
  file_url TEXT NOT NULL,
  file_hash TEXT,
  document_type TEXT NOT NULL CHECK (document_type IN ('contract','policy','other')),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_by UUID
);

-- 9. Commissions
CREATE TABLE public.e3_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.e3_bookings(id),
  coordinator_id UUID NOT NULL REFERENCES public.e3_coordinators(id),
  net_contribution NUMERIC(12,2) NOT NULL,
  commission_percent NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  status public.e3_commission_status NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Referral Overrides
CREATE TABLE public.e3_referral_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id UUID NOT NULL REFERENCES public.e3_commissions(id) ON DELETE CASCADE,
  beneficiary_id UUID NOT NULL REFERENCES public.e3_coordinators(id),
  override_depth INTEGER NOT NULL CHECK (override_depth IN (1, 2)),
  override_percent NUMERIC(5,2) NOT NULL,
  override_amount NUMERIC(12,2) NOT NULL,
  status public.e3_commission_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Blackout dates per venue
CREATE TABLE public.e3_blackout_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.e3_venues(id) ON DELETE CASCADE,
  blackout_date DATE NOT NULL,
  reason TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(venue_id, blackout_date)
);

-- 12. Audit Log (E3-specific)
CREATE TABLE public.e3_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before_state JSONB,
  after_state JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Config table for financial defaults
CREATE TABLE public.e3_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_e3_halls_venue ON public.e3_halls(venue_id);
CREATE INDEX idx_e3_time_blocks_venue ON public.e3_time_blocks(venue_id);
CREATE INDEX idx_e3_bookings_venue_date ON public.e3_bookings(venue_id, event_date);
CREATE INDEX idx_e3_bookings_coordinator ON public.e3_bookings(coordinator_id);
CREATE INDEX idx_e3_bookings_state ON public.e3_bookings(booking_state);
CREATE INDEX idx_e3_bookings_expires ON public.e3_bookings(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_e3_booking_halls_booking ON public.e3_booking_halls(booking_id);
CREATE INDEX idx_e3_booking_halls_hall ON public.e3_booking_halls(hall_id);
CREATE INDEX idx_e3_commissions_coordinator ON public.e3_commissions(coordinator_id);
CREATE INDEX idx_e3_commissions_status ON public.e3_commissions(status);
CREATE INDEX idx_e3_audit_entity ON public.e3_audit_log(entity_type, entity_id);

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
CREATE TRIGGER update_e3_venues_updated_at BEFORE UPDATE ON public.e3_venues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_e3_halls_updated_at BEFORE UPDATE ON public.e3_halls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_e3_coordinators_updated_at BEFORE UPDATE ON public.e3_coordinators
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_e3_bookings_updated_at BEFORE UPDATE ON public.e3_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_e3_commissions_updated_at BEFORE UPDATE ON public.e3_commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Venues: public read, admin write
ALTER TABLE public.e3_venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active venues" ON public.e3_venues FOR SELECT USING (true);
CREATE POLICY "Admins can manage venues" ON public.e3_venues FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Halls: public read, admin write
ALTER TABLE public.e3_halls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view halls" ON public.e3_halls FOR SELECT USING (true);
CREATE POLICY "Admins can manage halls" ON public.e3_halls FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Time Blocks: public read, admin write
ALTER TABLE public.e3_time_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view time blocks" ON public.e3_time_blocks FOR SELECT USING (true);
CREATE POLICY "Admins can manage time blocks" ON public.e3_time_blocks FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Coordinators: self + admin
ALTER TABLE public.e3_coordinators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coordinators can view own record" ON public.e3_coordinators FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage coordinators" ON public.e3_coordinators FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- Bookings: coordinator sees own, admin sees all
ALTER TABLE public.e3_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coordinators view own bookings" ON public.e3_bookings FOR SELECT TO authenticated
  USING (
    coordinator_id IN (SELECT id FROM public.e3_coordinators WHERE user_id = auth.uid())
    OR public.is_admin(auth.uid())
  );
CREATE POLICY "Coordinators can insert bookings" ON public.e3_bookings FOR INSERT TO authenticated
  WITH CHECK (
    coordinator_id IN (SELECT id FROM public.e3_coordinators WHERE user_id = auth.uid())
    OR public.is_admin(auth.uid())
  );
CREATE POLICY "Coordinators can update own bookings" ON public.e3_bookings FOR UPDATE TO authenticated
  USING (
    coordinator_id IN (SELECT id FROM public.e3_coordinators WHERE user_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

-- Booking Halls: follows booking access
ALTER TABLE public.e3_booking_halls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access via booking" ON public.e3_booking_halls FOR SELECT TO authenticated USING (
  booking_id IN (
    SELECT id FROM public.e3_bookings WHERE coordinator_id IN (SELECT id FROM public.e3_coordinators WHERE user_id = auth.uid())
  ) OR public.is_admin(auth.uid())
);
CREATE POLICY "Insert via booking" ON public.e3_booking_halls FOR INSERT TO authenticated WITH CHECK (
  booking_id IN (
    SELECT id FROM public.e3_bookings WHERE coordinator_id IN (SELECT id FROM public.e3_coordinators WHERE user_id = auth.uid())
  ) OR public.is_admin(auth.uid())
);

-- Documents templates: public read, admin write
ALTER TABLE public.e3_document_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view templates" ON public.e3_document_templates FOR SELECT USING (true);
CREATE POLICY "Admins manage templates" ON public.e3_document_templates FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Booking documents: follows booking access
ALTER TABLE public.e3_booking_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access booking docs" ON public.e3_booking_documents FOR SELECT TO authenticated USING (
  booking_id IN (
    SELECT id FROM public.e3_bookings WHERE coordinator_id IN (SELECT id FROM public.e3_coordinators WHERE user_id = auth.uid())
  ) OR public.is_admin(auth.uid())
);
CREATE POLICY "Upload booking docs" ON public.e3_booking_documents FOR INSERT TO authenticated WITH CHECK (
  booking_id IN (
    SELECT id FROM public.e3_bookings WHERE coordinator_id IN (SELECT id FROM public.e3_coordinators WHERE user_id = auth.uid())
  ) OR public.is_admin(auth.uid())
);

-- Commissions: coordinator sees own, admin sees all
ALTER TABLE public.e3_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coordinators view own commissions" ON public.e3_commissions FOR SELECT TO authenticated USING (
  coordinator_id IN (SELECT id FROM public.e3_coordinators WHERE user_id = auth.uid())
  OR public.is_admin(auth.uid())
);
CREATE POLICY "Admins manage commissions" ON public.e3_commissions FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Referral overrides: beneficiary sees own, admin sees all
ALTER TABLE public.e3_referral_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own overrides" ON public.e3_referral_overrides FOR SELECT TO authenticated USING (
  beneficiary_id IN (SELECT id FROM public.e3_coordinators WHERE user_id = auth.uid())
  OR public.is_admin(auth.uid())
);
CREATE POLICY "Admins manage overrides" ON public.e3_referral_overrides FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Blackout dates: public read, admin write
ALTER TABLE public.e3_blackout_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view blackouts" ON public.e3_blackout_dates FOR SELECT USING (true);
CREATE POLICY "Admins manage blackouts" ON public.e3_blackout_dates FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Audit log: admin only
ALTER TABLE public.e3_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view audit log" ON public.e3_audit_log FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "System can insert audit" ON public.e3_audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- Config: public read, admin write
ALTER TABLE public.e3_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read config" ON public.e3_config FOR SELECT USING (true);
CREATE POLICY "Admins manage config" ON public.e3_config FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
