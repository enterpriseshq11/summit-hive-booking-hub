
-- 1) Add has_alcohol to e3_bookings for conditional alcohol policy enforcement
ALTER TABLE public.e3_bookings ADD COLUMN IF NOT EXISTS has_alcohol boolean NOT NULL DEFAULT false;

-- 2) Add template_version to e3_booking_documents for version snapshot
ALTER TABLE public.e3_booking_documents ADD COLUMN IF NOT EXISTS template_version integer;

-- 3) Update e3_advance_to_yellow to include conditional alcohol check
CREATE OR REPLACE FUNCTION public.e3_advance_to_yellow(p_booking_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_booking record;
  v_deposit_hours integer;
  v_coordinator_id uuid;
  v_required_types text[];
  v_uploaded_types text[];
  v_missing text[];
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

  -- Base required docs always
  v_required_types := ARRAY['contract', 'cleaning', 'building_rules', 'damage_policy', 'cancellation_policy'];

  -- Conditionally require alcohol_policy
  IF v_booking.has_alcohol THEN
    v_required_types := array_append(v_required_types, 'alcohol_policy');
  END IF;

  SELECT array_agg(DISTINCT document_type) INTO v_uploaded_types
  FROM public.e3_booking_documents
  WHERE booking_id = p_booking_id;

  IF v_uploaded_types IS NULL THEN
    v_uploaded_types := ARRAY[]::text[];
  END IF;

  SELECT array_agg(rt) INTO v_missing
  FROM unnest(v_required_types) AS rt
  WHERE rt != ALL(v_uploaded_types);

  IF v_missing IS NOT NULL AND array_length(v_missing, 1) > 0 THEN
    RETURN jsonb_build_object(
      'error', 'Missing required documents: ' || array_to_string(v_missing, ', '),
      'missing_docs', to_jsonb(v_missing)
    );
  END IF;

  -- Verify each uploaded doc is tied to an active template version
  IF EXISTS (
    SELECT 1 FROM public.e3_booking_documents bd
    WHERE bd.booking_id = p_booking_id
      AND bd.template_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.e3_document_templates dt
        WHERE dt.id = bd.template_id AND dt.is_active = true
      )
  ) THEN
    RETURN jsonb_build_object('error', 'One or more documents reference an inactive template version. Please re-upload.');
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
$function$;

-- 4) Update e3_approve_deposit to validate docs server-side before approving
CREATE OR REPLACE FUNCTION public.e3_approve_deposit(p_booking_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_booking record;
  v_required_types text[];
  v_uploaded_types text[];
  v_missing text[];
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Admin access required');
  END IF;

  SELECT * INTO v_booking FROM public.e3_bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Booking not found'); END IF;

  IF v_booking.booking_state != 'yellow_contract' THEN
    RETURN jsonb_build_object('error', 'Booking must be in yellow_contract state');
  END IF;

  -- Server-side doc validation on deposit approval
  v_required_types := ARRAY['contract', 'cleaning', 'building_rules', 'damage_policy', 'cancellation_policy'];
  IF v_booking.has_alcohol THEN
    v_required_types := array_append(v_required_types, 'alcohol_policy');
  END IF;

  SELECT array_agg(DISTINCT document_type) INTO v_uploaded_types
  FROM public.e3_booking_documents
  WHERE booking_id = p_booking_id;
  IF v_uploaded_types IS NULL THEN v_uploaded_types := ARRAY[]::text[]; END IF;

  SELECT array_agg(rt) INTO v_missing
  FROM unnest(v_required_types) AS rt
  WHERE rt != ALL(v_uploaded_types);

  IF v_missing IS NOT NULL AND array_length(v_missing, 1) > 0 THEN
    RETURN jsonb_build_object(
      'error', 'Cannot approve: missing documents: ' || array_to_string(v_missing, ', '),
      'missing_docs', to_jsonb(v_missing)
    );
  END IF;

  -- Verify active template versions
  IF EXISTS (
    SELECT 1 FROM public.e3_booking_documents bd
    WHERE bd.booking_id = p_booking_id
      AND bd.template_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.e3_document_templates dt
        WHERE dt.id = bd.template_id AND dt.is_active = true
      )
  ) THEN
    RETURN jsonb_build_object('error', 'Documents reference inactive template versions');
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
$function$;

-- 5) Update e3_create_booking to accept has_alcohol
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
 SET search_path TO 'public'
AS $function$
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
  WHERE coordinator_id = v_coordinator_id AND booking_state = 'red_hold' AND expires_at > now();

  IF v_active_holds >= v_max_holds THEN
    RETURN jsonb_build_object('error', format('Hold limit reached (%s active holds). Complete or let an existing hold expire.', v_max_holds));
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

  INSERT INTO public.e3_audit_log (
    entity_type, entity_id, action, user_id, after_state
  ) VALUES (
    'booking', v_booking_id, 'booking_created', auth.uid(),
    jsonb_build_object(
      'state', 'red_hold', 'venue_id', p_venue_id, 'event_date', p_event_date,
      'halls', to_jsonb(p_hall_ids), 'gross_revenue', p_gross_revenue,
      'net_contribution', v_net_contribution, 'commission_amount', v_commission_amt,
      'has_alcohol', p_has_alcohol
    )
  );

  RETURN jsonb_build_object(
    'booking_id', v_booking_id, 'booking_state', 'red_hold',
    'expires_at', now() + (v_expiration_hours || ' hours')::interval,
    'hours_booked', v_hours, 'building_overhead', v_building_overhead,
    'reset_total', v_reset_total, 'total_cost', v_total_cost,
    'net_contribution', v_net_contribution, 'commission_percent', v_commission_pct,
    'commission_amount', v_commission_amt
  );
END;
$function$;
