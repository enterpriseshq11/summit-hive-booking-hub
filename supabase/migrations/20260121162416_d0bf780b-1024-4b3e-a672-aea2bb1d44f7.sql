-- Add availability windows for 360 Photo Booth (7 days/week, 9AM-9PM)
-- Using the correct bookable_type_id: 84469d5b-dd85-47e4-afbc-2e9370e49d7a

INSERT INTO availability_windows (bookable_type_id, day_of_week, start_time, end_time, is_active)
VALUES 
  ('84469d5b-dd85-47e4-afbc-2e9370e49d7a', 0, '09:00:00', '21:00:00', true),
  ('84469d5b-dd85-47e4-afbc-2e9370e49d7a', 1, '09:00:00', '21:00:00', true),
  ('84469d5b-dd85-47e4-afbc-2e9370e49d7a', 2, '09:00:00', '21:00:00', true),
  ('84469d5b-dd85-47e4-afbc-2e9370e49d7a', 3, '09:00:00', '21:00:00', true),
  ('84469d5b-dd85-47e4-afbc-2e9370e49d7a', 4, '09:00:00', '21:00:00', true),
  ('84469d5b-dd85-47e4-afbc-2e9370e49d7a', 5, '09:00:00', '21:00:00', true),
  ('84469d5b-dd85-47e4-afbc-2e9370e49d7a', 6, '09:00:00', '21:00:00', true)
ON CONFLICT DO NOTHING;