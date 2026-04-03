
DROP POLICY IF EXISTS "Public can submit intake forms" ON public.lead_intake_submissions;

CREATE POLICY "Public can submit intake forms"
  ON public.lead_intake_submissions FOR INSERT TO anon
  WITH CHECK (true);

-- Also create the mobile home inventory table if not exists (it may have been created above)
CREATE TABLE IF NOT EXISTS public.mobile_home_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_address text NOT NULL,
  date_purchased date DEFAULT NULL,
  purchase_price numeric DEFAULT 0,
  renovation_cost numeric DEFAULT 0,
  renovation_line_items jsonb DEFAULT '[]',
  date_listed date DEFAULT NULL,
  list_price numeric DEFAULT NULL,
  date_sold date DEFAULT NULL,
  sale_price numeric DEFAULT NULL,
  gross_profit numeric GENERATED ALWAYS AS (
    COALESCE(sale_price, 0) - COALESCE(purchase_price, 0) - COALESCE(renovation_cost, 0)
  ) STORED,
  assigned_agent text DEFAULT NULL,
  status text DEFAULT 'in_renovation' CHECK (status IN ('in_renovation', 'listed', 'under_contract', 'under_due_diligence', 'sold', 'canceled')),
  notes text DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.mobile_home_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage mobile home inventory" ON public.mobile_home_inventory;
CREATE POLICY "Staff can manage mobile home inventory"
  ON public.mobile_home_inventory FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()));

DROP TRIGGER IF EXISTS update_mobile_home_updated_at ON public.mobile_home_inventory;
CREATE TRIGGER update_mobile_home_updated_at
  BEFORE UPDATE ON public.mobile_home_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
