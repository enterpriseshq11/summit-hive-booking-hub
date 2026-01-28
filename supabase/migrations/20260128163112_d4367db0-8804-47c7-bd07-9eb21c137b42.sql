-- Create enum for career teams
CREATE TYPE public.career_team AS ENUM ('spa', 'contracting', 'fitness');

-- Create enum for application status
CREATE TYPE public.career_application_status AS ENUM ('new', 'reviewing', 'interview', 'offer', 'hired', 'rejected');

-- Create career_applications table
CREATE TABLE public.career_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  team public.career_team NOT NULL,
  role TEXT NOT NULL,
  status public.career_application_status NOT NULL DEFAULT 'new',
  source_url TEXT,
  form_version TEXT DEFAULT '1.0',
  applicant JSONB NOT NULL DEFAULT '{}'::jsonb,
  role_specific JSONB DEFAULT '{}'::jsonb,
  availability JSONB DEFAULT '{}'::jsonb,
  consents JSONB NOT NULL DEFAULT '{}'::jsonb,
  attachments JSONB DEFAULT '{}'::jsonb
);

-- Create career_openings table for job listings
CREATE TABLE public.career_openings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  team public.career_team NOT NULL,
  role TEXT NOT NULL,
  location TEXT,
  employment_type TEXT,
  pay_range TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  apply_route TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Create career_application_activity table for tracking changes
CREATE TABLE public.career_application_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  application_id UUID NOT NULL REFERENCES public.career_applications(id) ON DELETE CASCADE,
  actor UUID,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_application_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for career_applications
-- Anyone can insert (apply)
CREATE POLICY "Anyone can submit applications"
ON public.career_applications
FOR INSERT
WITH CHECK (true);

-- Only staff can view applications
CREATE POLICY "Staff can view applications"
ON public.career_applications
FOR SELECT
USING (public.is_staff(auth.uid()));

-- Only admins can update applications
CREATE POLICY "Admins can update applications"
ON public.career_applications
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- RLS Policies for career_openings
-- Anyone can view active openings
CREATE POLICY "Anyone can view active openings"
ON public.career_openings
FOR SELECT
USING (is_active = true);

-- Only admins can manage openings
CREATE POLICY "Admins can manage openings"
ON public.career_openings
FOR ALL
USING (public.is_admin(auth.uid()));

-- RLS Policies for career_application_activity
-- Only staff can view activity
CREATE POLICY "Staff can view application activity"
ON public.career_application_activity
FOR SELECT
USING (public.is_staff(auth.uid()));

-- Only admins can insert activity
CREATE POLICY "Admins can insert application activity"
ON public.career_application_activity
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_career_applications_updated_at
BEFORE UPDATE ON public.career_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_career_openings_updated_at
BEFORE UPDATE ON public.career_openings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for common queries
CREATE INDEX idx_career_applications_team ON public.career_applications(team);
CREATE INDEX idx_career_applications_status ON public.career_applications(status);
CREATE INDEX idx_career_applications_created_at ON public.career_applications(created_at DESC);
CREATE INDEX idx_career_openings_team ON public.career_openings(team);
CREATE INDEX idx_career_openings_active ON public.career_openings(is_active);

-- Insert some initial job openings
INSERT INTO public.career_openings (team, role, location, employment_type, pay_range, description, apply_route, sort_order) VALUES
('spa', 'Massage Therapist', 'Wapakoneta, OH', 'W2 or 1099', '$30-50/hr', 'Join our spa team as a licensed massage therapist. Multiple modalities welcome.', '/careers/spa/massage-therapist', 1),
('spa', 'Yoga Instructor', 'Wapakoneta, OH', 'Contract', '$25-40/class', 'Lead yoga classes in our beautiful studio space. RYT certification required.', '/careers/spa/yoga-instructor', 2),
('spa', 'Pilates Instructor', 'Wapakoneta, OH', 'Contract', '$30-45/session', 'Teach mat and/or reformer Pilates to our wellness community.', '/careers/spa/pilates-instructor', 3),
('spa', 'Esthetician', 'Wapakoneta, OH', 'W2 or 1099', '$18-30/hr', 'Provide facials, skincare treatments, and consultations.', '/careers/spa/esthetician', 4),
('spa', 'Nail Tech', 'Wapakoneta, OH', 'W2 or 1099', '$15-25/hr + tips', 'Full-service nail technician for manicures, pedicures, and nail art.', '/careers/spa/nail-tech', 5),
('spa', 'Front Desk', 'Wapakoneta, OH', 'Part-time', '$12-15/hr', 'Be the welcoming face of our spa. Manage bookings and guest services.', '/careers/spa/front-desk', 6),
('fitness', 'Personal Trainer', 'Wapakoneta, OH', 'W2 or 1099', '$25-50/session', 'Help members achieve their fitness goals with personalized training.', '/careers/fitness/personal-trainer', 1),
('fitness', 'Group Fitness Coach', 'Wapakoneta, OH', 'Contract', '$20-35/class', 'Lead energizing group fitness classes.', '/careers/fitness/coach', 2),
('contracting', 'General Contractor', 'Northwest Ohio', '1099', 'Project-based', 'Join our contractor network for residential and commercial projects.', '/careers/contracting/general', 1);