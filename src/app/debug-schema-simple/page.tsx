"use server"

import { createServerSupabaseClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

async function getTableSchema() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Direct SQL query to get table schema
    const { data, error } = await supabase.from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'property_transactions')
      .order('ordinal_position')
    
    if (error) {
      console.error('Error fetching schema:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Error in getTableSchema:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export default async function DebugSchemaSimplePage() {
  const result = await getTableSchema()
  
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Debug Schema (Simple)</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>property_transactions Table Schema</CardTitle>
          <CardDescription>
            Server-side retrieval of table schema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result.success ? (
            <div>
              {result.data && result.data.length > 0 ? (
                <div className="space-y-4">
                  <p>Found {result.data.length} columns in the property_transactions table.</p>
                  
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
                        {result.data.map((column, index) => (
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
              ) : (
                <p>No columns found in the schema.</p>
              )}
            </div>
          ) : (
            <div className="p-4 bg-red-50 text-red-800 rounded">
              <p>Error: {result.error}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Insert a test transaction:</strong>{' '}
              <a href="/debug-insert-simple" className="text-blue-600 hover:underline">
                Go to Debug Insert Simple
              </a>
            </li>
            <li>
              <strong>View all transactions:</strong>{' '}
              <a href="/debug-transactions-simple" className="text-blue-600 hover:underline">
                Go to Debug Transactions Simple
              </a>
            </li>
            <li>
              <strong>Try submitting a transaction through the form:</strong>{' '}
              <a href="/agent/transactions/new" className="text-blue-600 hover:underline">
                Go to Transaction Form
              </a>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
