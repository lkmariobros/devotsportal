-- Add new fields to property_transactions table

-- Market type fields
ALTER TABLE property_transactions 
ADD COLUMN IF NOT EXISTS market_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS market_subcategory VARCHAR(50),
ADD COLUMN IF NOT EXISTS developer_id UUID,
ADD COLUMN IF NOT EXISTS project_id UUID;

-- Primary client fields
ALTER TABLE property_transactions 
ADD COLUMN IF NOT EXISTS primary_client_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS primary_client_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS primary_client_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS primary_client_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS primary_is_company BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS primary_company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS primary_client_notes TEXT;

-- Secondary client fields
ALTER TABLE property_transactions 
ADD COLUMN IF NOT EXISTS include_secondary_party BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS secondary_client_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS secondary_client_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS secondary_client_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS secondary_client_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS secondary_is_company BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS secondary_company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS secondary_client_notes TEXT;

-- Add status field if it doesn't exist
ALTER TABLE property_transactions 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

-- Add audit fields if they don't exist
ALTER TABLE property_transactions 
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS updated_by UUID,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_transactions_market_type ON property_transactions(market_type);
CREATE INDEX IF NOT EXISTS idx_property_transactions_status ON property_transactions(status);
CREATE INDEX IF NOT EXISTS idx_property_transactions_created_by ON property_transactions(created_by);
