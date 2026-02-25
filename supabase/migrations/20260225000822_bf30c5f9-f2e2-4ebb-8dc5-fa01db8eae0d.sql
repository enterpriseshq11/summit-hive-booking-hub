
-- ============================================================
-- PHASE 5: Production Hardening & Monitoring
-- ============================================================

-- 1) Notification Outbox
CREATE TYPE public.e3_notification_type AS ENUM (
  'red_hold_reminder', 'deposit_reminder', 'green_confirmed',
  'commission_created', 'commission_approved', 'commission_paid',
  'override_created', 'override_paid', 'booking_expired',
  'booking_cancelled', 'deposit_reverted'
);

CREATE TYPE public.e3_notification_channel AS ENUM ('email', 'sms');
CREATE TYPE public.e3_notification_status AS ENUM ('queued', 'sent', 'failed');

CREATE TABLE public.e3_notifications_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.e3_bookings(id) ON DELETE SET NULL,
  coordinator_id uuid REFERENCES public.e3_coordinators(id) ON DELETE SET NULL,
  notification_type public.e3_notification_type NOT NULL,
  channel public.e3_notification_channel NOT NULL DEFAULT 'email',
  payload_json jsonb DEFAULT '{}',
  status public.e3_notification_status NOT NULL DEFAULT 'queued',
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  error text
);

ALTER TABLE public.e3_notifications_outbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage e3 notifications"
  ON public.e3_notifications_outbox FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE INDEX idx_e3_notif_status ON public.e3_notifications_outbox(status);
CREATE INDEX idx_e3_notif_booking ON public.e3_notifications_outbox(booking_id);

-- 2) Coordinator quality control fields
ALTER TABLE public.e3_coordinators
  ADD COLUMN IF NOT EXISTS coordinator_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS max_holds_override integer,
  ADD COLUMN IF NOT EXISTS admin_notes text;

-- 3) Notification triggers (populate outbox on key events)
CREATE OR REPLACE FUNCTION public.e3_queue_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Commission created
  IF TG_TABLE_NAME = 'e3_commissions' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.e3_notifications_outbox (booking_id, coordinator_id, notification_type, payload_json)
    VALUES (NEW.booking_id, NEW.coordinator_id, 'commission_created',
      jsonb_build_object('commission_id', NEW.id, 'amount', NEW.commission_amount));
    RETURN NEW;
  END IF;

  -- Commission status changes
  IF TG_TABLE_NAME = 'e3_commissions' AND TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      IF NEW.status = 'approved' THEN
        INSERT INTO public.e3_notifications_outbox (booking_id, coordinator_id, notification_type, payload_json)
        VALUES (NEW.booking_id, NEW.coordinator_id, 'commission_approved',
          jsonb_build_object('commission_id', NEW.id, 'amount', NEW.commission_amount));
      ELSIF NEW.status = 'paid' THEN
        INSERT INTO public.e3_notifications_outbox (booking_id, coordinator_id, notification_type, payload_json)
        VALUES (NEW.booking_id, NEW.coordinator_id, 'commission_paid',
          jsonb_build_object('commission_id', NEW.id, 'amount', NEW.commission_amount));
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- Booking state changes
  IF TG_TABLE_NAME = 'e3_bookings' AND TG_OP = 'UPDATE' THEN
    IF OLD.booking_state IS DISTINCT FROM NEW.booking_state THEN
      IF NEW.booking_state = 'green_booked' THEN
        INSERT INTO public.e3_notifications_outbox (booking_id, coordinator_id, notification_type, payload_json)
        VALUES (NEW.id, NEW.coordinator_id, 'green_confirmed',
          jsonb_build_object('event_date', NEW.event_date, 'client_name', NEW.client_name));
      ELSIF NEW.booking_state = 'expired' THEN
        INSERT INTO public.e3_notifications_outbox (booking_id, coordinator_id, notification_type, payload_json)
        VALUES (NEW.id, NEW.coordinator_id, 'booking_expired',
          jsonb_build_object('event_date', NEW.event_date));
      ELSIF NEW.booking_state = 'cancelled' THEN
        INSERT INTO public.e3_notifications_outbox (booking_id, coordinator_id, notification_type, payload_json)
        VALUES (NEW.id, NEW.coordinator_id, 'booking_cancelled',
          jsonb_build_object('event_date', NEW.event_date));
      END IF;
    END IF;
    -- Deposit reverted (yellow -> red)
    IF OLD.booking_state = 'yellow_contract' AND NEW.booking_state = 'red_hold' THEN
      INSERT INTO public.e3_notifications_outbox (booking_id, coordinator_id, notification_type, payload_json)
      VALUES (NEW.id, NEW.coordinator_id, 'deposit_reverted',
        jsonb_build_object('event_date', NEW.event_date));
    END IF;
    RETURN NEW;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_e3_notify_commission
  AFTER INSERT OR UPDATE ON public.e3_commissions
  FOR EACH ROW EXECUTE FUNCTION public.e3_queue_notification();

