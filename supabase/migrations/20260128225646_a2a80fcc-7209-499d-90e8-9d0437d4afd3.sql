-- Add new booking status values for reschedule workflow
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'reschedule_requested';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'rescheduled';

-- Create reschedule_requests table to track reschedule proposals
CREATE TABLE public.reschedule_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  initiated_by UUID REFERENCES auth.users(id),
  reason TEXT,
  proposed_times JSONB NOT NULL DEFAULT '[]',
  selected_time_index INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'expired', 'cancelled')),
  original_start_datetime TIMESTAMPTZ NOT NULL,
  original_end_datetime TIMESTAMPTZ NOT NULL,
  new_start_datetime TIMESTAMPTZ,
  new_end_datetime TIMESTAMPTZ,
  confirmation_token TEXT UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for lookups
CREATE INDEX idx_reschedule_requests_booking_id ON public.reschedule_requests(booking_id);
CREATE INDEX idx_reschedule_requests_status ON public.reschedule_requests(status);
CREATE INDEX idx_reschedule_requests_token ON public.reschedule_requests(confirmation_token);

-- Enable RLS
ALTER TABLE public.reschedule_requests ENABLE ROW LEVEL SECURITY;

-- Admin/staff can see all reschedule requests
CREATE POLICY "Staff can view all reschedule requests"
ON public.reschedule_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('owner', 'manager', 'spa_lead', 'event_coordinator')
  )
);

-- Admin/staff can manage reschedule requests
CREATE POLICY "Staff can manage reschedule requests"
ON public.reschedule_requests
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('owner', 'manager', 'spa_lead', 'event_coordinator')
  )
);

-- Customers can view their own reschedule requests
CREATE POLICY "Customers can view own reschedule requests"
ON public.reschedule_requests
FOR SELECT
USING (
  booking_id IN (
    SELECT id FROM public.bookings WHERE customer_id = auth.uid()
  )
);

-- Allow service role to insert/update for edge functions
CREATE POLICY "Service role full access"
ON public.reschedule_requests
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Add trigger for updated_at
CREATE TRIGGER update_reschedule_requests_updated_at
BEFORE UPDATE ON public.reschedule_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add to audit log via trigger
CREATE OR REPLACE FUNCTION log_reschedule_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_log (
      action_type,
      entity_type,
      entity_id,
      actor_user_id,
      before_json,
      after_json
    ) VALUES (
      'reschedule_' || NEW.status,
      'reschedule_requests',
      NEW.id,
      NEW.initiated_by,
      jsonb_build_object('status', OLD.status, 'booking_id', NEW.booking_id),
      jsonb_build_object('status', NEW.status, 'new_start_datetime', NEW.new_start_datetime)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER reschedule_status_audit
AFTER UPDATE ON public.reschedule_requests
FOR EACH ROW
EXECUTE FUNCTION log_reschedule_status_change();