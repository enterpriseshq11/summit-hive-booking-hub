
CREATE TABLE public.hive_leases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  office_code text NOT NULL,
  tenant_name text NOT NULL,
  tenant_email text NOT NULL,
  tenant_phone text,
  lease_start date NOT NULL,
  lease_end date,
  monthly_rate numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'manual',
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hive_leases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view hive leases"
  ON public.hive_leases FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Staff can create hive leases"
  ON public.hive_leases FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Staff can update hive leases"
  ON public.hive_leases FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Staff can delete hive leases"
  ON public.hive_leases FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_hive_leases_updated_at
  BEFORE UPDATE ON public.hive_leases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