CREATE TRIGGER trg_e3_notify_booking
  AFTER UPDATE ON public.e3_bookings
  FOR EACH ROW EXECUTE FUNCTION public.e3_queue_notification();

-- 4) Health check function
CREATE OR REPLACE FUNCTION public.e3_system_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_expiring_soon integer;
  v_deposits_overdue integer;
  v_commissions_stale integer;
  v_overrides_stale integer;
  v_docs_missing integer;
  v_notif_queued integer;
  v_notif_failed integer;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Admin access required');
  END IF;

  SELECT count(*) INTO v_expiring_soon
  FROM public.e3_bookings
  WHERE booking_state = 'red_hold' AND expires_at BETWEEN now() AND now() + interval '6 hours';

  SELECT count(*) INTO v_deposits_overdue
  FROM public.e3_bookings
  WHERE booking_state = 'yellow_contract' AND deposit_due_at < now() AND NOT admin_approved;

  SELECT count(*) INTO v_commissions_stale
  FROM public.e3_commissions
  WHERE status = 'pending' AND created_at < now() - interval '7 days';

  SELECT count(*) INTO v_overrides_stale
  FROM public.e3_referral_overrides
  WHERE status = 'pending' AND created_at < now() - interval '7 days';

  SELECT count(*) INTO v_docs_missing
  FROM public.e3_bookings b
  WHERE b.booking_state IN ('yellow_contract', 'green_booked')
    AND (
      SELECT count(DISTINCT bd.document_type)
      FROM public.e3_booking_documents bd
      WHERE bd.booking_id = b.id
    ) < 5;

  SELECT count(*) FILTER (WHERE status = 'queued'),
         count(*) FILTER (WHERE status = 'failed')
  INTO v_notif_queued, v_notif_failed
  FROM public.e3_notifications_outbox;

  v_result := jsonb_build_object(
    'red_holds_expiring_6h', v_expiring_soon,
    'deposits_overdue', v_deposits_overdue,
    'commissions_pending_7d', v_commissions_stale,
    'overrides_pending_7d', v_overrides_stale,
    'bookings_missing_docs', v_docs_missing,
    'notifications_queued', v_notif_queued,
    'notifications_failed', v_notif_failed,
    'checked_at', now()
  );

  RETURN v_result;
END;
$$;

