-- Add spa_payments_enabled config setting (default false = payments disabled)
INSERT INTO public.app_config (key, value, description)
VALUES (
  'spa_payments_enabled',
  'false',
  'When false, Spa bookings skip payment/deposit collection and are marked as pay-on-arrival. Prices remain visible.'
)
ON CONFLICT (key) DO UPDATE SET value = 'false', description = EXCLUDED.description;