"use server"

import { createServerSupabaseClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

async function getTransactionTypes() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get all transaction types
    const { data, error } = await supabase
      .from('transaction_types')
      .select('*')
    
    if (error) {
      console.error('Error fetching transaction types:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Error in getTransactionTypes:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export default async function DebugTransactionTypesPage() {
  const result = await getTransactionTypes()
  
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Debug Transaction Types</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>All Transaction Types</CardTitle>
          <CardDescription>
            These are the valid transaction types in your database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result.success ? (
            <div>
              {result.data && result.data.length > 0 ? (
                <div className="space-y-4">
                  <p>Found {result.data.length} transaction types in the database.</p>
                  
                  <div className="overflow-auto max-h-96">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left">ID</th>
                          <th className="p-2 text-left">Name</th>
                          <th className="p-2 text-left">Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.data.map((type) => (
                          <tr key={type.id} className="border-b">
                            <td className="p-2 font-mono text-xs">{type.id}</td>
                            <td className="p-2">{type.name}</td>
                            <td className="p-2">{type.created_at ? new Date(type.created_at).toLocaleString() : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded">
                  <p>No transaction types found in the database.</p>
                  <p className="mt-2">
                    You need to create transaction types before you can submit transactions.
                    Run this SQL in your Supabase SQL Editor:
                  </p>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
{`-- Insert transaction types
INSERT INTO transaction_types (id, name, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Sale', NOW(), NOW()),
  (gen_random_uuid(), 'Rental', NOW(), NOW());`}
                  </pre>
                </div>
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
              <strong>Make sure you have transaction types in your database</strong>
            </li>
            <li>
              <strong>Try the simple transaction form:</strong>{' '}
              <a href="/simple-transaction-form" className="text-blue-600 hover:underline">
                Go to Simple Transaction Form
              </a>
            </li>
            <li>
              <strong>Check the transactions:</strong>{' '}
              <a href="/debug-transactions-simple" className="text-blue-600 hover:underline">
                Go to Debug Transactions
              </a>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
