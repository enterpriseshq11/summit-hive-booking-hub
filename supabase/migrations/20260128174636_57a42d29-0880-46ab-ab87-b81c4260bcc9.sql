-- Add is_read column for read/unread tracking
ALTER TABLE public.career_applications 
ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false;

-- Add tags column for auto-tagging (array of text for team/role tags)
ALTER TABLE public.career_applications 
ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

-- Create index for faster tag queries
CREATE INDEX IF NOT EXISTS idx_career_applications_tags ON public.career_applications USING GIN(tags);

-- Create index for faster is_read queries
CREATE INDEX IF NOT EXISTS idx_career_applications_is_read ON public.career_applications(is_read);

-- Create a function to auto-generate tags from team and role on insert/update
CREATE OR REPLACE FUNCTION public.generate_career_application_tags()
RETURNS TRIGGER AS $$
DECLARE
  new_tags text[];
  role_slug text;
BEGIN
  -- Generate team tag
  new_tags := ARRAY['Team:' || NEW.team];
  
  -- Generate role slug (lowercase, replace spaces with hyphens)
  role_slug := lower(regexp_replace(NEW.role, '\s+', '-', 'g'));
  new_tags := array_append(new_tags, 'Role:' || role_slug);
  
  NEW.tags := new_tags;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for auto-tagging
DROP TRIGGER IF EXISTS trg_career_application_tags ON public.career_applications;
CREATE TRIGGER trg_career_application_tags
BEFORE INSERT OR UPDATE OF team, role ON public.career_applications
FOR EACH ROW
EXECUTE FUNCTION public.generate_career_application_tags();

-- Backfill existing applications with tags
UPDATE public.career_applications
SET tags = ARRAY[
  'Team:' || team,
  'Role:' || lower(regexp_replace(role, '\s+', '-', 'g'))
]
WHERE tags = '{}' OR tags IS NULL;