-- 1) Insert Lindsey as a provider for the Spa (Restoration Lounge)
INSERT INTO public.providers (
  id,
  business_id,
  name,
  title,
  bio,
  specialties,
  certifications,
  avatar_url,
  is_active,
  accepts_bookings,
  sort_order,
  settings
) VALUES (
  'a1b2c3d4-5678-90ab-cdef-1234567890ab',
  '4df48af2-39e4-4bd1-a9b3-963de8ef39d7',
  'Lindsey',
  'Licensed Massage Therapist & Recovery Specialist',
  'Lindsey is the heart of The Restoration Lounge. She specializes in results-driven recovery treatments designed to help clients move better, feel better, and perform at their highest level. Her approach blends clinical expertise with a premium, personalized experience. Every session is intentional, customized, and focused on real outcomes.',
  '["Deep Tissue", "Swedish", "Ashiatsu", "Couples Massage", "Sports Recovery", "Prenatal"]'::jsonb,
  '["Licensed Massage Therapist"]'::jsonb,
  NULL,
  true,
  true,
  0,
  '{}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  specialties = EXCLUDED.specialties,
  is_active = EXCLUDED.is_active,
  accepts_bookings = EXCLUDED.accepts_bookings,
  sort_order = EXCLUDED.sort_order;

-- 2) Create two rooms for the Spa: H1 (Hallway Room) and B1 (Back Room)
INSERT INTO public.resources (
  id,
  business_id,
  name,
  slug,
  description,
  type,
  capacity,
  amenities,
  images,
  is_active,
  sort_order,
  settings
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  '4df48af2-39e4-4bd1-a9b3-963de8ef39d7',
  'H1 - Hallway Room',
  'h1-hallway-room',
  'Private treatment room located in the hallway area. Calm, quiet, and perfect for focused recovery sessions.',
  'room',
  1,
  '["Private", "Climate Controlled", "Ambient Sound"]'::jsonb,
  '[]'::jsonb,
  true,
  1,
  '{}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222',
  '4df48af2-39e4-4bd1-a9b3-963de8ef39d7',
  'B1 - Back Room',
  'b1-back-room',
  'Private treatment room in the back of the facility. Secluded and peaceful for maximum relaxation.',
  'room',
  2,
  '["Private", "Couples-Friendly", "Climate Controlled", "Ambient Sound"]'::jsonb,
  '[]'::jsonb,
  true,
  2,
  '{}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  is_active = EXCLUDED.is_active;

-- 3) Create provider schedules for Lindsey - 7 days a week, 9 AM - 9 PM
-- Day 0 = Sunday, 1 = Monday, ..., 6 = Saturday
INSERT INTO public.provider_schedules (
  id,
  provider_id,
  day_of_week,
  start_time,
  end_time,
  is_active
) VALUES
  (gen_random_uuid(), 'a1b2c3d4-5678-90ab-cdef-1234567890ab', 0, '09:00:00', '21:00:00', true),
  (gen_random_uuid(), 'a1b2c3d4-5678-90ab-cdef-1234567890ab', 1, '09:00:00', '21:00:00', true),
  (gen_random_uuid(), 'a1b2c3d4-5678-90ab-cdef-1234567890ab', 2, '09:00:00', '21:00:00', true),
  (gen_random_uuid(), 'a1b2c3d4-5678-90ab-cdef-1234567890ab', 3, '09:00:00', '21:00:00', true),
  (gen_random_uuid(), 'a1b2c3d4-5678-90ab-cdef-1234567890ab', 4, '09:00:00', '21:00:00', true),
  (gen_random_uuid(), 'a1b2c3d4-5678-90ab-cdef-1234567890ab', 5, '09:00:00', '21:00:00', true),
  (gen_random_uuid(), 'a1b2c3d4-5678-90ab-cdef-1234567890ab', 6, '09:00:00', '21:00:00', true)
ON CONFLICT DO NOTHING;