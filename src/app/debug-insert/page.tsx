"use client"

import { useState } from "react"
import { createClient } from '@supabase/supabase-js'

// Simple UI components to avoid import issues
function SimpleButton({ children, onClick, disabled, className = '' }: {
  children: React.ReactNode,
  onClick?: () => void,
  disabled?: boolean,
  className?: string
}) {
  return <button onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 ${className}`}>{children}</button>;
}

function SimpleCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>;
}

function SimpleCardHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
}

function SimpleCardTitle({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
}

function SimpleCardDescription({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>;
}

function SimpleCardContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

function SimpleCardFooter({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>;
}

function SimpleTextarea({
  value,
  onChange,
  className = ''
}: {
  value?: string,
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
  className?: string
}) {
  return <textarea value={value} onChange={onChange} className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} />;
}

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

  // Hardcoded values for Vercel deployment
  const SUPABASE_URL = 'https://drelzxbshewqkaznwhrn.supabase.co'
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyZWx6eGJzaGV3cWthem53aHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMTg0MjgsImV4cCI6MjA2MDc5NDQyOH0.NfbfbAS4x68A39znICZK4w4G7tIgAA3BxYZkrhnVRTQ'

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

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

      <SimpleCard className="mb-6">
        <SimpleCardHeader>
          <SimpleCardTitle>Execute SQL Query</SimpleCardTitle>
          <SimpleCardDescription>
            Run a direct SQL query to insert a test transaction
          </SimpleCardDescription>
        </SimpleCardHeader>
        <SimpleCardContent>
          <div className="space-y-4">
            <SimpleTextarea
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
        </SimpleCardContent>
        <SimpleCardFooter>
          <SimpleButton onClick={executeQuery} disabled={isLoading}>
            {isLoading ? 'Executing...' : 'Execute Query'}
          </SimpleButton>
        </SimpleCardFooter>
      </SimpleCard>

      <SimpleCard>
        <SimpleCardHeader>
          <SimpleCardTitle>Create RPC Function</SimpleCardTitle>
          <SimpleCardDescription>
            Run this SQL in your Supabase SQL Editor to create a helper function
          </SimpleCardDescription>
        </SimpleCardHeader>
        <SimpleCardContent>
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
        </SimpleCardContent>
      </SimpleCard>
    </div>
  )
}
