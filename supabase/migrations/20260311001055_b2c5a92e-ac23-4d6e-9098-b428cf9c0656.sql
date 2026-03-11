
-- Migrate existing data: map old statuses to new ones
UPDATE public.crm_leads SET status = 'contact_attempted' WHERE status = 'contacted';
UPDATE public.crm_leads SET status = 'warm_lead' WHERE status = 'qualified';
UPDATE public.crm_leads SET status = 'booked' WHERE status = 'won';

-- Set temperature based on status
UPDATE public.crm_leads SET temperature = 'hot' WHERE status IN ('hot_lead', 'deposit_pending', 'booked');
UPDATE public.crm_leads SET temperature = 'warm' WHERE status IN ('warm_lead', 'responded', 'proposal_sent', 'contract_sent');
