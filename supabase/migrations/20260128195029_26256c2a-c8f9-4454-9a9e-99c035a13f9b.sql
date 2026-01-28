-- Add config entries for included items toggles
INSERT INTO public.app_config (key, value, description)
VALUES 
  ('included_360_photobooth_enabled', 'true', 'Controls whether 360 Photo Booth appears in What''s Included section'),
  ('included_voice_vault_enabled', 'true', 'Controls whether Voice Vault appears in What''s Included section')
ON CONFLICT (key) DO NOTHING;