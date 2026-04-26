
UPDATE auth.users
SET 
  email = 'rose@azenterpriseshq.com',
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now(),
  encrypted_password = crypt('TempPass2026!', gen_salt('bf'))
WHERE id = 'e37e296a-dd4e-410a-92e8-b4e159ba0247';

UPDATE public.profiles
SET email = 'rose@azenterpriseshq.com', updated_at = now()
WHERE id = 'e37e296a-dd4e-410a-92e8-b4e159ba0247';

UPDATE auth.identities
SET 
  identity_data = jsonb_set(identity_data, '{email}', '"rose@azenterpriseshq.com"'),
  updated_at = now()
WHERE user_id = 'e37e296a-dd4e-410a-92e8-b4e159ba0247'
  AND provider = 'email';
