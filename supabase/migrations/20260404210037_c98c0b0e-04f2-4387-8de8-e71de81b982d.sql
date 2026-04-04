
-- Owner dashboard KPIs (all 25+ tiles in one call)
CREATE OR REPLACE FUNCTION public.get_owner_dashboard_kpis(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_result jsonb;
  v_today date := current_date;
  v_week_start date := date_trunc('week', current_date)::date;
  v_month_start date := date_trunc('month', current_date)::date;
BEGIN
  -- Verify owner role
  IF NOT public.has_role(p_user_id, 'owner') THEN
    RETURN jsonb_build_object('error', 'Access denied');
  END IF;

  SELECT jsonb_build_object(
    'total_revenue_today', COALESCE((SELECT SUM(amount) FROM crm_revenue_events WHERE revenue_date::date = v_today), 0),
    'total_revenue_month', COALESCE((SELECT SUM(amount) FROM crm_revenue_events WHERE revenue_date::date >= v_month_start), 0),
    'stripe_payments_today', COALESCE((SELECT SUM(amount)::numeric / 100 FROM stripe_transactions WHERE status = 'succeeded' AND stripe_created_at::date = v_today AND (is_duplicate IS NULL OR is_duplicate = false)), 0),
    'outstanding_balances', COALESCE((SELECT SUM(balance_due) FROM bookings WHERE balance_due > 0 AND status NOT IN ('cancelled', 'completed')), 0),
    'revenue_by_unit', (
      SELECT jsonb_object_agg(bu, rev) FROM (
        SELECT business_unit as bu, COALESCE(SUM(amount), 0) as rev
        FROM crm_revenue_events WHERE revenue_date::date >= v_month_start
        GROUP BY business_unit
      ) sub
    ),
    'total_active_leads', (SELECT COUNT(*) FROM crm_leads WHERE status NOT IN ('won', 'lost')),
    'new_leads_week', (SELECT COUNT(*) FROM crm_leads WHERE created_at::date >= v_week_start),
    'leads_contacted_today', (SELECT COUNT(*) FROM crm_leads WHERE last_contacted_at::date = v_today),
    'overdue_follow_ups', (SELECT COUNT(*) FROM crm_leads WHERE follow_up_due < now() AND status NOT IN ('won', 'lost')),
    'hot_leads_no_contact', (SELECT COUNT(*) FROM crm_leads WHERE temperature = 'hot' AND last_contacted_at IS NULL AND status NOT IN ('won', 'lost')),
    'pipeline_conversion_rate', (
      SELECT CASE WHEN total > 0 THEN ROUND((won::numeric / total) * 100, 1) ELSE 0 END
      FROM (SELECT COUNT(*) FILTER (WHERE status = 'won') as won, COUNT(*) as total FROM crm_leads WHERE created_at::date >= v_month_start) sub
    ),
    'bookings_today', (SELECT COUNT(*) FROM bookings WHERE start_datetime::date = v_today AND status NOT IN ('cancelled')),
    'bookings_week', (SELECT COUNT(*) FROM bookings WHERE start_datetime::date >= v_week_start AND status NOT IN ('cancelled')),
    'pending_approvals', (SELECT COUNT(*) FROM bookings WHERE status = 'pending'),
    'active_memberships', (SELECT COUNT(*) FROM fitness_memberships WHERE status = 'active'),
    'commission_pending', COALESCE((SELECT SUM(amount) FROM crm_commissions WHERE status = 'pending'), 0),
    'commission_approved_unpaid', COALESCE((SELECT SUM(amount) FROM crm_commissions WHERE status = 'approved'), 0),
    'hive_occupancy_rate', (
      SELECT CASE WHEN total > 0 THEN ROUND((leased::numeric / total) * 100, 1) ELSE 0 END
      FROM (SELECT COUNT(*) FILTER (WHERE status = 'leased') as leased, COUNT(*) as total FROM hive_private_offices) sub
    ),
    'cost_per_lead', (
      SELECT CASE WHEN leads > 0 THEN ROUND(spend::numeric / leads, 2) ELSE 0 END
      FROM (
        SELECT COALESCE(SUM(spend), 0) as spend, GREATEST(COALESCE(SUM(leads), 0), 1) as leads
        FROM (
          SELECT spend, leads FROM facebook_ad_campaigns WHERE date::date >= v_month_start
          UNION ALL
          SELECT spend, leads FROM google_ad_campaigns WHERE date::date >= v_month_start
        ) combined
      ) sub
    )
  ) INTO v_result;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- Manager dashboard KPIs (Victoria)
CREATE OR REPLACE FUNCTION public.get_manager_dashboard_kpis(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_today date := current_date;
  v_week_start date := date_trunc('week', current_date)::date;
  v_month_start date := date_trunc('month', current_date)::date;
BEGIN
  IF NOT public.has_role(p_user_id, 'manager') AND NOT public.has_role(p_user_id, 'owner') THEN
    RETURN jsonb_build_object('error', 'Access denied');
  END IF;

  RETURN jsonb_build_object(
    'total_revenue_today', COALESCE((SELECT SUM(amount) FROM crm_revenue_events WHERE revenue_date::date = v_today), 0),
    'total_revenue_month', COALESCE((SELECT SUM(amount) FROM crm_revenue_events WHERE revenue_date::date >= v_month_start), 0),
    'active_leads', (SELECT COUNT(*) FROM crm_leads WHERE status NOT IN ('won', 'lost')),
    'overdue_follow_ups', (SELECT COUNT(*) FROM crm_leads WHERE follow_up_due < now() AND status NOT IN ('won', 'lost')),
    'bookings_today', (SELECT COUNT(*) FROM bookings WHERE start_datetime::date = v_today AND status NOT IN ('cancelled')),
    'bookings_week', (SELECT COUNT(*) FROM bookings WHERE start_datetime::date >= v_week_start AND status NOT IN ('cancelled')),
    'pending_approvals', (SELECT COUNT(*) FROM bookings WHERE status = 'pending'),
    'pipeline_conversion_rate', (
      SELECT CASE WHEN total > 0 THEN ROUND((won::numeric / total) * 100, 1) ELSE 0 END
      FROM (SELECT COUNT(*) FILTER (WHERE status = 'won') as won, COUNT(*) as total FROM crm_leads WHERE created_at::date >= v_month_start) sub
    ),
    'hot_leads_no_contact', (SELECT COUNT(*) FROM crm_leads WHERE temperature = 'hot' AND last_contacted_at IS NULL AND status NOT IN ('won', 'lost'))
  );
END;
$$;

-- Sales dashboard KPIs (Mark)
CREATE OR REPLACE FUNCTION public.get_sales_dashboard_kpis(p_user_id uuid, p_employee_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_emp_id uuid := COALESCE(p_employee_id, p_user_id);
  v_week_start date := date_trunc('week', current_date)::date;
  v_month_start date := date_trunc('month', current_date)::date;
BEGIN
  RETURN jsonb_build_object(
    'assigned_leads_count', (SELECT COUNT(*) FROM crm_leads WHERE assigned_employee_id = v_emp_id AND status NOT IN ('won', 'lost')),
    'pipeline_stage_breakdown', (
      SELECT COALESCE(jsonb_object_agg(status, cnt), '{}'::jsonb)
      FROM (SELECT status, COUNT(*) as cnt FROM crm_leads WHERE assigned_employee_id = v_emp_id AND status NOT IN ('won', 'lost') GROUP BY status) sub
    ),
    'overdue_follow_ups_assigned', (SELECT COUNT(*) FROM crm_leads WHERE assigned_employee_id = v_emp_id AND follow_up_due < now() AND status NOT IN ('won', 'lost')),
    'commission_pending_month', COALESCE((SELECT SUM(amount) FROM crm_commissions WHERE employee_id = v_emp_id AND status = 'pending' AND created_at::date >= v_month_start), 0),
    'commission_paid_month', COALESCE((SELECT SUM(amount) FROM crm_commissions WHERE employee_id = v_emp_id AND status = 'paid' AND paid_at::date >= v_month_start), 0),
    'new_leads_week_summit_mh', (SELECT COUNT(*) FROM crm_leads WHERE created_at::date >= v_week_start AND business_unit IN ('summit', 'mobile_homes'))
  );
END;
$$;

-- Spa dashboard KPIs (Nasiya)
CREATE OR REPLACE FUNCTION public.get_spa_dashboard_kpis(p_user_id uuid, p_employee_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_emp_id uuid := COALESCE(p_employee_id, p_user_id);
  v_today date := current_date;
  v_week_start date := date_trunc('week', current_date)::date;
BEGIN
  RETURN jsonb_build_object(
    'schedule_today', (SELECT COUNT(*) FROM bookings WHERE spa_worker_id IN (SELECT id FROM spa_workers WHERE user_id = v_emp_id) AND start_datetime::date = v_today AND status NOT IN ('cancelled')),
    'spa_bookings_today', (SELECT COUNT(*) FROM bookings b JOIN businesses bus ON b.business_id = bus.id WHERE bus.type = 'spa' AND b.start_datetime::date = v_today AND b.status NOT IN ('cancelled')),
    'spa_revenue_today', COALESCE((SELECT SUM(amount) FROM crm_revenue_events WHERE business_unit = 'spa' AND revenue_date::date = v_today), 0),
    'commission_pending', COALESCE((SELECT SUM(amount) FROM crm_commissions WHERE employee_id = v_emp_id AND status = 'pending'), 0),
    'spa_new_leads_week', (SELECT COUNT(*) FROM crm_leads WHERE business_unit = 'spa' AND created_at::date >= v_week_start)
  );
END;
$$;

-- Marketing dashboard KPIs (Elyse)
CREATE OR REPLACE FUNCTION public.get_marketing_dashboard_kpis(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_week_start date := date_trunc('week', current_date)::date;
  v_month_start date := date_trunc('month', current_date)::date;
BEGIN
  RETURN jsonb_build_object(
    'total_leads_week', (SELECT COUNT(*) FROM crm_leads WHERE created_at::date >= v_week_start),
    'leads_by_source', (
      SELECT COALESCE(jsonb_object_agg(COALESCE(source::text, 'unknown'), cnt), '{}'::jsonb)
      FROM (SELECT source, COUNT(*) as cnt FROM crm_leads WHERE created_at::date >= v_week_start GROUP BY source) sub
    ),
    'pipeline_conversion_rate', (
      SELECT CASE WHEN total > 0 THEN ROUND((won::numeric / total) * 100, 1) ELSE 0 END
      FROM (SELECT COUNT(*) FILTER (WHERE status = 'won') as won, COUNT(*) as total FROM crm_leads WHERE created_at::date >= v_month_start) sub
    ),
    'revenue_month_elevated_by_elyse', COALESCE((SELECT SUM(amount) FROM crm_revenue_events WHERE business_unit = 'elevated_by_elyse' AND revenue_date::date >= v_month_start), 0),
    'active_promotions_count', (SELECT COUNT(*) FROM promotions WHERE is_active = true),
    'pending_approvals', (SELECT COUNT(*) FROM bookings WHERE status = 'pending')
  );
END;
$$;

-- Ops dashboard KPIs (Rose)
CREATE OR REPLACE FUNCTION public.get_ops_dashboard_kpis(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_today date := current_date;
  v_week_start date := date_trunc('week', current_date)::date;
BEGIN
  RETURN jsonb_build_object(
    'overdue_follow_ups', (SELECT COUNT(*) FROM crm_leads WHERE follow_up_due < now() AND status NOT IN ('won', 'lost')),
    'bookings_today', (SELECT COUNT(*) FROM bookings WHERE start_datetime::date = v_today AND status NOT IN ('cancelled')),
    'bookings_week', (SELECT COUNT(*) FROM bookings WHERE start_datetime::date >= v_week_start AND status NOT IN ('cancelled')),
    'pending_approvals', (SELECT COUNT(*) FROM bookings WHERE status = 'pending'),
    'active_leads', (SELECT COUNT(*) FROM crm_leads WHERE status NOT IN ('won', 'lost')),
    'hot_leads_no_contact', (SELECT COUNT(*) FROM crm_leads WHERE temperature = 'hot' AND last_contacted_at IS NULL AND status NOT IN ('won', 'lost')),
    'schedule_gaps_week', 0
  );
END;
$$;

-- Ads dashboard KPIs (Kae)
CREATE OR REPLACE FUNCTION public.get_ads_dashboard_kpis(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_week_start date := date_trunc('week', current_date)::date;
  v_last_week_start date := (date_trunc('week', current_date) - interval '7 days')::date;
  v_month_start date := date_trunc('month', current_date)::date;
BEGIN
  RETURN jsonb_build_object(
    'new_leads_week_by_source', (
      SELECT COALESCE(jsonb_object_agg(COALESCE(source::text, 'unknown'), cnt), '{}'::jsonb)
      FROM (SELECT source, COUNT(*) as cnt FROM crm_leads WHERE created_at::date >= v_week_start GROUP BY source) sub
    ),
    'lead_volume_comparison', jsonb_build_object(
      'this_week', (SELECT COUNT(*) FROM crm_leads WHERE created_at::date >= v_week_start),
      'last_week', (SELECT COUNT(*) FROM crm_leads WHERE created_at::date >= v_last_week_start AND created_at::date < v_week_start)
    ),
    'active_promotions_count', (SELECT COUNT(*) FROM promotions WHERE is_active = true),
    'pipeline_conversion_top_of_funnel', (
      SELECT CASE WHEN total > 0 THEN ROUND((progressed::numeric / total) * 100, 1) ELSE 0 END
      FROM (
        SELECT COUNT(*) FILTER (WHERE status NOT IN ('new', 'lost')) as progressed, COUNT(*) as total
        FROM crm_leads WHERE created_at::date >= v_month_start
      ) sub
    ),
    'cost_per_lead', (
      SELECT CASE WHEN leads > 0 THEN ROUND(spend::numeric / leads, 2) ELSE 0 END
      FROM (
        SELECT COALESCE(SUM(spend), 0) as spend, GREATEST(COALESCE(SUM(leads), 0), 1) as leads
        FROM (
          SELECT spend, leads FROM facebook_ad_campaigns WHERE date::date >= v_month_start
          UNION ALL
          SELECT spend, leads FROM google_ad_campaigns WHERE date::date >= v_month_start
        ) combined
      ) sub
    )
  );
END;
$$;
