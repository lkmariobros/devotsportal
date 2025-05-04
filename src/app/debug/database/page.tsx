import { createServerSupabaseClient } from "@/utils/supabase/server"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DebugDatabasePage() {
  // Get the Supabase client
  const supabase = createServerSupabaseClient()
  
  // Check if the property_transactions table exists
  const { data: tableExists, error: tableError } = await supabase
    .from('property_transactions')
    .select('*')
    .limit(1)
    .catch(() => ({ data: null, error: { message: 'Table does not exist' } }))
  
  // Get all tables in the database
  const { data: tables, error: tablesError } = await supabase
    .rpc('get_tables')
    .catch(() => ({ data: null, error: { message: 'Could not get tables' } }))
  
  // Create the table if it doesn't exist
  let createResult = null
  let createError = null
  
  if (!tableExists) {
    try {
      // Execute SQL to create the table
      const { data, error } = await supabase.rpc('create_transactions_table')
      createResult = data
      createError = error
    } catch (err) {
      createError = err
    }
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Debug: Database</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Database Tables</h2>
        {tablesError ? (
          <div className="bg-red-50 p-4 rounded">
            <p className="text-red-800">Error getting tables: {tablesError.message}</p>
          </div>
        ) : (
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
            {JSON.stringify(tables, null, 2)}
          </pre>
        )}
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Property Transactions Table</h2>
        {tableError ? (
          <div className="bg-yellow-50 p-4 rounded">
            <p className="text-yellow-800">Table check error: {tableError.message}</p>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">Create Table Result:</h3>
              {createError ? (
                <div className="bg-red-50 p-4 rounded">
                  <p className="text-red-800">Error creating table: {createError.message || JSON.stringify(createError)}</p>
                </div>
              ) : (
                <pre className="bg-green-50 p-4 rounded">
                  {createResult ? JSON.stringify(createResult, null, 2) : 'No result'}
                </pre>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-green-50 p-4 rounded">
            <p className="text-green-800">Table exists!</p>
            <pre className="mt-2 bg-gray-100 p-4 rounded overflow-auto max-h-40">
              {JSON.stringify(tableExists, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Manual SQL Commands</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p className="font-mono text-sm mb-2">-- Create the property_transactions table:</p>
          <pre className="bg-white p-2 rounded overflow-auto text-xs">
{`CREATE TABLE IF NOT EXISTS property_transactions (
  id UUID PRIMARY KEY,
  market_type TEXT,
  transaction_type_id TEXT,
  property_address TEXT,
  primary_client_name TEXT,
  transaction_value NUMERIC,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);`}
          </pre>
          
          <p className="font-mono text-sm mt-4 mb-2">-- Insert a test transaction:</p>
          <pre className="bg-white p-2 rounded overflow-auto text-xs">
{`INSERT INTO property_transactions (
  id, market_type, transaction_type_id, property_address, 
  primary_client_name, transaction_value, status, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'secondary', 'sale', '123 Test Street',
  'Test Client', 500000, 'pending', NOW(), NOW()
);`}
          </pre>
        </div>
      </div>
    </div>
  )
}
