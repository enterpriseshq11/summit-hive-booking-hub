-- Add deleted_at and deleted_by columns for soft delete
ALTER TABLE public.spa_workers 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Update existing queries to exclude deleted workers
COMMENT ON COLUMN public.spa_workers.deleted_at IS 'Soft delete timestamp - when set, worker is considered deleted';