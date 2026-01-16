-- =============================================
-- PHASE 1: OFFICE LISTINGS DATABASE SYSTEM
-- For The Hive Coworking Management
-- =============================================

-- Office availability status enum
CREATE TYPE public.office_status AS ENUM (
  'available',
  'renovating', 
  'waitlist',
  'reserved',
  'leased'
);

-- Pricing visibility mode enum
CREATE TYPE public.pricing_visibility AS ENUM (
  'hidden',
  'qualitative',
  'exact'
);

-- Office type enum
CREATE TYPE public.office_type AS ENUM (
  'private_office',
  'dedicated_desk',
  'day_pass',
  'executive_suite'
);

-- =============================================
-- OFFICE LISTINGS TABLE
-- Core table for all office inventory
-- =============================================
CREATE TABLE public.office_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  tagline TEXT,
  
  -- Classification
  office_type office_type NOT NULL DEFAULT 'private_office',
  floor INTEGER NOT NULL DEFAULT 1,
  floor_label TEXT, -- e.g., "First Floor", "Second Floor"
  
  -- Physical Specs
  square_footage INTEGER,
  capacity INTEGER DEFAULT 1,
  ideal_use TEXT, -- e.g., "Teams of 2-4", "Solo professionals"
  
  -- Amenities (stored as JSON array of strings)
  amenities JSONB DEFAULT '[]'::jsonb,
  
  -- Status & Availability  
  status office_status NOT NULL DEFAULT 'available',
  status_note TEXT, -- e.g., "Available March 2026"
  
  -- Pricing Controls
  monthly_rate NUMERIC,
  deposit_amount NUMERIC,
  pricing_visibility pricing_visibility NOT NULL DEFAULT 'hidden',
  price_range_text TEXT, -- e.g., "Starting at $XXX/month" for qualitative
  
  -- Display Controls
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.office_listings ENABLE ROW LEVEL SECURITY;

-- Public can read active listings
CREATE POLICY "Public can view active office listings"
  ON public.office_listings
  FOR SELECT
  USING (is_active = true);

-- Staff can manage all listings
CREATE POLICY "Staff can manage office listings"
  ON public.office_listings
  FOR ALL
  TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

-- =============================================
-- OFFICE PHOTOS TABLE
-- Multi-photo support with ordering
-- =============================================
CREATE TABLE public.office_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  office_id UUID NOT NULL REFERENCES public.office_listings(id) ON DELETE CASCADE,
  
  -- Photo details
  url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  
  -- Ordering
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.office_photos ENABLE ROW LEVEL SECURITY;

-- Public can view photos of active offices
CREATE POLICY "Public can view office photos"
  ON public.office_photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.office_listings
      WHERE office_listings.id = office_photos.office_id
        AND office_listings.is_active = true
    )
  );

-- Staff can manage photos
CREATE POLICY "Staff can manage office photos"
  ON public.office_photos
  FOR ALL
  TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

-- =============================================
-- OFFICE PROMOTIONS TABLE
-- Time-bound promotions per listing
-- =============================================
CREATE TABLE public.office_promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  office_id UUID REFERENCES public.office_listings(id) ON DELETE CASCADE,
  
  -- If office_id is null, promotion applies to all/general
  is_global BOOLEAN DEFAULT false,
  
  -- Promotion content
  headline TEXT NOT NULL,
  description TEXT,
  badge_text TEXT, -- e.g., "Limited Time", "Spring Special"
  
  -- Date controls
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.office_promotions ENABLE ROW LEVEL SECURITY;

-- Public can view active promotions
CREATE POLICY "Public can view active promotions"
  ON public.office_promotions
  FOR SELECT
  USING (
    is_active = true 
    AND start_date <= CURRENT_DATE 
    AND (end_date IS NULL OR end_date >= CURRENT_DATE)
  );

-- Staff can manage promotions
CREATE POLICY "Staff can manage office promotions"
  ON public.office_promotions
  FOR ALL
  TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

