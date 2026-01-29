-- Add onboarding_complete column to track if worker has set up availability
ALTER TABLE public.spa_workers 
ADD COLUMN onboarding_complete boolean NOT NULL DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.spa_workers.onboarding_complete IS 'True when worker has completed initial availability setup after accepting invite.';