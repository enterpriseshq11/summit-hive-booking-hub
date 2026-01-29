-- 1) Create the public-safe worker table
CREATE TABLE public.spa_workers_public (
  worker_id uuid PRIMARY KEY,
  display_name text NOT NULL,
  slug text UNIQUE,
  title text,
  is_active boolean NOT NULL DEFAULT false,
  onboarding_complete boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.spa_workers_public ENABLE ROW LEVEL SECURITY;

-- Public can only see active + onboarded workers (safe fields only)
CREATE POLICY "Public can view bookable workers"
ON public.spa_workers_public
FOR SELECT
USING (is_active = true AND onboarding_complete = true);

-- Admins can manage all rows
CREATE POLICY "Admins can manage spa_workers_public"
ON public.spa_workers_public
FOR ALL
USING (public.is_admin(auth.uid()));

-- 2) Create trigger function to sync spa_workers -> spa_workers_public
CREATE OR REPLACE FUNCTION public.sync_spa_workers_public()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.spa_workers_public WHERE worker_id = OLD.id;
    RETURN OLD;
  ELSE
    -- Upsert the safe fields into public table
    INSERT INTO public.spa_workers_public (
      worker_id,
      display_name,
      slug,
      title,
      is_active,
      onboarding_complete,
      updated_at
    ) VALUES (
      NEW.id,
      COALESCE(NEW.display_name, NEW.first_name || ' ' || NEW.last_name),
      NEW.slug,
      NEW.title,
      NEW.is_active,
      COALESCE(NEW.onboarding_complete, false),
      now()
    )
    ON CONFLICT (worker_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      slug = EXCLUDED.slug,
      title = EXCLUDED.title,
      is_active = EXCLUDED.is_active,
      onboarding_complete = EXCLUDED.onboarding_complete,
      updated_at = now();
    RETURN NEW;
  END IF;
END;
$$;

-- Create the trigger
CREATE TRIGGER sync_spa_workers_to_public
AFTER INSERT OR UPDATE OR DELETE ON public.spa_workers
FOR EACH ROW
EXECUTE FUNCTION public.sync_spa_workers_public();

-- 3) Update RLS policies on spa_worker_services to reference spa_workers_public
DROP POLICY IF EXISTS "Public can read active services" ON public.spa_worker_services;

CREATE POLICY "Public can read services for bookable workers"
ON public.spa_worker_services
FOR SELECT
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM public.spa_workers_public swp
    WHERE swp.worker_id = spa_worker_services.worker_id
      AND swp.is_active = true
      AND swp.onboarding_complete = true
  )
);

-- 4) Update RLS policies on spa_worker_availability to reference spa_workers_public
DROP POLICY IF EXISTS "Public can view active worker availability" ON public.spa_worker_availability;

CREATE POLICY "Public can view availability for bookable workers"
ON public.spa_worker_availability
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.spa_workers_public swp
    WHERE swp.worker_id = spa_worker_availability.worker_id
      AND swp.is_active = true
      AND swp.onboarding_complete = true
  )
);

-- 5) Remove the problematic public SELECT policy on spa_workers (exposes PII)
DROP POLICY IF EXISTS "Public can view active workers for booking" ON public.spa_workers;

-- 6) Backfill spa_workers_public from existing spa_workers
INSERT INTO public.spa_workers_public (worker_id, display_name, slug, title, is_active, onboarding_complete, updated_at)
SELECT 
  id,
  COALESCE(display_name, first_name || ' ' || last_name),
  slug,
  title,
  is_active,
  COALESCE(onboarding_complete, false),
  now()
FROM public.spa_workers
WHERE deleted_at IS NULL
ON CONFLICT (worker_id) DO NOTHING;

-- 7) Mark eligible workers as onboarding_complete (those who already have schedule + services)
UPDATE public.spa_workers sw
SET onboarding_complete = true
WHERE sw.is_active = true
  AND sw.deleted_at IS NULL
  AND sw.user_id IS NOT NULL
  AND sw.onboarding_complete = false
  AND EXISTS (
    SELECT 1 FROM public.spa_worker_availability swa
    WHERE swa.worker_id = sw.id
  )
  AND EXISTS (
    SELECT 1 FROM public.spa_worker_services sws
    WHERE sws.worker_id = sw.id AND sws.is_active = true
  );