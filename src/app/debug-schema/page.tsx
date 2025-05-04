"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function DebugSchemaPage() {
  const [columns, setColumns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()
  
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
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>property_transactions Table Schema</CardTitle>
          <CardDescription>
            Direct query to the information_schema
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
        <CardFooter>
          <Button onClick={fetchSchema} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh Schema'}
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
        </CardContent>
      </Card>
    </div>
  )
}
