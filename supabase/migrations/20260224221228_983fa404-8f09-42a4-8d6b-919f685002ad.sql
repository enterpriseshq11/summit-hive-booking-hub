
-- ============================================================
-- PHASE 2: Booking Creation + State Engine + Conflict Detection
-- ============================================================

-- 1. ADD MISSING COLUMNS
ALTER TABLE public.e3_bookings
  ADD COLUMN IF NOT EXISTS hours_booked numeric(4,2),
  ADD COLUMN IF NOT EXISTS deposit_due_at timestamptz;

-- ============================================================
-- 2. HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.e3_get_coordinator_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id FROM public.e3_coordinators
  WHERE user_id = _user_id AND is_active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.e3_config_value(p_key text)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT value FROM public.e3_config WHERE key = p_key LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.e3_get_commission_tier(p_coordinator_id uuid)
RETURNS numeric
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_completed integer;
  v_tiers jsonb;
  v_tier jsonb;
  v_percent numeric := 0.25;
  v_override numeric;
BEGIN
  SELECT commission_override_pct INTO v_override
  FROM public.e3_coordinators WHERE id = p_coordinator_id;
  IF v_override IS NOT NULL THEN RETURN v_override; END IF;

  SELECT count(*) INTO v_completed
  FROM public.e3_bookings
  WHERE coordinator_id = p_coordinator_id
    AND booking_state = 'completed'
    AND date_trunc('month', event_date) = date_trunc('month', current_date);

  SELECT (value::jsonb)->'tiers' INTO v_tiers
  FROM public.e3_config WHERE key = 'tier_thresholds';

  IF v_tiers IS NOT NULL THEN
    FOR v_tier IN SELECT * FROM jsonb_array_elements(v_tiers) ORDER BY (value->>'threshold')::int DESC
    LOOP
      IF v_completed >= (v_tier->>'threshold')::int THEN
        v_percent := (v_tier->>'percent')::numeric / 100.0;
        EXIT;
      END IF;
    END LOOP;
  END IF;

  RETURN v_percent;
END;
$$;

-- ============================================================
-- 3. CONFLICT DETECTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.e3_check_conflict(
  p_venue_id uuid,
  p_event_date date,
  p_time_block_id uuid,
  p_hall_ids uuid[],
  p_exclude_booking_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_conflicting_halls text[];
  v_blackout boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.e3_blackout_dates
    WHERE venue_id = p_venue_id AND blackout_date = p_event_date
  ) INTO v_blackout;

  IF v_blackout THEN
    RETURN jsonb_build_object('has_conflict', true, 'reason', 'Date is blacked out for this venue');
  END IF;

  SELECT array_agg(DISTINCT h.name)
  INTO v_conflicting_halls
  FROM public.e3_booking_halls bh
  JOIN public.e3_bookings b ON b.id = bh.booking_id
  JOIN public.e3_halls h ON h.id = bh.hall_id
  WHERE b.venue_id = p_venue_id
    AND b.event_date = p_event_date
    AND b.time_block_id = p_time_block_id
    AND b.booking_state IN ('red_hold', 'yellow_contract', 'green_booked')
    AND (p_exclude_booking_id IS NULL OR b.id != p_exclude_booking_id)
    AND bh.hall_id = ANY(p_hall_ids);

  IF v_conflicting_halls IS NOT NULL AND array_length(v_conflicting_halls, 1) > 0 THEN
    RETURN jsonb_build_object(
      'has_conflict', true,
      'reason', 'Hall(s) already booked: ' || array_to_string(v_conflicting_halls, ', ')
    );
  END IF;

  RETURN jsonb_build_object('has_conflict', false);
END;
$$;

-- ============================================================
-- 4. BOOKING CREATION RPC
-- ============================================================

