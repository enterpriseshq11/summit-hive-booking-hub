
-- ============================================================
-- PHASE 3: FINANCIAL SNAPSHOT + COMMISSION ENGINE
-- Uses existing tables/columns, only adds what's missing
-- ============================================================

-- 1️⃣ Add snapshot columns to e3_bookings
ALTER TABLE public.e3_bookings
  ADD COLUMN IF NOT EXISTS financial_snapshot_json jsonb,
  ADD COLUMN IF NOT EXISTS commission_snapshot_percent numeric,
  ADD COLUMN IF NOT EXISTS tier_snapshot_level text,
  ADD COLUMN IF NOT EXISTS snapshot_created_at timestamptz;

-- Add tier tracking columns to e3_coordinators (if missing)
ALTER TABLE public.e3_coordinators
  ADD COLUMN IF NOT EXISTS tier_level text DEFAULT 'bronze',
  ADD COLUMN IF NOT EXISTS tier_percent numeric DEFAULT 0.25,
  ADD COLUMN IF NOT EXISTS last_tier_calculated_at timestamptz;

-- Add unique constraint on e3_commissions.booking_id if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'e3_commissions_booking_id_unique'
  ) THEN
    ALTER TABLE public.e3_commissions ADD CONSTRAINT e3_commissions_booking_id_unique UNIQUE (booking_id);
  END IF;
END $$;

-- 2️⃣ RLS on e3_commissions (drop existing if any, recreate)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can manage e3_commissions" ON public.e3_commissions;
  DROP POLICY IF EXISTS "Coordinators can view own commissions" ON public.e3_commissions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.e3_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage e3_commissions"
  ON public.e3_commissions FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Coordinators can view own commissions"
  ON public.e3_commissions FOR SELECT
  USING (coordinator_id = public.e3_get_coordinator_id(auth.uid()));

-- 3️⃣ RLS on e3_referral_overrides
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can manage e3_referral_overrides" ON public.e3_referral_overrides;
  DROP POLICY IF EXISTS "Coordinators can view own referral overrides" ON public.e3_referral_overrides;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.e3_referral_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage e3_referral_overrides"
  ON public.e3_referral_overrides FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Coordinators can view own referral overrides"
  ON public.e3_referral_overrides FOR SELECT
  USING (beneficiary_id = public.e3_get_coordinator_id(auth.uid()));

-- 4️⃣ Snapshot locking trigger: fires on transition TO green_booked
CREATE OR REPLACE FUNCTION public.e3_lock_financial_snapshot()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $fn$
DECLARE
  v_snapshot jsonb;
  v_hall_data jsonb;
  v_venue_base numeric;
BEGIN
  IF OLD.booking_state = 'yellow_contract' AND NEW.booking_state = 'green_booked' THEN
    SELECT COALESCE(base_cost_per_hour, (e3_config_value('base_cost_per_hour'))::numeric)
    INTO v_venue_base
    FROM public.e3_venues WHERE id = NEW.venue_id;

    SELECT jsonb_agg(jsonb_build_object(
      'hall_id', h.id, 'name', h.name,
      'allocation_percentage', h.allocation_percentage,
      'reset_buffer', h.reset_buffer
    ))
    INTO v_hall_data
    FROM public.e3_booking_halls bh
    JOIN public.e3_halls h ON h.id = bh.hall_id
    WHERE bh.booking_id = NEW.id;

    v_snapshot := jsonb_build_object(
      'base_cost_per_hour', v_venue_base,
      'halls', v_hall_data,
      'hours_booked', NEW.hours_booked,
      'gross_revenue', NEW.gross_revenue,
      'building_overhead', NEW.building_overhead,
      'reset_total', NEW.reset_total,
      'total_cost', NEW.total_cost,
      'net_contribution', NEW.net_contribution,
      'commission_percentage', NEW.commission_percentage,
      'commission_amount', NEW.commission_amount,
      'is_full_facility', NEW.is_full_facility,
      'has_alcohol', NEW.has_alcohol
    );

    NEW.financial_snapshot_json := v_snapshot;
    NEW.commission_snapshot_percent := NEW.commission_percentage;
    NEW.tier_snapshot_level := COALESCE(
      (SELECT tier_level FROM public.e3_coordinators WHERE id = NEW.coordinator_id),
      'bronze'
    );
    NEW.snapshot_created_at := now();
  END IF;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_e3_lock_financial_snapshot ON public.e3_bookings;
