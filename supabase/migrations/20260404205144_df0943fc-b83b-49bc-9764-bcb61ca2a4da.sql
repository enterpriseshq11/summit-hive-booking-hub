
-- Edge function error monitoring table
CREATE TABLE public.edge_function_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  payload JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID
);

ALTER TABLE public.edge_function_errors ENABLE ROW LEVEL SECURITY;

-- Owner-only access
CREATE POLICY "Owner can view all errors"
  ON public.edge_function_errors FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Owner can update errors"
  ON public.edge_function_errors FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Edge functions insert without auth context
CREATE POLICY "Service role can insert errors"
  ON public.edge_function_errors FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX idx_edge_function_errors_unresolved ON public.edge_function_errors (resolved, occurred_at DESC);

-- User onboarding tracking table
CREATE TABLE public.user_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  role_at_completion TEXT
);

ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding"
  ON public.user_onboarding FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding"
  ON public.user_onboarding FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
