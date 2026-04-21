INSERT INTO public.user_roles (user_id, role)
SELECT 'e37e296a-dd4e-410a-92e8-b4e159ba0247', 'owner'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = 'e37e296a-dd4e-410a-92e8-b4e159ba0247' AND role = 'owner'
);