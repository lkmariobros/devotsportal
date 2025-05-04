export default function SqlHelperPage() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">SQL Helper</h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add Missing Column</h2>
          <p className="mb-4">
            Run this SQL in your Supabase SQL Editor to add the missing property_address column:
          </p>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
{`-- Add the missing property_address column if it doesn't exist
ALTER TABLE property_transactions
ADD COLUMN IF NOT EXISTS property_address TEXT;`}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Direct Insert SQL</h2>
          <p className="mb-4">
            Alternatively, you can run this SQL to directly insert a test transaction:
          </p>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 text-sm">
{`-- Insert a test transaction directly
INSERT INTO property_transactions (
  id,
  transaction_date,
  market_type,
  market_subcategory,
  property_address,
  primary_client_name,
  transaction_value,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  CURRENT_DATE,
  'secondary',
  'residential',
  '123 Test Street',
  'Test Client',
  500000,
  'pending',
  NOW(),
  NOW()
);

-- Note: We're not including transaction_type_id because it's a UUID column
-- and we don't have a valid UUID to insert. If you need to include it,
-- you would need to use a valid UUID like this:
-- transaction_type_id: gen_random_uuid(),`}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Verify Table Structure</h2>
          <p className="mb-4">
            Run this SQL to verify the structure of your property_transactions table:
          </p>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 text-sm">
{`-- Check the table structure
SELECT
  column_name,
  data_type,
  is_nullable
FROM
  information_schema.columns
WHERE
  table_name = 'property_transactions'
ORDER BY
  ordinal_position;`}
          </pre>
        </div>
      </div>
    </div>
  )
}
