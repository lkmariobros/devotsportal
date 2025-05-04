-- Add version field to property_transactions table for optimistic concurrency control
ALTER TABLE IF EXISTS public.property_transactions 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Create index on version field for better performance
CREATE INDEX IF NOT EXISTS idx_property_transactions_version ON public.property_transactions(version);

-- Comment on version field
COMMENT ON COLUMN public.property_transactions.version IS 'Used for optimistic concurrency control to prevent race conditions during updates';
