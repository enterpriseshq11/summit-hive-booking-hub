-- Create spa_worker_services table to store worker-specific services and pricing
CREATE TABLE public.spa_worker_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES spa_workers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  duration_mins integer NOT NULL,
  price numeric(10,2) NOT NULL,
  promo_price numeric(10,2),
  promo_ends_at timestamptz,
  is_free boolean DEFAULT false,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  icon_name text DEFAULT 'heart',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add slug column to spa_workers for SEO-friendly URLs (without unique constraint first)
ALTER TABLE spa_workers 
ADD COLUMN IF NOT EXISTS slug text;

-- Add title column to spa_workers for custom job title
ALTER TABLE spa_workers 
ADD COLUMN IF NOT EXISTS title text DEFAULT 'Massage Therapist';

-- Backfill slugs with unique suffix using row number for duplicates
WITH slugged AS (
  SELECT 
    id,
    lower(regexp_replace(display_name, '[^a-zA-Z0-9]+', '-', 'g')) as base_slug,
    ROW_NUMBER() OVER (PARTITION BY lower(regexp_replace(display_name, '[^a-zA-Z0-9]+', '-', 'g')) ORDER BY created_at) as rn
  FROM spa_workers
  WHERE display_name IS NOT NULL
)
UPDATE spa_workers
SET slug = CASE 
  WHEN slugged.rn = 1 THEN slugged.base_slug
  ELSE slugged.base_slug || '-' || slugged.rn
END
FROM slugged
WHERE spa_workers.id = slugged.id AND spa_workers.slug IS NULL;

-- Now add unique constraint
ALTER TABLE spa_workers ADD CONSTRAINT spa_workers_slug_unique UNIQUE (slug);

-- Enable RLS
ALTER TABLE spa_worker_services ENABLE ROW LEVEL SECURITY;

-- Workers can manage their own services
CREATE POLICY "Workers can manage own services"
ON spa_worker_services FOR ALL TO authenticated
USING (
  worker_id IN (
    SELECT id FROM spa_workers WHERE user_id = auth.uid()
  )
);

-- Public can read active services for bookable workers
CREATE POLICY "Public can read active services"
ON spa_worker_services FOR SELECT TO anon, authenticated
USING (
  is_active = true AND
  worker_id IN (
    SELECT id FROM spa_workers 
    WHERE is_active = true 
    AND onboarding_complete = true 
    AND deleted_at IS NULL
  )
);

-- Managers and spa_lead can manage all services
CREATE POLICY "Managers can manage all services"
ON spa_worker_services FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('owner', 'manager', 'spa_lead')
  )
);

-- Create updated_at trigger for spa_worker_services
CREATE OR REPLACE FUNCTION update_spa_worker_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_spa_worker_services_updated_at
  BEFORE UPDATE ON spa_worker_services
  FOR EACH ROW
  EXECUTE FUNCTION update_spa_worker_services_updated_at();