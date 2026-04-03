
-- Add sales_acquisitions role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales_acquisitions';

-- Create a table to store known team email → role mappings
CREATE TABLE IF NOT EXISTS public.team_email_role_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  role text NOT NULL,
  department text DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.team_email_role_map ENABLE ROW LEVEL SECURITY;

-- Only superadmin can manage this table
CREATE POLICY "Admins can manage team email role map"
  ON public.team_email_role_map
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Seed the known team emails
INSERT INTO public.team_email_role_map (email, role, department) VALUES
  ('dylan@a-zenterpriseshq.com', 'owner', NULL),
  ('victoria@a-zenterpriseshq.com', 'manager', NULL),
  ('mark@a-zenterpriseshq.com', 'sales_acquisitions', NULL),
  ('nasiya@a-zenterpriseshq.com', 'spa_lead', 'spa'),
  ('elyse@a-zenterpriseshq.com', 'marketing_lead', NULL),
  ('operations@a-zenterpriseshq.com', 'ops_lead', NULL),
  ('media1@a-zenterpriseshq.com', 'ads_lead', NULL)
ON CONFLICT (email) DO NOTHING;

-- Create trigger function to auto-assign roles on user creation
CREATE OR REPLACE FUNCTION public.auto_assign_team_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_mapping record;
BEGIN
  SELECT * INTO v_mapping FROM public.team_email_role_map WHERE email = NEW.email;
  
  IF FOUND THEN
    INSERT INTO public.user_roles (user_id, role, department)
    VALUES (NEW.id, v_mapping.role::app_role, v_mapping.department::business_type)
    ON CONFLICT (user_id, role, department) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Attach to auth.users after insert (fires after handle_new_user)
CREATE TRIGGER on_new_user_auto_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_team_role();
