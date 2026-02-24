
-- ============================================================
-- PHASE 4: PAYOUT RPCs WITH SERVER-SIDE GUARDRAILS
-- ============================================================

-- Approve commission (admin only)
CREATE OR REPLACE FUNCTION public.e3_approve_commission(p_commission_id uuid)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $fn$
DECLARE
  v_comm record;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Admin access required');
  END IF;

  SELECT * INTO v_comm FROM public.e3_commissions WHERE id = p_commission_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Commission not found'); END IF;

  IF v_comm.status != 'pending' THEN
    RETURN jsonb_build_object('error', 'Commission must be in pending status');
  END IF;

  UPDATE public.e3_commissions
  SET status = 'approved', approved_at = now(), approved_by = auth.uid()
  WHERE id = p_commission_id;

  INSERT INTO public.e3_audit_log (entity_type, entity_id, action, user_id, before_state, after_state)
  VALUES ('commission', p_commission_id, 'commission_approved', auth.uid(),
    jsonb_build_object('status', 'pending'),
    jsonb_build_object('status', 'approved'));

  RETURN jsonb_build_object('success', true);
END;
$fn$;

-- Mark commission paid (admin only)
CREATE OR REPLACE FUNCTION public.e3_pay_commission(p_commission_id uuid)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $fn$
DECLARE
  v_comm record;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Admin access required');
  END IF;

  SELECT * INTO v_comm FROM public.e3_commissions WHERE id = p_commission_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Commission not found'); END IF;

  IF v_comm.status != 'approved' THEN
    RETURN jsonb_build_object('error', 'Commission must be approved before marking paid');
  END IF;

  UPDATE public.e3_commissions
  SET status = 'paid', paid_at = now()
  WHERE id = p_commission_id;

  -- Also mark eligible referral overrides as paid
  UPDATE public.e3_referral_overrides
  SET status = 'paid'
  WHERE commission_id = p_commission_id AND status = 'approved';

  INSERT INTO public.e3_audit_log (entity_type, entity_id, action, user_id, before_state, after_state)
  VALUES ('commission', p_commission_id, 'commission_paid', auth.uid(),
    jsonb_build_object('status', 'approved'),
    jsonb_build_object('status', 'paid'));

  RETURN jsonb_build_object('success', true);
END;
$fn$;

-- Approve referral override (admin only, base commission must be approved+)
CREATE OR REPLACE FUNCTION public.e3_approve_override(p_override_id uuid)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $fn$
DECLARE
  v_override record;
  v_base_status text;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Admin access required');
  END IF;

  SELECT * INTO v_override FROM public.e3_referral_overrides WHERE id = p_override_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Override not found'); END IF;

  IF v_override.status != 'pending' THEN
    RETURN jsonb_build_object('error', 'Override must be in pending status');
  END IF;

  SELECT status INTO v_base_status FROM public.e3_commissions WHERE id = v_override.commission_id;
  IF v_base_status NOT IN ('approved', 'paid') THEN
    RETURN jsonb_build_object('error', 'Base commission must be approved before override can be approved');
  END IF;

  UPDATE public.e3_referral_overrides SET status = 'approved' WHERE id = p_override_id;

  INSERT INTO public.e3_audit_log (entity_type, entity_id, action, user_id, after_state)
  VALUES ('referral_override', p_override_id, 'override_approved', auth.uid(),
    jsonb_build_object('commission_id', v_override.commission_id, 'status', 'approved'));

  RETURN jsonb_build_object('success', true);
END;
$fn$;

-- Bulk approve commissions
CREATE OR REPLACE FUNCTION public.e3_bulk_approve_commissions(p_commission_ids uuid[])
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $fn$
DECLARE
  v_id uuid;
  v_count integer := 0;
  v_result jsonb;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Admin access required');
  END IF;

  FOREACH v_id IN ARRAY p_commission_ids LOOP
    v_result := public.e3_approve_commission(v_id);
    IF (v_result->>'success')::boolean THEN
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('approved_count', v_count);
END;
$fn$;

-- Bulk pay commissions
CREATE OR REPLACE FUNCTION public.e3_bulk_pay_commissions(p_commission_ids uuid[])
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $fn$
DECLARE
  v_id uuid;
  v_count integer := 0;
  v_result jsonb;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Admin access required');
  END IF;

  FOREACH v_id IN ARRAY p_commission_ids LOOP
    v_result := public.e3_pay_commission(v_id);
    IF (v_result->>'success')::boolean THEN
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('paid_count', v_count);
END;
$fn$;
