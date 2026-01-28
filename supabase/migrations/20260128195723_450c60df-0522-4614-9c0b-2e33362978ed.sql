-- Add payment toggle config entries for Voice Vault and 360 Photo Booth (default ON)
INSERT INTO public.app_config (key, value, description)
VALUES 
  ('voice_vault_payments_enabled', 'true', 'When true, Voice Vault bookings require deposit payment. When false, bookings are confirmed as pay-on-arrival.'),
  ('photobooth360_payments_enabled', 'true', 'When true, 360 Photo Booth bookings require deposit payment. When false, bookings are confirmed as pay-on-arrival.')
ON CONFLICT (key) DO UPDATE SET description = EXCLUDED.description;