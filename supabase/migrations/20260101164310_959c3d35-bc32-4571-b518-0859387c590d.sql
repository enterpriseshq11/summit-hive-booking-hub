-- Create enum types for dopamine drop system
CREATE TYPE public.prize_access_level AS ENUM ('public', 'vip');
CREATE TYPE public.claim_status AS ENUM ('pending', 'verified', 'redeemed', 'expired', 'disqualified');
CREATE TYPE public.giveaway_pool AS ENUM ('standard', 'vip');
CREATE TYPE public.ticket_source AS ENUM ('spin', 'prize', 'bonus');

-- Prizes table
CREATE TABLE public.prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  access_level public.prize_access_level NOT NULL DEFAULT 'public',
  free_weight INTEGER NOT NULL DEFAULT 10,
  vip_weight INTEGER NOT NULL DEFAULT 10,
  daily_cap INTEGER,
  weekly_cap INTEGER,
  expiry_days INTEGER DEFAULT 30,
  booking_url TEXT,
  requires_manual_approval BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Wheel segments (exactly 8)
CREATE TABLE public.wheel_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_index INTEGER NOT NULL CHECK (segment_index >= 1 AND segment_index <= 8),
  prize_id UUID REFERENCES public.prizes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(segment_index)
);

-- Spins table
CREATE TABLE public.spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  segment_index INTEGER NOT NULL,
  prize_id UUID REFERENCES public.prizes(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  result_token TEXT,
  is_vip_locked_hit BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Claims table
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spin_id UUID REFERENCES public.spins(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  claim_code TEXT UNIQUE NOT NULL,
  status public.claim_status DEFAULT 'pending',
  redemption_deadline TIMESTAMPTZ,
  interested_in TEXT,
  consent_timestamp TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Giveaway tickets table
CREATE TABLE public.giveaway_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pool public.giveaway_pool NOT NULL DEFAULT 'standard',
  multiplier INTEGER DEFAULT 1,
  source public.ticket_source NOT NULL DEFAULT 'spin',
  spin_id UUID REFERENCES public.spins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- VIP subscriptions table (separate from profiles for security)
CREATE TABLE public.vip_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  is_comp BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Daily spin counts (for tracking limits)
CREATE TABLE public.daily_spin_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  spin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  spin_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, spin_date)
);

-- Prize daily caps tracking
CREATE TABLE public.prize_cap_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prize_id UUID REFERENCES public.prizes(id) ON DELETE CASCADE NOT NULL,
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  daily_count INTEGER DEFAULT 0,
  weekly_count INTEGER DEFAULT 0,
  week_start DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(prize_id, tracking_date)
);

-- Enable RLS on all tables
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wheel_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaway_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_spin_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_cap_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Prizes: public read, admin write
CREATE POLICY "Anyone can view active prizes"
  ON public.prizes FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage prizes"
  ON public.prizes FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Wheel segments: public read, admin write
CREATE POLICY "Anyone can view wheel segments"
  ON public.wheel_segments FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage wheel segments"
  ON public.wheel_segments FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Spins: users see own, admins see all
CREATE POLICY "Users can view own spins"
  ON public.spins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "System inserts spins"
  ON public.spins FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Claims: users see own, admins see all
CREATE POLICY "Users can view own claims"
  ON public.claims FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can create own claims"
  ON public.claims FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update claims"
  ON public.claims FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Giveaway tickets: users see own count, admins see all
CREATE POLICY "Users can view own tickets"
  ON public.giveaway_tickets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "System inserts tickets"
  ON public.giveaway_tickets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- VIP subscriptions: users see own, admins see all
CREATE POLICY "Users can view own VIP status"
  ON public.vip_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage VIP subscriptions"
  ON public.vip_subscriptions FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Daily spin counts: users see own
CREATE POLICY "Users can view own spin counts"
  ON public.daily_spin_counts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System manages spin counts"
  ON public.daily_spin_counts FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Prize cap tracking: admins only
CREATE POLICY "Admins can view prize caps"
  ON public.prize_cap_tracking FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_spins_user_id ON public.spins(user_id);
