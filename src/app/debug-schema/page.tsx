"use client"

import { useState, useEffect } from "react"
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

export default function DebugSchemaPage() {
  const [columns, setColumns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hardcoded values for Vercel deployment
  const SUPABASE_URL = 'https://drelzxbshewqkaznwhrn.supabase.co'
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyZWx6eGJzaGV3cWthem53aHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMTg0MjgsImV4cCI6MjA2MDc5NDQyOH0.NfbfbAS4x68A39znICZK4w4G7tIgAA3BxYZkrhnVRTQ'

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const fetchSchema = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Direct SQL query to get table schema
      const { data, error } = await supabase.rpc('get_table_schema', {
        table_name: 'property_transactions'
      })

      if (error) {
        throw error
      }

      setColumns(data || [])
    } catch (err: any) {
      console.error('Error fetching schema:', err)
      setError(err.message || 'Failed to fetch schema')

      // Fallback to a direct query if RPC fails
      try {
        const { data, error } = await supabase.from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_name', 'property_transactions')
          .order('ordinal_position')

        if (error) throw error
        setColumns(data || [])
      } catch (fallbackErr: any) {
        console.error('Fallback query failed:', fallbackErr)
        setError((err.message || 'Failed to fetch schema') + ' (Fallback also failed)')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSchema()
  }, [])

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Debug Database Schema</h1>

      <SimpleCard className="mb-6">
        <SimpleCardHeader>
          <SimpleCardTitle>property_transactions Table Schema</SimpleCardTitle>
          <SimpleCardDescription>
            Direct query to the information_schema
          </SimpleCardDescription>
        </SimpleCardHeader>
        <SimpleCardContent>
          {isLoading ? (
            <p>Loading schema...</p>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-800 rounded">
              <p>Error: {error}</p>
              <p className="mt-2 text-sm">
                Try running this SQL in the Supabase SQL Editor:
              </p>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {`SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'property_transactions'
ORDER BY ordinal_position;`}
              </pre>
            </div>
          ) : columns.length === 0 ? (
            <p>No columns found in the schema.</p>
          ) : (
            <div className="space-y-4">
              <p>Found {columns.length} columns in the property_transactions table.</p>

              <div className="overflow-auto max-h-96">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left">Column Name</th>
                      <th className="p-2 text-left">Data Type</th>
                      <th className="p-2 text-left">Nullable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {columns.map((column, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-mono">{column.column_name}</td>
                        <td className="p-2">{column.data_type}</td>
                        <td className="p-2">{column.is_nullable === 'YES' ? '✓' : '✗'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </SimpleCardContent>
        <SimpleCardFooter>
          <SimpleButton onClick={fetchSchema} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh Schema'}
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
{`-- Create a function to get table schema
CREATE OR REPLACE FUNCTION get_table_schema(table_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    columns.column_name::text,
    columns.data_type::text,
    columns.is_nullable::text
  FROM
    information_schema.columns
  WHERE
    columns.table_name = get_table_schema.table_name
  ORDER BY
    ordinal_position;
END;
$$ LANGUAGE plpgsql;`}
          </pre>
        </SimpleCardContent>
      </SimpleCard>
    </div>
  )
}