-- =============================================
-- OFFICE INQUIRIES TABLE  
-- Leads/requests for specific offices
-- =============================================
CREATE TABLE public.office_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Link to office (optional - may be general inquiry)
  office_id UUID REFERENCES public.office_listings(id) ON DELETE SET NULL,
  
  -- Inquiry type
  inquiry_type TEXT NOT NULL DEFAULT 'request', -- 'request', 'tour', 'waitlist', 'question'
  
  -- Contact info
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  
  -- Inquiry details
  workspace_type TEXT, -- 'Private Office', 'Dedicated Desk', 'Day Pass'
  move_in_timeframe TEXT, -- 'Immediately', 'Within 30 days', '1-3 months', 'Flexible'
  seats_needed INTEGER,
  message TEXT,
  needs_meeting_rooms BOOLEAN DEFAULT false,
  needs_business_address BOOLEAN DEFAULT false,
  
  -- For tour requests
  preferred_tour_dates JSONB, -- Array of preferred dates/times
  tour_type TEXT, -- 'in-person', 'virtual'
  
  -- Status tracking
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'scheduled', 'completed', 'closed'
  assigned_to UUID,
  internal_notes TEXT,
  
  -- Source tracking
  source TEXT DEFAULT 'website',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.office_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can create inquiries (guest checkout)
CREATE POLICY "Anyone can create office inquiries"
  ON public.office_inquiries
  FOR INSERT
  WITH CHECK (true);

-- Staff can manage all inquiries
CREATE POLICY "Staff can manage office inquiries"
  ON public.office_inquiries
  FOR ALL
  TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

-- =============================================
-- COWORKING PAGE CONTENT TABLE
-- Editable sections for the coworking landing page
-- =============================================
CREATE TABLE public.coworking_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Section identifier
  section_key TEXT NOT NULL UNIQUE,
  
  -- Content
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Timestamps
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

-- Enable RLS
ALTER TABLE public.coworking_content ENABLE ROW LEVEL SECURITY;

-- Public can read content
CREATE POLICY "Public can view coworking content"
  ON public.coworking_content
  FOR SELECT
  USING (true);

-- Staff can manage content
CREATE POLICY "Staff can manage coworking content"
  ON public.coworking_content
  FOR ALL
  TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_office_listings_status ON public.office_listings(status);
CREATE INDEX idx_office_listings_type ON public.office_listings(office_type);
CREATE INDEX idx_office_listings_floor ON public.office_listings(floor);
CREATE INDEX idx_office_listings_active ON public.office_listings(is_active);
CREATE INDEX idx_office_photos_office ON public.office_photos(office_id);
CREATE INDEX idx_office_promotions_office ON public.office_promotions(office_id);
CREATE INDEX idx_office_promotions_dates ON public.office_promotions(start_date, end_date);
CREATE INDEX idx_office_inquiries_status ON public.office_inquiries(status);
CREATE INDEX idx_office_inquiries_type ON public.office_inquiries(inquiry_type);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION public.update_office_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_office_listings_updated_at
  BEFORE UPDATE ON public.office_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_office_updated_at();

CREATE TRIGGER update_office_promotions_updated_at
  BEFORE UPDATE ON public.office_promotions
  FOR EACH ROW EXECUTE FUNCTION public.update_office_updated_at();

CREATE TRIGGER update_office_inquiries_updated_at
  BEFORE UPDATE ON public.office_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_office_updated_at();

