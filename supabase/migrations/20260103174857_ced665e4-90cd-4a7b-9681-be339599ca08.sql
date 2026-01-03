-- Add payroll event types to the crm_activity_type enum
ALTER TYPE public.crm_activity_type ADD VALUE IF NOT EXISTS 'payroll_created';
ALTER TYPE public.crm_activity_type ADD VALUE IF NOT EXISTS 'payroll_locked';
ALTER TYPE public.crm_activity_type ADD VALUE IF NOT EXISTS 'payroll_approved';
ALTER TYPE public.crm_activity_type ADD VALUE IF NOT EXISTS 'payroll_paid';