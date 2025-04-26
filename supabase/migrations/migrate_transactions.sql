-- Migrate data from old transactions table to property_transactions
-- First, create a temporary function to handle the migration
CREATE OR REPLACE FUNCTION migrate_transactions()
RETURNS void AS $$
DECLARE
    old_transaction RECORD;
    new_property_id UUID;
    new_transaction_type_id UUID;
BEGIN
    -- For each record in the old transactions table
    FOR old_transaction IN SELECT * FROM transactions LOOP
        -- Find or create property record
        INSERT INTO properties (address, city, state, zip, property_type)
        VALUES ('Unknown from migration', 'Unknown', 'Unknown', 'Unknown', old_transaction.property_type)
        RETURNING id INTO new_property_id;
        
        -- Find or create transaction type
        INSERT INTO transaction_types (name, description)
        VALUES (old_transaction.transaction_type, 'Migrated from old transactions table')
        RETURNING id INTO new_transaction_type_id;
        
        -- Create new property transaction record
        INSERT INTO property_transactions (
            transaction_type_id,
            property_id,
            transaction_date,
            transaction_value,
            status,
            agent_id,
            created_at,
            updated_at
        ) VALUES (
            new_transaction_type_id,
            new_property_id,
            CURRENT_DATE,
            old_transaction.amount,
            CASE 
                WHEN old_transaction.status = 'pending' THEN 'Pending'
                WHEN old_transaction.status = 'completed' THEN 'Completed'
                WHEN old_transaction.status = 'cancelled' THEN 'Cancelled'
                ELSE 'Draft'
            END,
            old_transaction.user_id,
            old_transaction.created_at,
            old_transaction.updated_at
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function
SELECT migrate_transactions();

-- Drop the function after use
DROP FUNCTION migrate_transactions();

-- After verifying the migration was successful, you can drop the old table
-- DROP TABLE transactions;