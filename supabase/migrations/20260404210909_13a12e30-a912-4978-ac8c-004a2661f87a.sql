
-- Add unique constraint on user_onboarding.user_id
ALTER TABLE public.user_onboarding ADD CONSTRAINT user_onboarding_user_id_unique UNIQUE (user_id);

-- Insert availability for Nasiya (Mon=1 through Sat=6, 9am-6pm)
INSERT INTO public.spa_worker_availability (worker_id, day_of_week, start_time, end_time, is_active)
VALUES
  ('bce2dff4-58ac-4abb-90c2-5505343902a7', 1, '09:00', '18:00', true),
  ('bce2dff4-58ac-4abb-90c2-5505343902a7', 2, '09:00', '18:00', true),
  ('bce2dff4-58ac-4abb-90c2-5505343902a7', 3, '09:00', '18:00', true),
  ('bce2dff4-58ac-4abb-90c2-5505343902a7', 4, '09:00', '18:00', true),
  ('bce2dff4-58ac-4abb-90c2-5505343902a7', 5, '09:00', '18:00', true),
  ('bce2dff4-58ac-4abb-90c2-5505343902a7', 6, '09:00', '18:00', true)
ON CONFLICT DO NOTHING;
