CREATE TABLE public.ghl_inbound_raw_payloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type TEXT,
  contact_id TEXT,
  lead_id UUID,
  location_id TEXT,
  raw_body JSONB,
  headers JSONB
);

CREATE INDEX idx_ghl_inbound_raw_received_at ON public.ghl_inbound_raw_payloads (received_at DESC);
CREATE INDEX idx_ghl_inbound_raw_contact_id ON public.ghl_inbound_raw_payloads (contact_id);
CREATE INDEX idx_ghl_inbound_raw_lead_id ON public.ghl_inbound_raw_payloads (lead_id);

ALTER TABLE public.ghl_inbound_raw_payloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and managers can view raw GHL payloads"
ON public.ghl_inbound_raw_payloads
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'manager')
);