CREATE INDEX idx_spins_created_at ON public.spins(created_at);
CREATE INDEX idx_claims_user_id ON public.claims(user_id);
CREATE INDEX idx_claims_status ON public.claims(status);
CREATE INDEX idx_giveaway_tickets_user_id ON public.giveaway_tickets(user_id);
CREATE INDEX idx_giveaway_tickets_pool ON public.giveaway_tickets(pool);
CREATE INDEX idx_daily_spin_counts_user_date ON public.daily_spin_counts(user_id, spin_date);
CREATE INDEX idx_prize_cap_tracking_prize_date ON public.prize_cap_tracking(prize_id, tracking_date);

-- Triggers for updated_at
CREATE TRIGGER update_prizes_updated_at
  BEFORE UPDATE ON public.prizes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_wheel_segments_updated_at
  BEFORE UPDATE ON public.wheel_segments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON public.claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_vip_subscriptions_updated_at
  BEFORE UPDATE ON public.vip_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Seed default prizes
INSERT INTO public.prizes (name, description, instructions, access_level, free_weight, vip_weight, daily_cap, expiry_days, booking_url, requires_manual_approval) VALUES
('Free Personal Training Session', 'One complimentary personal training session with our certified trainers.', 'Book your session at the front desk or online. Show your claim code.', 'public', 22, 16, 10, 30, '/fitness', false),
('Free Massage', 'One complimentary massage treatment at our spa.', 'Book your massage appointment. Present claim code at check-in.', 'public', 12, 10, 4, 30, '/spa', false),
('Free Coworking Day Pass', 'One full day of coworking access at any desk.', 'Check in at reception with your claim code. Valid any business day.', 'public', 18, 14, 10, 30, '/coworking', false),
('$25 Credit', 'Use at Gym, Events, or Café — your choice!', 'Present claim code at any location. Credit applied at checkout.', 'public', 20, 16, 15, 60, NULL, false),
('Grand Giveaway Entry', 'One entry into the March 31, 2026 Grand Giveaway drawing.', 'No action needed — your entry is automatically registered.', 'public', 28, 24, NULL, NULL, NULL, false),
('VIP Prize: Free 60-Min Massage', 'Premium full-hour massage treatment — VIP exclusive.', 'Book your premium massage. VIP claim code required.', 'vip', 0, 12, 4, 30, '/spa', false),
('VIP Prize: 3-Pack PT Sessions', 'Three personal training sessions — VIP exclusive value pack.', 'Schedule all 3 sessions at the fitness desk. Show VIP claim code.', 'vip', 0, 6, 2, 60, '/fitness', true),
('VIP Prize: Mega Giveaway Entry', '10x entries into Grand Giveaway + Surprise Box!', 'Your 10 entries are auto-registered. Surprise box ships within 7 days.', 'vip', 0, 2, 1, NULL, NULL, true);

-- Seed wheel segments (exactly 8)
INSERT INTO public.wheel_segments (segment_index, prize_id) 
SELECT 1, id FROM public.prizes WHERE name = 'Free Personal Training Session';
INSERT INTO public.wheel_segments (segment_index, prize_id) 
SELECT 2, id FROM public.prizes WHERE name = 'Free Massage';
INSERT INTO public.wheel_segments (segment_index, prize_id) 
SELECT 3, id FROM public.prizes WHERE name = 'Free Coworking Day Pass';
INSERT INTO public.wheel_segments (segment_index, prize_id) 
SELECT 4, id FROM public.prizes WHERE name = '$25 Credit';
INSERT INTO public.wheel_segments (segment_index, prize_id) 
SELECT 5, id FROM public.prizes WHERE name = 'Grand Giveaway Entry';
INSERT INTO public.wheel_segments (segment_index, prize_id) 
SELECT 6, id FROM public.prizes WHERE name = 'VIP Prize: Free 60-Min Massage';
INSERT INTO public.wheel_segments (segment_index, prize_id) 
SELECT 7, id FROM public.prizes WHERE name = 'VIP Prize: 3-Pack PT Sessions';
INSERT INTO public.wheel_segments (segment_index, prize_id) 
SELECT 8, id FROM public.prizes WHERE name = 'VIP Prize: Mega Giveaway Entry';