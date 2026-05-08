CREATE OR REPLACE FUNCTION public.get_owner_dashboard_kpis(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_today date := current_date;
  v_week_start date := date_trunc('week', current_date)::date;
  v_month_start date := date_trunc('month', current_date)::date;
BEGIN
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
    'active_memberships', (SELECT COUNT(*) FROM memberships WHERE status = 'active'),
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