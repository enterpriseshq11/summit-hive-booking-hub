-- Create promotion category enum
CREATE TYPE public.promotion_category AS ENUM ('signature', 'monthly', 'vault');

-- Create promotion status enum
CREATE TYPE public.promotion_status AS ENUM ('active', 'paused', 'expired');

-- Create promotion CTA action enum
CREATE TYPE public.promotion_cta_action AS ENUM ('open_modal', 'scroll_to_form', 'route_to_page');

-- Create promotion lead status enum
CREATE TYPE public.promotion_lead_status AS ENUM ('new', 'contacted', 'closed', 'archived');

-- Create promotions table
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category public.promotion_category NOT NULL DEFAULT 'signature',
  status public.promotion_status NOT NULL DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  short_description TEXT NOT NULL,
  long_description TEXT,
  eligibility_rules JSONB DEFAULT '{}',
  benefits JSONB DEFAULT '[]',
  limits_fine_print TEXT,
  primary_cta_label TEXT NOT NULL DEFAULT 'Learn More',
  primary_cta_action public.promotion_cta_action NOT NULL DEFAULT 'open_modal',
  primary_cta_target TEXT,
  tags TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  badge TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create promotion_leads table
CREATE TABLE public.promotion_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  offer_id UUID REFERENCES public.promotions(id),
  offer_title_snapshot TEXT,
  business_interest TEXT[],
  notes TEXT,
  preferred_contact_method TEXT DEFAULT 'email',
  source_page TEXT DEFAULT '/promotions',
  status public.promotion_lead_status NOT NULL DEFAULT 'new',
  lead_type TEXT DEFAULT 'standard',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on promotions
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Public read access for active promotions
CREATE POLICY "Anyone can view active promotions"
ON public.promotions
FOR SELECT
USING (status = 'active' OR status = 'expired');

-- Admin full access to promotions
CREATE POLICY "Admins can manage promotions"
ON public.promotions
FOR ALL
USING (public.is_admin(auth.uid()));

-- Enable RLS on promotion_leads
ALTER TABLE public.promotion_leads ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a lead
CREATE POLICY "Anyone can submit promotion leads"
ON public.promotion_leads
FOR INSERT
WITH CHECK (true);

-- Admin full access to leads
CREATE POLICY "Admins can manage promotion leads"
ON public.promotion_leads
FOR ALL
USING (public.is_admin(auth.uid()));

-- Create updated_at trigger for promotions
CREATE TRIGGER update_promotions_updated_at
BEFORE UPDATE ON public.promotions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create updated_at trigger for promotion_leads
CREATE TRIGGER update_promotion_leads_updated_at
BEFORE UPDATE ON public.promotion_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Insert seed data for initial promotions
INSERT INTO public.promotions (title, slug, category, status, short_description, long_description, eligibility_rules, benefits, limits_fine_print, primary_cta_label, badge, tags, sort_order) VALUES
-- Signature Bundles
('Wellness Triad', 'wellness-triad', 'signature', 'active', 
 'Combine fitness, spa, and coworking for the ultimate balanced lifestyle.',
 'The Wellness Triad brings together three pillars of productivity and recovery. Perfect for founders and professionals who want it all.',
 '{"requires_membership": true, "min_tier": "any"}',
 '["Priority booking across all three businesses", "Exclusive member-only recovery sessions", "Dedicated concierge support", "Cross-business rewards tracking"]',
 'Must maintain active membership in at least one business. Benefits activate within 48 hours of qualification.',
 'Start This Bundle', 'Best for Office Members', ARRAY['office', 'fitness', 'spa'], 1),

('Founder Flow', 'founder-flow', 'signature', 'active',
 'Private office access plus unlimited fitness—designed for high-performers.',
 'Built for founders who know that physical performance drives business performance. Combine dedicated workspace with unlimited training.',
 '{"requires_membership": true, "businesses": ["coworking", "fitness"]}',
 '["Reserved private office hours", "Unlimited fitness access", "Priority event invitations", "Quarterly strategy sessions"]',
 'Requires active coworking membership. Fitness benefits apply to primary member only.',
 'Start This Bundle', 'Team Favorite', ARRAY['office', 'fitness', 'founders'], 2),