CREATE OR REPLACE FUNCTION public.e3_create_booking(
  p_venue_id uuid,
  p_event_date date,
  p_time_block_id uuid,
  p_hall_ids uuid[],
  p_client_name text,
  p_client_email text,
  p_client_phone text DEFAULT NULL,
  p_event_type text DEFAULT NULL,
  p_guest_count integer DEFAULT NULL,
  p_gross_revenue numeric DEFAULT 0,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_coordinator_id uuid;
  v_conflict jsonb;
  v_active_holds integer;
  v_max_holds integer;
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

  v_max_holds := COALESCE((public.e3_config_value('max_active_red_holds_per_coordinator'))::int, 2);
  SELECT count(*) INTO v_active_holds
  FROM public.e3_bookings
  WHERE coordinator_id = v_coordinator_id
    AND booking_state = 'red_hold'
    AND expires_at > now();

  IF v_active_holds >= v_max_holds THEN
    RETURN jsonb_build_object('error', format('Hold limit reached (%s active holds). Complete or let an existing hold expire.', v_max_holds));
  END IF;

  SELECT start_time, end_time INTO v_tb_start, v_tb_end
  FROM public.e3_time_blocks WHERE id = p_time_block_id;
  v_hours := EXTRACT(EPOCH FROM (v_tb_end - v_tb_start)) / 3600.0;

  SELECT COALESCE(
    (SELECT base_cost_per_hour FROM public.e3_venues WHERE id = p_venue_id),
    (public.e3_config_value('base_cost_per_hour'))::numeric
  ) INTO v_base_cost;

  SELECT COALESCE(SUM(v_hours * v_base_cost * allocation_percentage), 0)
  INTO v_building_overhead
  FROM public.e3_halls WHERE id = ANY(p_hall_ids);

  SELECT COALESCE(SUM(reset_buffer), 0) INTO v_reset_total
  FROM public.e3_halls WHERE id = ANY(p_hall_ids);

  SELECT count(*) INTO v_total_halls
  FROM public.e3_halls WHERE venue_id = p_venue_id AND active_status = true;
  v_selected_halls := array_length(p_hall_ids, 1);
  v_is_full := (v_selected_halls >= v_total_halls);

  IF v_is_full THEN
    v_full_facility_buffer := COALESCE((public.e3_config_value('full_facility_reset_buffer'))::numeric, 350);
    v_reset_total := GREATEST(v_full_facility_buffer, v_reset_total);
  END IF;

  v_total_cost := v_building_overhead + v_reset_total;
  v_net_contribution := p_gross_revenue - v_total_cost;

  v_commission_pct := public.e3_get_commission_tier(v_coordinator_id);
  IF v_net_contribution > 0 THEN
    v_commission_amt := v_net_contribution * v_commission_pct;
  ELSE
    v_commission_amt := 0;
  END IF;

  v_expiration_hours := COALESCE((public.e3_config_value('red_hold_expiration_hours'))::int, 48);

  INSERT INTO public.e3_bookings (
    venue_id, coordinator_id, client_name, client_email, client_phone,
    event_type, guest_count, event_date, time_block_id,
    booking_state, gross_revenue, building_overhead, reset_total,
    total_cost, net_contribution, commission_percentage, commission_amount,
    is_full_facility, hours_booked, expires_at, notes, payment_status
  ) VALUES (
    p_venue_id, v_coordinator_id, p_client_name, p_client_email, p_client_phone,
    p_event_type, p_guest_count, p_event_date, p_time_block_id,
    'red_hold', p_gross_revenue, v_building_overhead, v_reset_total,
    v_total_cost, v_net_contribution, v_commission_pct, v_commission_amt,
    v_is_full, v_hours, now() + (v_expiration_hours || ' hours')::interval, p_notes, 'pending'
  )
  RETURNING id INTO v_booking_id;

  FOREACH v_hall_id IN ARRAY p_hall_ids LOOP
    INSERT INTO public.e3_booking_halls (booking_id, hall_id)
    VALUES (v_booking_id, v_hall_id);
  END LOOP;

  INSERT INTO public.e3_audit_log (
    entity_type, entity_id, action, user_id, after_state
  ) VALUES (
    'booking', v_booking_id, 'booking_created', auth.uid(),
    jsonb_build_object(
      'state', 'red_hold',
      'venue_id', p_venue_id,
      'event_date', p_event_date,
      'halls', to_jsonb(p_hall_ids),
      'gross_revenue', p_gross_revenue,
      'net_contribution', v_net_contribution,
      'commission_amount', v_commission_amt
    )
  );

  RETURN jsonb_build_object(
    'booking_id', v_booking_id,
    'booking_state', 'red_hold',
    'expires_at', now() + (v_expiration_hours || ' hours')::interval,
    'hours_booked', v_hours,
    'building_overhead', v_building_overhead,
    'reset_total', v_reset_total,
    'total_cost', v_total_cost,
    'net_contribution', v_net_contribution,
    'commission_percent', v_commission_pct,
    'commission_amount', v_commission_amt
  );
END;
$$;

-- ============================================================
-- 5. STATE TRANSITION FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.e3_advance_to_yellow(p_booking_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_booking record;
  v_deposit_hours integer;
  v_coordinator_id uuid;
BEGIN
  SELECT * INTO v_booking FROM public.e3_bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Booking not found'); END IF;

  v_coordinator_id := public.e3_get_coordinator_id(auth.uid());
  IF (v_coordinator_id IS NULL OR v_coordinator_id != v_booking.coordinator_id)
     AND NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Not authorized');
  END IF;

  IF v_booking.booking_state != 'red_hold' THEN
    RETURN jsonb_build_object('error', 'Booking must be in red_hold state');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.e3_booking_documents
    WHERE booking_id = p_booking_id AND document_type = 'contract'
  ) THEN
    RETURN jsonb_build_object('error', 'Master contract must be uploaded before advancing');
  END IF;

  v_deposit_hours := COALESCE((public.e3_config_value('yellow_deposit_deadline_hours'))::int, 72);

  UPDATE public.e3_bookings
  SET booking_state = 'yellow_contract',
      deposit_due_at = now() + (v_deposit_hours || ' hours')::interval,
      expires_at = NULL
  WHERE id = p_booking_id;

  INSERT INTO public.e3_audit_log (entity_type, entity_id, action, user_id, before_state, after_state)
  VALUES ('booking', p_booking_id, 'state_to_yellow_contract', auth.uid(),
    jsonb_build_object('state', 'red_hold'),
    jsonb_build_object('state', 'yellow_contract'));

  RETURN jsonb_build_object('success', true, 'deposit_due_at', now() + (v_deposit_hours || ' hours')::interval);
END;
$$;

CREATE OR REPLACE FUNCTION public.e3_approve_deposit(p_booking_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_booking record;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Admin access required');
  END IF;

  SELECT * INTO v_booking FROM public.e3_bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Booking not found'); END IF;

  IF v_booking.booking_state != 'yellow_contract' THEN
    RETURN jsonb_build_object('error', 'Booking must be in yellow_contract state');
  END IF;

  UPDATE public.e3_bookings
  SET booking_state = 'green_booked', admin_approved = true, deposit_due_at = NULL
  WHERE id = p_booking_id;

  INSERT INTO public.e3_audit_log (entity_type, entity_id, action, user_id, before_state, after_state)
  VALUES ('booking', p_booking_id, 'deposit_approved_green', auth.uid(),
    jsonb_build_object('state', 'yellow_contract'),
    jsonb_build_object('state', 'green_booked', 'admin_approved', true));

  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.e3_cancel_booking(p_booking_id uuid, p_reason text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_booking record;
  v_coordinator_id uuid;
  v_is_admin boolean;
BEGIN
  v_is_admin := public.is_admin(auth.uid());
  v_coordinator_id := public.e3_get_coordinator_id(auth.uid());

  SELECT * INTO v_booking FROM public.e3_bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Booking not found'); END IF;

  IF NOT v_is_admin THEN
    IF v_coordinator_id IS NULL OR v_coordinator_id != v_booking.coordinator_id THEN
      RETURN jsonb_build_object('error', 'Not authorized');
    END IF;
    IF v_booking.booking_state != 'red_hold' THEN
      RETURN jsonb_build_object('error', 'Coordinators can only cancel bookings in red_hold state');
    END IF;
  END IF;

  IF v_booking.booking_state IN ('completed', 'expired', 'cancelled') THEN
    RETURN jsonb_build_object('error', 'Cannot cancel a booking in ' || v_booking.booking_state || ' state');
  END IF;

  UPDATE public.e3_bookings
  SET booking_state = 'cancelled', notes = COALESCE(p_reason, notes)
  WHERE id = p_booking_id;

  INSERT INTO public.e3_audit_log (entity_type, entity_id, action, user_id, before_state, after_state)
  VALUES ('booking', p_booking_id, 'booking_cancelled', auth.uid(),
    jsonb_build_object('state', v_booking.booking_state),
    jsonb_build_object('state', 'cancelled', 'reason', p_reason));

  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.e3_update_booking(
  p_booking_id uuid,
  p_hall_ids uuid[] DEFAULT NULL,
  p_time_block_id uuid DEFAULT NULL,
  p_gross_revenue numeric DEFAULT NULL,
  p_client_name text DEFAULT NULL,
  p_client_email text DEFAULT NULL,
  p_client_phone text DEFAULT NULL,
  p_event_type text DEFAULT NULL,
  p_guest_count integer DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_booking record;
  v_coordinator_id uuid;
  v_conflict jsonb;
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
  v_tb_start time;
  v_tb_end time;
  v_hall_id uuid;
  v_effective_halls uuid[];
  v_effective_tb uuid;
BEGIN
  SELECT * INTO v_booking FROM public.e3_bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Booking not found'); END IF;

  v_coordinator_id := public.e3_get_coordinator_id(auth.uid());
  IF (v_coordinator_id IS NULL OR v_coordinator_id != v_booking.coordinator_id)
     AND NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Not authorized');
  END IF;

  IF v_booking.booking_state = 'green_booked' THEN
    RETURN jsonb_build_object('error', 'Cannot edit a green_booked booking');
  END IF;
  IF v_booking.booking_state NOT IN ('red_hold', 'yellow_contract') THEN
    RETURN jsonb_build_object('error', 'Booking is not editable in ' || v_booking.booking_state || ' state');
  END IF;
  IF v_booking.booking_state = 'yellow_contract' AND (p_hall_ids IS NOT NULL OR p_time_block_id IS NOT NULL) THEN
    RETURN jsonb_build_object('error', 'Halls and time block can only be changed in red_hold state');
  END IF;

  v_effective_halls := COALESCE(p_hall_ids, ARRAY(SELECT hall_id FROM public.e3_booking_halls WHERE booking_id = p_booking_id));
  v_effective_tb := COALESCE(p_time_block_id, v_booking.time_block_id);

  IF p_hall_ids IS NOT NULL OR p_time_block_id IS NOT NULL THEN
    PERFORM 1 FROM public.e3_bookings
    WHERE venue_id = v_booking.venue_id AND event_date = v_booking.event_date AND time_block_id = v_effective_tb
      AND booking_state IN ('red_hold', 'yellow_contract', 'green_booked')
      AND id != p_booking_id
    FOR UPDATE;

    v_conflict := public.e3_check_conflict(v_booking.venue_id, v_booking.event_date, v_effective_tb, v_effective_halls, p_booking_id);
    IF (v_conflict->>'has_conflict')::boolean THEN
      RETURN jsonb_build_object('error', v_conflict->>'reason');
    END IF;

    IF p_hall_ids IS NOT NULL THEN
      DELETE FROM public.e3_booking_halls WHERE booking_id = p_booking_id;
      FOREACH v_hall_id IN ARRAY p_hall_ids LOOP
        INSERT INTO public.e3_booking_halls (booking_id, hall_id) VALUES (p_booking_id, v_hall_id);
      END LOOP;
    END IF;
  END IF;

  SELECT start_time, end_time INTO v_tb_start, v_tb_end
  FROM public.e3_time_blocks WHERE id = v_effective_tb;
  v_hours := EXTRACT(EPOCH FROM (v_tb_end - v_tb_start)) / 3600.0;

  SELECT COALESCE(
    (SELECT base_cost_per_hour FROM public.e3_venues WHERE id = v_booking.venue_id),
    (public.e3_config_value('base_cost_per_hour'))::numeric
  ) INTO v_base_cost;

  SELECT COALESCE(SUM(v_hours * v_base_cost * allocation_percentage), 0)
  INTO v_building_overhead FROM public.e3_halls WHERE id = ANY(v_effective_halls);

  SELECT COALESCE(SUM(reset_buffer), 0) INTO v_reset_total
  FROM public.e3_halls WHERE id = ANY(v_effective_halls);

  SELECT count(*) INTO v_total_halls FROM public.e3_halls WHERE venue_id = v_booking.venue_id AND active_status = true;
  v_selected_halls := array_length(v_effective_halls, 1);
  v_is_full := (v_selected_halls >= v_total_halls);

  IF v_is_full THEN
    v_full_facility_buffer := COALESCE((public.e3_config_value('full_facility_reset_buffer'))::numeric, 350);
    v_reset_total := GREATEST(v_full_facility_buffer, v_reset_total);
  END IF;

  v_total_cost := v_building_overhead + v_reset_total;
  v_net_contribution := COALESCE(p_gross_revenue, v_booking.gross_revenue) - v_total_cost;

  v_commission_pct := public.e3_get_commission_tier(v_booking.coordinator_id);
  IF v_net_contribution > 0 THEN v_commission_amt := v_net_contribution * v_commission_pct;
  ELSE v_commission_amt := 0; END IF;

  UPDATE public.e3_bookings SET
    time_block_id = v_effective_tb,
    gross_revenue = COALESCE(p_gross_revenue, gross_revenue),
    client_name = COALESCE(p_client_name, client_name),
    client_email = COALESCE(p_client_email, client_email),
    client_phone = COALESCE(p_client_phone, client_phone),
    event_type = COALESCE(p_event_type, event_type),
    guest_count = COALESCE(p_guest_count, guest_count),
    notes = COALESCE(p_notes, notes),
    hours_booked = v_hours,
    building_overhead = v_building_overhead,
    reset_total = v_reset_total,
    total_cost = v_total_cost,
    net_contribution = v_net_contribution,
    commission_percentage = v_commission_pct,
    commission_amount = v_commission_amt,
    is_full_facility = v_is_full
  WHERE id = p_booking_id;

  INSERT INTO public.e3_audit_log (entity_type, entity_id, action, user_id, after_state)
  VALUES ('booking', p_booking_id, 'booking_updated', auth.uid(),
    jsonb_build_object('gross_revenue', COALESCE(p_gross_revenue, v_booking.gross_revenue),
      'net_contribution', v_net_contribution, 'commission_amount', v_commission_amt));

  RETURN jsonb_build_object('success', true, 'net_contribution', v_net_contribution, 'commission_amount', v_commission_amt);
END;
$$;

-- ============================================================
-- 6. AUTOMATION FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.e3_expire_stale_bookings()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_count integer := 0;
  v_booking record;
BEGIN
  FOR v_booking IN
    SELECT id FROM public.e3_bookings
    WHERE booking_state = 'red_hold' AND expires_at < now()
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE public.e3_bookings SET booking_state = 'expired' WHERE id = v_booking.id;
    INSERT INTO public.e3_audit_log (entity_type, entity_id, action, before_state, after_state)
    VALUES ('booking', v_booking.id, 'auto_expired',
      jsonb_build_object('state', 'red_hold'),
      jsonb_build_object('state', 'expired'));
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.e3_revert_missed_deposits()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_count integer := 0;
  v_booking record;
BEGIN
  FOR v_booking IN
    SELECT id FROM public.e3_bookings
    WHERE booking_state = 'yellow_contract'
      AND deposit_due_at IS NOT NULL
      AND deposit_due_at < now()
      AND NOT admin_approved
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE public.e3_bookings
    SET booking_state = 'red_hold',
        expires_at = now() + interval '24 hours',
        deposit_due_at = NULL
    WHERE id = v_booking.id;

    INSERT INTO public.e3_audit_log (entity_type, entity_id, action, before_state, after_state)
    VALUES ('booking', v_booking.id, 'auto_reverted_deposit_missed',
      jsonb_build_object('state', 'yellow_contract'),
      jsonb_build_object('state', 'red_hold'));
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$;

-- ============================================================
-- 7. STATE TRANSITION VALIDATION TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.e3_validate_state_transition()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_allowed boolean := false;
BEGIN
  IF OLD.booking_state = NEW.booking_state THEN RETURN NEW; END IF;

  CASE OLD.booking_state
    WHEN 'red_hold' THEN
      v_allowed := NEW.booking_state IN ('yellow_contract', 'expired', 'cancelled');
    WHEN 'yellow_contract' THEN
      v_allowed := NEW.booking_state IN ('green_booked', 'red_hold', 'cancelled');
    WHEN 'green_booked' THEN
      v_allowed := NEW.booking_state IN ('completed', 'cancelled');
    ELSE
      v_allowed := false;
  END CASE;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Invalid state transition: % to %', OLD.booking_state, NEW.booking_state;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS e3_booking_state_transition ON public.e3_bookings;
CREATE TRIGGER e3_booking_state_transition
  BEFORE UPDATE OF booking_state ON public.e3_bookings
  FOR EACH ROW EXECUTE FUNCTION public.e3_validate_state_transition();

-- ============================================================
-- 8. RLS POLICIES
-- ============================================================

DROP POLICY IF EXISTS "e3_bookings_coordinator_select" ON public.e3_bookings;
DROP POLICY IF EXISTS "e3_bookings_admin_all" ON public.e3_bookings;
CREATE POLICY "e3_bookings_coordinator_select" ON public.e3_bookings
  FOR SELECT TO authenticated
  USING (coordinator_id = public.e3_get_coordinator_id(auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "e3_bookings_admin_all" ON public.e3_bookings
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "e3_booking_halls_select" ON public.e3_booking_halls;
DROP POLICY IF EXISTS "e3_booking_halls_admin_all" ON public.e3_booking_halls;
CREATE POLICY "e3_booking_halls_select" ON public.e3_booking_halls
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.e3_bookings b
    WHERE b.id = booking_id
    AND (b.coordinator_id = public.e3_get_coordinator_id(auth.uid()) OR public.is_admin(auth.uid()))
  ));
CREATE POLICY "e3_booking_halls_admin_all" ON public.e3_booking_halls
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "e3_docs_select" ON public.e3_booking_documents;
DROP POLICY IF EXISTS "e3_docs_insert" ON public.e3_booking_documents;
DROP POLICY IF EXISTS "e3_docs_admin_all" ON public.e3_booking_documents;
CREATE POLICY "e3_docs_select" ON public.e3_booking_documents
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.e3_bookings b
    WHERE b.id = booking_id
    AND (b.coordinator_id = public.e3_get_coordinator_id(auth.uid()) OR public.is_admin(auth.uid()))
  ));
CREATE POLICY "e3_docs_insert" ON public.e3_booking_documents
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.e3_bookings b
    WHERE b.id = booking_id
    AND (b.coordinator_id = public.e3_get_coordinator_id(auth.uid()) OR public.is_admin(auth.uid()))
  ));
