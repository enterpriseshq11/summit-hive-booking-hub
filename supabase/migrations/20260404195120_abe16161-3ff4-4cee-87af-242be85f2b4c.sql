-- Add ghl_sync_in_progress flag to crm_leads
ALTER TABLE public.crm_leads
ADD COLUMN IF NOT EXISTS ghl_sync_in_progress boolean NOT NULL DEFAULT false;

-- Update ghl_pipeline_stage_webhooks to use internal enum values consistently
UPDATE public.ghl_pipeline_stage_webhooks SET stage_name = 'contract_sent' WHERE stage_name = 'contract_out';
UPDATE public.ghl_pipeline_stage_webhooks SET stage_name = 'deposit_pending' WHERE stage_name = 'deposit_received';
