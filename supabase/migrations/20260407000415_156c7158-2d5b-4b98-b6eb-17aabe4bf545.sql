-- Create outbound GHL webhook config table
CREATE TABLE public.ghl_outbound_webhook_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_unit TEXT NOT NULL DEFAULT 'default',
  stage_key TEXT NOT NULL,
  stage_label TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (business_unit, stage_key)
);

-- Enable RLS
ALTER TABLE public.ghl_outbound_webhook_config ENABLE ROW LEVEL SECURITY;

-- Only owners/managers can access
CREATE POLICY "Admins can view webhook config"
ON public.ghl_outbound_webhook_config
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert webhook config"
ON public.ghl_outbound_webhook_config
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update webhook config"
ON public.ghl_outbound_webhook_config
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete webhook config"
ON public.ghl_outbound_webhook_config
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Auto-update timestamp
CREATE TRIGGER update_ghl_outbound_webhook_config_updated_at
BEFORE UPDATE ON public.ghl_outbound_webhook_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();