-- Add a Tour bookable type for coworking (using 'instant' mode for free tours)
INSERT INTO bookable_types (
  id, business_id, name, slug, description, booking_mode, 
  min_duration_mins, max_duration_mins, buffer_after_mins,
  deposit_percentage, is_active, sort_order
) VALUES (
  'a1b2c3d4-e5f6-4789-abcd-ef0123456789',
  'c26074ed-db5b-4c28-b41c-8a31e388062c',
  'Tour',
  'tour',
  'Schedule a walkthrough of our coworking spaces',
  'instant',
  30, 60, 30,
  0, true, 99
) ON CONFLICT (id) DO NOTHING;

-- Add Tour package (free)
INSERT INTO packages (
  id, bookable_type_id, name, slug, description, duration_mins, base_price, is_active, sort_order
) VALUES (
  'b2c3d4e5-f6a7-4890-bcde-f01234567890',
  'a1b2c3d4-e5f6-4789-abcd-ef0123456789',
  'Facility Tour',
  'facility-tour',
  '30-minute walkthrough of all workspace options',
  30, 0, true, 1
) ON CONFLICT (id) DO NOTHING;