('Recovery Ritual', 'recovery-ritual', 'signature', 'active',
 'Spa and fitness combined for peak recovery and performance.',
 'Science-backed recovery meets luxury spa treatments. Ideal for athletes, executives, and anyone serious about longevity.',
 '{"requires_membership": true, "businesses": ["fitness", "spa"]}',
 '["Monthly signature spa treatment", "Post-workout recovery protocols", "Nutrition guidance sessions", "Priority spa booking"]',
 'Spa treatments scheduled based on availability. Some exclusions apply to premium services.',
 'Start This Bundle', 'Most Popular', ARRAY['fitness', 'spa', 'recovery'], 3),

-- Monthly Promotions
('New Member Momentum', 'new-member-momentum', 'monthly', 'active',
 'First-month members unlock accelerated rewards and priority access.',
 'Start strong with exclusive first-month perks designed to help you build momentum fast.',
 '{"new_members_only": true, "first_30_days": true}',
 '["Accelerated rewards tracking", "Priority orientation scheduling", "Welcome gift package", "Direct concierge line"]',
 'Available to members in their first 30 days only. Cannot be combined with other monthly offers.',
 'Claim Now', 'Best for New Members', ARRAY['new', 'all'], 1),

('Referral Bonus Sprint', 'referral-sprint', 'monthly', 'active',
 'Refer members this month and unlock bonus perks for both of you.',
 'This month only: enhanced referral rewards. Your friends get a better start, and you get more perks.',
 '{"requires_membership": true}',
 '["Enhanced referral credits", "Bonus for referred member", "Leaderboard recognition", "Exclusive referrer events"]',
 'Referrals must complete signup within promotional period. Standard referral terms apply.',
 'Learn More', 'Limited Time', ARRAY['referral', 'all'], 2),

-- Package Vault
('Couples Retreat', 'couples-retreat', 'vault', 'active',
 'Spa day for two with coordinated treatments and private recovery time.',
 'The ultimate couples experience. Synchronized treatments, private relaxation, and a memorable shared experience.',
 '{"booking_required": true, "advance_notice": "7_days"}',
 '["Dual treatment rooms", "Champagne welcome", "Private relaxation suite", "Couples wellness consultation"]',
 'Subject to availability. Minimum 7-day advance booking required. Holiday blackouts may apply.',
 'Request This Package', null, ARRAY['spa', 'couples'], 1),

('Team Offsite', 'team-offsite', 'vault', 'active',
 'Meeting space, catering, and wellness activities for teams up to 20.',
 'Productive meetings meet team bonding. Full-service offsite packages with everything handled.',
 '{"booking_required": true, "min_guests": 5, "max_guests": 20}',
 '["Private meeting space", "Catered meals", "Team fitness or spa session", "A/V and tech support"]',
 'Requires minimum 5 participants. Final pricing confirmed after consultation. 14-day advance booking recommended.',
 'Request Quote', null, ARRAY['office', 'events', 'team'], 2),

('Corporate VIP', 'corporate-vip', 'vault', 'active',
 'Enterprise membership packages with dedicated account management.',
 'For companies serious about employee wellness and productivity. Custom packages, dedicated support, and premium access.',
 '{"corporate_only": true, "min_seats": 10}',
 '["Dedicated account manager", "Custom benefit packages", "Priority booking enterprise-wide", "Quarterly reviews and reporting"]',
 'Minimum 10 seats required. Custom pricing based on package selection. NDA available upon request.',
 'Request Corporate Info', 'Best for Teams', ARRAY['office', 'corporate', 'enterprise'], 3),

('Wedding Wellness', 'wedding-wellness', 'vault', 'active',
 'Pre-wedding prep and day-of services for wedding parties.',
 'Look and feel your best on the big day. Coordinated wellness packages for the entire wedding party.',
 '{"booking_required": true, "advance_notice": "30_days"}',
 '["Bridal party spa day", "Groom fitness prep program", "Day-of touch-up services", "Honeymoon wellness plan"]',
 'Minimum 30-day advance booking. Services subject to availability. Deposit required to hold dates.',
 'Start Planning', null, ARRAY['spa', 'fitness', 'wedding'], 4);