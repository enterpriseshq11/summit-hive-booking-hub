
-- orphaned_files table
CREATE TABLE public.orphaned_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path text NOT NULL,
  lead_id uuid,
  intended_for text,
  upload_timestamp timestamptz NOT NULL DEFAULT now(),
  cleanup_attempted boolean DEFAULT false,
  cleanup_status text,
  cleanup_attempted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orphaned_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view orphaned files"
  ON public.orphaned_files FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can delete orphaned files"
  ON public.orphaned_files FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Staff can insert orphaned files"
  ON public.orphaned_files FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

-- admin_settings table
CREATE TABLE public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can read admin settings"
  ON public.admin_settings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can update admin settings"
  ON public.admin_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can insert admin settings"
  ON public.admin_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'owner'));

-- Seed the next_payroll_run_date setting
INSERT INTO public.admin_settings (key, value) VALUES ('next_payroll_run_date', null);
