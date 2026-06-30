ALTER TABLE public.assigned_tasks 
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS reference_id UUID;