-- =============================================
-- SEED INITIAL OFFICE INVENTORY
-- 6 offices as specified
-- =============================================
INSERT INTO public.office_listings (
  name, slug, description, tagline, office_type, floor, floor_label,
  square_footage, capacity, ideal_use, amenities, status, sort_order
) VALUES
  (
    'The Cornerstone Executive Office',
    'the-cornerstone-executive-office',
    'A premier corner office featuring floor-to-ceiling windows with expansive views. This prestigious space offers maximum natural light and an impressive setting for high-level work and client meetings.',
    'Where vision meets ambition',
    'executive_suite',
    1,
    'First Floor',
    NULL,
    4,
    'Executive teams, founders, and leaders who need a prestigious space',
    '["Corner location", "Floor-to-ceiling windows", "Premium views", "Private entrance option", "Meeting space included"]'::jsonb,
    'available',
    1
  ),
  (
    'The Horizon Office',
    'the-horizon-office',
    'An inspiring first-floor office designed for forward-thinking professionals. Natural light floods this space throughout the day, creating an energizing environment for productivity.',
    'Clarity starts here',
    'private_office',
    1,
    'First Floor',
    NULL,
    2,
    'Professionals who value natural light and a focused environment',
    '["Natural lighting", "First floor access", "Quiet location", "Built-in storage"]'::jsonb,
    'available',
    2
  ),
  (
    'The Vista Executive Suite',
    'the-vista-executive-suite',
    'An expansive executive suite offering commanding views and premium finishes. Designed for those who require both space and sophistication for their daily operations.',
    'See further, achieve more',
    'executive_suite',
    1,
    'First Floor',
    NULL,
    3,
    'Growing teams and executives who need room to expand',
    '["Premium views", "Extra square footage", "Executive finishes", "Client-ready space"]'::jsonb,
    'available',
    3
  ),
  (
    'The Summit Office',
    'the-summit-office',
    'A distinguished first-floor office that combines accessibility with prestige. Ideal for professionals who appreciate a balance of convenience and professional presentation.',
    'Elevate your work',
    'private_office',
    1,
    'First Floor',
    NULL,
    2,
    'Client-facing professionals who need convenient access',
    '["Ground floor convenience", "Professional atmosphere", "Natural light", "Visitor-friendly location"]'::jsonb,
    'available',
    4
  ),
  (
    'The Loft Private Office',
    'the-loft-private-office',
    'A versatile 350 sq ft private office on the second floor offering the perfect blend of space and value. This office provides room to grow while maintaining an intimate, focused atmosphere.',
    'Room to grow',
    'private_office',
    2,
    'Second Floor',
    350,
    3,
    'Small teams or individuals who need extra space for equipment or meetings',
    '["350 sq ft", "Second floor privacy", "Room for growth", "Flexible layout", "Built-in storage"]'::jsonb,
    'available',
    5
  ),
  (
    'The Studio Office',
    'the-studio-office',
    'A well-appointed 350 sq ft private office designed for creative and technical professionals. The second-floor location offers quiet focus away from the main flow, perfect for deep work.',
    'Where ideas take shape',
    'private_office',
    2,
    'Second Floor',
    350,
    3,
    'Creative professionals, developers, or anyone needing focused deep-work space',
    '["350 sq ft", "Quiet second floor location", "Deep work environment", "Flexible configuration", "Natural light"]'::jsonb,
    'available',
    6
  );

-- Seed initial coworking page content sections
INSERT INTO public.coworking_content (section_key, content) VALUES
  ('hero', '{"headline": "Private Offices & Flexible Workspaces in Wapakoneta", "subheadline": "Private offices, dedicated desks, and day passes — request access in under 2 minutes.", "trust_chip": "No obligation. Local team response within 24 hours. No payment until confirmed."}'::jsonb),
  ('why_the_hive', '{"title": "Why The Hive", "subtitle": "Designed for people who take work seriously.", "cards": [{"title": "Flexibility", "description": "Work on your terms. Scale up or down as your needs change—no rigid contracts."}, {"title": "Community", "description": "Surround yourself with driven professionals. Collaboration happens naturally here."}, {"title": "Productivity", "description": "Purpose-built environments that eliminate distractions and amplify your output."}, {"title": "Convenience", "description": "Everything handled for you. Just show up, plug in, and get to work."}]}'::jsonb),
  ('how_it_works', '{"title": "How It Works", "steps": [{"title": "Request Your Workspace", "description": "Tell us what you need. Private office, dedicated desk, or flexible access—we''ll take it from there."}, {"title": "We Confirm Options", "description": "We''ll review availability and send you a personalized proposal. You''ll review everything before payment."}, {"title": "Start Working", "description": "Once confirmed, you''re in. No obligation to proceed until you''re ready."}]}'::jsonb),
  ('faqs', '{"items": [{"question": "How does requesting a workspace work?", "answer": "Simply click ''Request Workspace'' and tell us what you''re looking for. We''ll review your request and get back to you within 24 hours with availability and options. There''s no commitment until you decide to proceed."}, {"question": "Do I have to commit right away?", "answer": "Not at all. You''ll receive a personalized proposal first, and you can take your time to decide. There''s no obligation until you''re ready to move forward. You''ll review everything before any payment is required."}, {"question": "What about guests and meeting room access?", "answer": "All members can bring guests and book meeting rooms. Private office members get priority booking, while dedicated desk and day pass holders have standard access. Guest policies vary by membership type."}, {"question": "How does pricing work?", "answer": "Pricing varies based on workspace type and selected services. You''ll receive a personalized proposal after consultation—no commitment required."}, {"question": "What if I need to cancel or change my plan?", "answer": "We understand needs change. Our team will work with you on transitions. Specific terms depend on your agreement type and will be clearly outlined in your proposal."}]}'::jsonb);