CREATE POLICY "e3_docs_admin_all" ON public.e3_booking_documents
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Reference tables: readable by authenticated, admin writable
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['e3_venues', 'e3_halls', 'e3_time_blocks', 'e3_config', 'e3_document_templates', 'e3_blackout_dates']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s_auth_select" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_admin_all" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "%s_auth_select" ON public.%I FOR SELECT TO authenticated USING (true)', t, t);
    EXECUTE format('CREATE POLICY "%s_admin_all" ON public.%I FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))', t, t);
  END LOOP;
END;
$$;

DROP POLICY IF EXISTS "e3_coordinators_own_select" ON public.e3_coordinators;
DROP POLICY IF EXISTS "e3_coordinators_admin_all" ON public.e3_coordinators;
CREATE POLICY "e3_coordinators_own_select" ON public.e3_coordinators
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "e3_coordinators_admin_all" ON public.e3_coordinators
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "e3_commissions_own_select" ON public.e3_commissions;
DROP POLICY IF EXISTS "e3_commissions_admin_all" ON public.e3_commissions;
CREATE POLICY "e3_commissions_own_select" ON public.e3_commissions
  FOR SELECT TO authenticated
  USING (coordinator_id = public.e3_get_coordinator_id(auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "e3_commissions_admin_all" ON public.e3_commissions
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "e3_referrals_own_select" ON public.e3_referral_overrides;
DROP POLICY IF EXISTS "e3_referrals_admin_all" ON public.e3_referral_overrides;
CREATE POLICY "e3_referrals_own_select" ON public.e3_referral_overrides
  FOR SELECT TO authenticated
  USING (beneficiary_id = public.e3_get_coordinator_id(auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "e3_referrals_admin_all" ON public.e3_referral_overrides
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "e3_audit_admin_select" ON public.e3_audit_log;
CREATE POLICY "e3_audit_admin_select" ON public.e3_audit_log
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================================
-- 9. PERFORMANCE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_e3_bookings_conflict ON public.e3_bookings (venue_id, event_date, time_block_id, booking_state);
CREATE INDEX IF NOT EXISTS idx_e3_bookings_coordinator_state ON public.e3_bookings (coordinator_id, booking_state);
CREATE INDEX IF NOT EXISTS idx_e3_bookings_expires ON public.e3_bookings (booking_state, expires_at) WHERE booking_state = 'red_hold';
CREATE INDEX IF NOT EXISTS idx_e3_bookings_deposit_due ON public.e3_bookings (booking_state, deposit_due_at) WHERE booking_state = 'yellow_contract';
CREATE INDEX IF NOT EXISTS idx_e3_booking_halls_lookup ON public.e3_booking_halls (booking_id, hall_id);