CREATE TRIGGER trg_e3_lock_financial_snapshot
  BEFORE UPDATE ON public.e3_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.e3_lock_financial_snapshot();

-- 5️⃣ Commission auto-creation trigger (uses existing column names)
CREATE OR REPLACE FUNCTION public.e3_auto_create_commission()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $fn$
DECLARE
  v_commission_id uuid;
  v_referrer_id uuid;
  v_referrer2_id uuid;
  v_commission_amt numeric;
  v_override_amt numeric;
BEGIN
  IF NEW.booking_state = 'completed' AND NEW.payment_status = 'paid_in_full' THEN
    -- Idempotent check
    IF EXISTS (SELECT 1 FROM public.e3_commissions WHERE booking_id = NEW.id) THEN
      RETURN NEW;
    END IF;

    v_commission_amt := COALESCE(
      (NEW.financial_snapshot_json->>'commission_amount')::numeric,
      NEW.commission_amount
    );

    INSERT INTO public.e3_commissions (
      booking_id, coordinator_id,
      net_contribution, commission_percent, commission_amount,
      status
    ) VALUES (
      NEW.id, NEW.coordinator_id,
      COALESCE((NEW.financial_snapshot_json->>'net_contribution')::numeric, NEW.net_contribution),
      COALESCE(NEW.commission_snapshot_percent, NEW.commission_percentage),
      v_commission_amt,
      'pending'
    )
    RETURNING id INTO v_commission_id;

    -- Referral override level 1
    SELECT referred_by INTO v_referrer_id
    FROM public.e3_coordinators WHERE id = NEW.coordinator_id;

    IF v_referrer_id IS NOT NULL AND v_commission_amt > 0 THEN
      v_override_amt := v_commission_amt * 0.05;
      INSERT INTO public.e3_referral_overrides (
        commission_id, beneficiary_id, override_depth, override_percent, override_amount, status
      ) VALUES (
        v_commission_id, v_referrer_id, 1, 5.0, v_override_amt, 'pending'
      );

      -- Referral override level 2
      SELECT referred_by INTO v_referrer2_id
      FROM public.e3_coordinators WHERE id = v_referrer_id;

      IF v_referrer2_id IS NOT NULL THEN
        v_override_amt := v_commission_amt * 0.02;
        INSERT INTO public.e3_referral_overrides (
          commission_id, beneficiary_id, override_depth, override_percent, override_amount, status
        ) VALUES (
          v_commission_id, v_referrer2_id, 2, 2.0, v_override_amt, 'pending'
        );
      END IF;
    END IF;

    INSERT INTO public.e3_audit_log (entity_type, entity_id, action, after_state)
    VALUES ('commission', v_commission_id, 'commission_auto_created',
      jsonb_build_object(
        'booking_id', NEW.id, 'coordinator_id', NEW.coordinator_id,
        'amount', v_commission_amt, 'has_referral_overrides', v_referrer_id IS NOT NULL
      ));
  END IF;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_e3_auto_create_commission ON public.e3_bookings;
CREATE TRIGGER trg_e3_auto_create_commission
  AFTER UPDATE ON public.e3_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.e3_auto_create_commission();

-- 6️⃣ Monthly tier recalculation function
CREATE OR REPLACE FUNCTION public.e3_recalculate_tiers()
  RETURNS integer
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $fn$
DECLARE
  v_coord record;
  v_completed integer;
  v_tiers jsonb;
  v_tier jsonb;
  v_new_percent numeric;
  v_new_level text;
  v_count integer := 0;
BEGIN
  SELECT (value::jsonb)->'tiers' INTO v_tiers
  FROM public.e3_config WHERE key = 'tier_thresholds';

  FOR v_coord IN SELECT id FROM public.e3_coordinators WHERE is_active = true
  LOOP
    SELECT count(*) INTO v_completed
    FROM public.e3_bookings
    WHERE coordinator_id = v_coord.id
      AND booking_state = 'completed'
      AND date_trunc('month', event_date) = date_trunc('month', current_date);

    v_new_percent := 0.25;
    v_new_level := 'bronze';

    IF v_tiers IS NOT NULL THEN
      FOR v_tier IN SELECT * FROM jsonb_array_elements(v_tiers) ORDER BY (value->>'threshold')::int DESC
      LOOP
        IF v_completed >= (v_tier->>'threshold')::int THEN
          v_new_percent := (v_tier->>'percent')::numeric / 100.0;
          v_new_level := COALESCE(v_tier->>'name', 'tier_' || (v_tier->>'threshold'));
          EXIT;
        END IF;
      END LOOP;
    END IF;

    UPDATE public.e3_coordinators
    SET tier_level = v_new_level,
        tier_percent = v_new_percent,
        last_tier_calculated_at = now()
    WHERE id = v_coord.id
      AND (tier_level IS DISTINCT FROM v_new_level OR tier_percent IS DISTINCT FROM v_new_percent);

    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$fn$;

