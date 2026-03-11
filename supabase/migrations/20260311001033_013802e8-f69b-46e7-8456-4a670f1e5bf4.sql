
-- Add new crm_lead_status values
ALTER TYPE public.crm_lead_status ADD VALUE IF NOT EXISTS 'contact_attempted';
ALTER TYPE public.crm_lead_status ADD VALUE IF NOT EXISTS 'responded';
ALTER TYPE public.crm_lead_status ADD VALUE IF NOT EXISTS 'warm_lead';
ALTER TYPE public.crm_lead_status ADD VALUE IF NOT EXISTS 'hot_lead';
ALTER TYPE public.crm_lead_status ADD VALUE IF NOT EXISTS 'contract_sent';
ALTER TYPE public.crm_lead_status ADD VALUE IF NOT EXISTS 'deposit_pending';
ALTER TYPE public.crm_lead_status ADD VALUE IF NOT EXISTS 'booked';
ALTER TYPE public.crm_lead_status ADD VALUE IF NOT EXISTS 'follow_up_needed';
ALTER TYPE public.crm_lead_status ADD VALUE IF NOT EXISTS 'no_response';

-- Add temperature column to crm_leads
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS temperature text DEFAULT 'cold' CHECK (temperature IN ('cold', 'warm', 'hot'));