-- 5) Coordinator suspension enforcement in create booking
CREATE OR REPLACE FUNCTION public.e3_create_booking(
  p_venue_id uuid, p_event_date date, p_time_block_id uuid, p_hall_ids uuid[],
  p_client_name text, p_client_email text, p_client_phone text DEFAULT NULL,
  p_event_type text DEFAULT NULL, p_guest_count integer DEFAULT NULL,
  p_gross_revenue numeric DEFAULT 0, p_notes text DEFAULT NULL,
  p_has_alcohol boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coordinator_id uuid;
  v_coordinator_status text;
  v_conflict jsonb;
  v_active_holds integer;
  v_max_holds integer;
  v_max_holds_override integer;
  v_hours numeric;
  v_base_cost numeric;
  v_building_overhead numeric;
  v_reset_total numeric;
  v_full_facility_buffer numeric;
  v_total_cost numeric;
  v_net_contribution numeric;
  v_commission_pct numeric;
  v_commission_amt numeric;
  v_is_full boolean;
  v_total_halls integer;
  v_selected_halls integer;
  v_booking_id uuid;
  v_expiration_hours integer;
  v_tb_start time;
  v_tb_end time;
  v_hall_id uuid;
BEGIN
  v_coordinator_id := public.e3_get_coordinator_id(auth.uid());
  IF v_coordinator_id IS NULL THEN
    IF NOT public.is_admin(auth.uid()) THEN
      RETURN jsonb_build_object('error', 'Not authorized as coordinator or admin');
    END IF;
    RETURN jsonb_build_object('error', 'Admin must act as a coordinator to create bookings');
  END IF;

  -- Check coordinator suspension
  SELECT coordinator_status, max_holds_override INTO v_coordinator_status, v_max_holds_override
  FROM public.e3_coordinators WHERE id = v_coordinator_id;
  IF v_coordinator_status = 'suspended' THEN
    RETURN jsonb_build_object('error', 'Your coordinator account is suspended. Contact admin.');
  END IF;

  IF array_length(p_hall_ids, 1) IS NULL OR array_length(p_hall_ids, 1) = 0 THEN
    RETURN jsonb_build_object('error', 'At least one hall must be selected');
  END IF;

  PERFORM 1 FROM public.e3_bookings
  WHERE venue_id = p_venue_id AND event_date = p_event_date AND time_block_id = p_time_block_id
    AND booking_state IN ('red_hold', 'yellow_contract', 'green_booked')
  FOR UPDATE;

  v_conflict := public.e3_check_conflict(p_venue_id, p_event_date, p_time_block_id, p_hall_ids);
  IF (v_conflict->>'has_conflict')::boolean THEN
    RETURN jsonb_build_object('error', v_conflict->>'reason');
  END IF;

  v_max_holds := COALESCE(v_max_holds_override,
    (public.e3_config_value('max_active_red_holds_per_coordinator'))::int, 2);
  SELECT count(*) INTO v_active_holds
  FROM public.e3_bookings
  WHERE coordinator_id = v_coordinator_id AND booking_state = 'red_hold' AND expires_at > now();

  IF v_active_holds >= v_max_holds THEN
    RETURN jsonb_build_object('error', format('Hold limit reached (%s active holds).', v_max_holds));
  END IF;

  SELECT start_time, end_time INTO v_tb_start, v_tb_end FROM public.e3_time_blocks WHERE id = p_time_block_id;
  v_hours := EXTRACT(EPOCH FROM (v_tb_end - v_tb_start)) / 3600.0;

  SELECT COALESCE(
    (SELECT base_cost_per_hour FROM public.e3_venues WHERE id = p_venue_id),
    (public.e3_config_value('base_cost_per_hour'))::numeric
  ) INTO v_base_cost;

  SELECT COALESCE(SUM(v_hours * v_base_cost * allocation_percentage), 0)
  INTO v_building_overhead FROM public.e3_halls WHERE id = ANY(p_hall_ids);

  SELECT COALESCE(SUM(reset_buffer), 0) INTO v_reset_total FROM public.e3_halls WHERE id = ANY(p_hall_ids);

  SELECT count(*) INTO v_total_halls FROM public.e3_halls WHERE venue_id = p_venue_id AND active_status = true;
  v_selected_halls := array_length(p_hall_ids, 1);
  v_is_full := (v_selected_halls >= v_total_halls);

  IF v_is_full THEN
    v_full_facility_buffer := COALESCE((public.e3_config_value('full_facility_reset_buffer'))::numeric, 350);
    v_reset_total := GREATEST(v_full_facility_buffer, v_reset_total);
  END IF;

  v_total_cost := v_building_overhead + v_reset_total;
  v_net_contribution := p_gross_revenue - v_total_cost;

  v_commission_pct := public.e3_get_commission_tier(v_coordinator_id);
  IF v_net_contribution > 0 THEN v_commission_amt := v_net_contribution * v_commission_pct;
  ELSE v_commission_amt := 0; END IF;

  v_expiration_hours := COALESCE((public.e3_config_value('red_hold_expiration_hours'))::int, 48);

  INSERT INTO public.e3_bookings (
    venue_id, coordinator_id, client_name, client_email, client_phone,
    event_type, guest_count, event_date, time_block_id,
    booking_state, gross_revenue, building_overhead, reset_total,
    total_cost, net_contribution, commission_percentage, commission_amount,
    is_full_facility, hours_booked, expires_at, notes, payment_status, has_alcohol
  ) VALUES (
    p_venue_id, v_coordinator_id, p_client_name, p_client_email, p_client_phone,
    p_event_type, p_guest_count, p_event_date, p_time_block_id,
    'red_hold', p_gross_revenue, v_building_overhead, v_reset_total,
    v_total_cost, v_net_contribution, v_commission_pct, v_commission_amt,
    v_is_full, v_hours, now() + (v_expiration_hours || ' hours')::interval, p_notes, 'pending', p_has_alcohol
  )
  RETURNING id INTO v_booking_id;

  FOREACH v_hall_id IN ARRAY p_hall_ids LOOP
    INSERT INTO public.e3_booking_halls (booking_id, hall_id) VALUES (v_booking_id, v_hall_id);
  END LOOP;

  INSERT INTO public.e3_audit_log (entity_type, entity_id, action, user_id, after_state)
  VALUES ('booking', v_booking_id, 'booking_created', auth.uid(),
    jsonb_build_object('state', 'red_hold', 'venue_id', p_venue_id, 'event_date', p_event_date,
      'halls', to_jsonb(p_hall_ids), 'gross_revenue', p_gross_revenue,
      'net_contribution', v_net_contribution, 'commission_amount', v_commission_amt,
      'has_alcohol', p_has_alcohol));

  RETURN jsonb_build_object(
    'booking_id', v_booking_id, 'booking_state', 'red_hold',
    'expires_at', now() + (v_expiration_hours || ' hours')::interval,
    'hours_booked', v_hours, 'building_overhead', v_building_overhead,
    'reset_total', v_reset_total, 'total_cost', v_total_cost,
    'net_contribution', v_net_contribution, 'commission_percent', v_commission_pct,
    'commission_amount', v_commission_amt);
END;
$$;

-- 6) Admin coordinator management RPCs
CREATE OR REPLACE FUNCTION public.e3_suspend_coordinator(p_coordinator_id uuid, p_reason text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Admin access required');
  END IF;

  UPDATE public.e3_coordinators
  SET coordinator_status = 'suspended',
      admin_notes = COALESCE(p_reason, admin_notes)
  WHERE id = p_coordinator_id;

  INSERT INTO public.e3_audit_log (entity_type, entity_id, action, user_id, after_state)
  VALUES ('coordinator', p_coordinator_id, 'coordinator_suspended', auth.uid(),
    jsonb_build_object('reason', p_reason));

  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.e3_reactivate_coordinator(p_coordinator_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Admin access required');
  END IF;

  UPDATE public.e3_coordinators SET coordinator_status = 'active' WHERE id = p_coordinator_id;

  INSERT INTO public.e3_audit_log (entity_type, entity_id, action, user_id, after_state)
  VALUES ('coordinator', p_coordinator_id, 'coordinator_reactivated', auth.uid(),
    jsonb_build_object('status', 'active'));

  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.e3_set_referred_by(p_coordinator_id uuid, p_referred_by_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_ref uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Admin access required');
  END IF;

  SELECT referred_by INTO v_old_ref FROM public.e3_coordinators WHERE id = p_coordinator_id;

  UPDATE public.e3_coordinators SET referred_by = p_referred_by_id WHERE id = p_coordinator_id;

  INSERT INTO public.e3_audit_log (entity_type, entity_id, action, user_id, before_state, after_state)
  VALUES ('coordinator', p_coordinator_id, 'referred_by_set', auth.uid(),
    jsonb_build_object('referred_by', v_old_ref),
    jsonb_build_object('referred_by', p_referred_by_id));

  RETURN jsonb_build_object('success', true);
END;
$$;
