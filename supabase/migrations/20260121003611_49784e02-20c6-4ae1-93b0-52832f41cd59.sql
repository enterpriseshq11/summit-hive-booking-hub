-- Update deposit defaults to 33% for deposit-based experiences
UPDATE public.bookable_types
SET deposit_percentage = 33,
    updated_at = now()
WHERE slug IN ('voice-vault-hourly','photo-booth-rental');

-- Voice Vault hourly pricing ($45/hr)
UPDATE public.packages
SET base_price = 45,
    updated_at = now()
WHERE id = '82446431-4984-426f-ae4a-0dd4485a6035';

-- 360 Photo Booth placeholder pricing
UPDATE public.packages
SET base_price = 400,
    updated_at = now()
WHERE id = '9069ba94-b439-4023-a530-c6c17480ef20';

-- Add 3hr + 4hr packages for 360 Photo Booth
INSERT INTO public.packages (
  bookable_type_id,
  name,
  slug,
  description,
  duration_mins,
  base_price,
  member_price,
  included_items,
  sort_order,
  is_active
)
VALUES
  (
    '84469d5b-dd85-47e4-afbc-2e9370e49d7a',
    '3 Hour Rental',
    'photo-booth-3hr',
    '3-hour 360 photo booth rental. Attendant included. Setup + teardown included.',
    180,
    500,
    NULL,
    '[]'::jsonb,
    2,
    TRUE
  ),
  (
    '84469d5b-dd85-47e4-afbc-2e9370e49d7a',
    '4 Hour Rental',
    'photo-booth-4hr',
    '4-hour 360 photo booth rental. Attendant included. Setup + teardown included.',
    240,
    600,
    NULL,
    '[]'::jsonb,
    3,
    TRUE
  );