-- Schedule nightly tier recalculation
SELECT cron.schedule(
  'e3-nightly-tier-recalc',
  '0 3 * * *',
  $$SELECT public.e3_recalculate_tiers()$$
);

-- 7️⃣ Updated e3_update_booking with post-green immutability + admin override
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
  p_notes text DEFAULT NULL,
  p_override_reason text DEFAULT NULL
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $fn$
DECLARE
  v_booking record;
  v_coordinator_id uuid;
  v_is_admin boolean;
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

  v_is_admin := public.is_admin(auth.uid());
  v_coordinator_id := public.e3_get_coordinator_id(auth.uid());

  IF (v_coordinator_id IS NULL OR v_coordinator_id != v_booking.coordinator_id) AND NOT v_is_admin THEN
    RETURN jsonb_build_object('error', 'Not authorized');
  END IF;

  -- Post-green: coordinators fully locked
  IF v_booking.booking_state IN ('green_booked', 'completed') AND NOT v_is_admin THEN
    RETURN jsonb_build_object('error', 'Booking is locked after green. Contact admin for changes.');
  END IF;

  -- Post-green admin: require override_reason, block financial changes
  IF v_booking.booking_state IN ('green_booked', 'completed') AND v_is_admin THEN
    IF p_override_reason IS NULL OR trim(p_override_reason) = '' THEN
      RETURN jsonb_build_object('error', 'Admin override requires an override_reason');
    END IF;
    IF p_hall_ids IS NOT NULL OR p_time_block_id IS NOT NULL OR p_gross_revenue IS NOT NULL THEN
      RETURN jsonb_build_object('error', 'Financial fields (halls, time block, revenue) are locked after green_booked');
    END IF;

    UPDATE public.e3_bookings SET
      client_name = COALESCE(p_client_name, client_name),
      client_email = COALESCE(p_client_email, client_email),
      client_phone = COALESCE(p_client_phone, client_phone),
      event_type = COALESCE(p_event_type, event_type),
      guest_count = COALESCE(p_guest_count, guest_count),
      notes = COALESCE(p_notes, notes)
    WHERE id = p_booking_id;

    INSERT INTO public.e3_audit_log (entity_type, entity_id, action, user_id, after_state)
    VALUES ('booking', p_booking_id, 'admin_override_edit', auth.uid(),
      jsonb_build_object('override_reason', p_override_reason, 'state', v_booking.booking_state));

    RETURN jsonb_build_object('success', true, 'admin_override', true);
  END IF;

  -- Terminal states
  IF v_booking.booking_state NOT IN ('red_hold', 'yellow_contract') THEN
    RETURN jsonb_build_object('error', 'Booking is not editable in ' || v_booking.booking_state || ' state');
  END IF;

  -- Yellow: lock halls/time block
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

  SELECT start_time, end_time INTO v_tb_start, v_tb_end FROM public.e3_time_blocks WHERE id = v_effective_tb;
  v_hours := EXTRACT(EPOCH FROM (v_tb_end - v_tb_start)) / 3600.0;

  SELECT COALESCE(
    (SELECT base_cost_per_hour FROM public.e3_venues WHERE id = v_booking.venue_id),
    (public.e3_config_value('base_cost_per_hour'))::numeric
  ) INTO v_base_cost;

  SELECT COALESCE(SUM(v_hours * v_base_cost * allocation_percentage), 0)
  INTO v_building_overhead FROM public.e3_halls WHERE id = ANY(v_effective_halls);

  SELECT COALESCE(SUM(reset_buffer), 0) INTO v_reset_total FROM public.e3_halls WHERE id = ANY(v_effective_halls);

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
$fn$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_e3_commissions_coordinator ON public.e3_commissions(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_e3_commissions_status ON public.e3_commissions(status);
CREATE INDEX IF NOT EXISTS idx_e3_referral_overrides_commission ON public.e3_referral_overrides(commission_id);
CREATE INDEX IF NOT EXISTS idx_e3_referral_overrides_beneficiary ON public.e3_referral_overrides(beneficiary_id);
