"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Textarea } from "@/components/ui/textarea"

export default function DebugInsertPage() {
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sqlQuery, setSqlQuery] = useState(`-- Insert a test transaction directly
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
  '123 Debug Street',
  'Debug Client',
  500000,
  'pending',
  NOW(),
  NOW()
) RETURNING *;`)
  
  const supabase = createClientComponentClient()
  
  const executeQuery = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)
    
    try {
      // Execute the SQL query directly
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_query: sqlQuery
      })
      
      if (error) {
        throw error
      }
      
      setResult(data)
    } catch (err: any) {
      console.error('Error executing query:', err)
      setError(err.message || 'Failed to execute query')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Debug Insert Transaction</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Execute SQL Query</CardTitle>
          <CardDescription>
            Run a direct SQL query to insert a test transaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="font-mono text-sm h-64"
            />
            
            {error && (
              <div className="p-4 bg-red-50 text-red-800 rounded">
                <p>Error: {error}</p>
              </div>
            )}
            
            {result && (
              <div className="p-4 bg-green-50 text-green-800 rounded">
                <p>Query executed successfully!</p>
                <pre className="mt-2 bg-white p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={executeQuery} disabled={isLoading}>
            {isLoading ? 'Executing...' : 'Execute Query'}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Create RPC Function</CardTitle>
          <CardDescription>
            Run this SQL in your Supabase SQL Editor to create a helper function
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-gray-100 rounded text-xs overflow-auto">
{`-- Create a function to execute SQL queries
-- WARNING: This is potentially dangerous in production!
-- Only use this for debugging purposes in development
CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE sql_query INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'SQL Error: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
