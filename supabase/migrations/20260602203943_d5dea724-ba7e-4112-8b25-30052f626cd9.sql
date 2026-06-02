INSERT INTO public.career_openings (team, role, employment_type, is_active, apply_route, sort_order)
VALUES ('spa', 'Hair Stylist / Hairdresser', '1099', true, '/careers/spa/hair-stylist', 60)
ON CONFLICT DO NOTHING;