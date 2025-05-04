"use server"

import { createServerSupabaseClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

async function insertTestTransaction() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a UUID for the transaction
    const id = crypto.randomUUID()
    
    // Insert directly with the exact schema structure
    const { data, error } = await supabase
      .from('property_transactions')
      .insert([
        {
          id,
          // Required fields
          transaction_date: new Date().toISOString().split('T')[0],
          
          // Optional fields
          market_type: 'secondary',
          market_subcategory: 'residential',
          property_address: '123 Debug Street (Server)',
          primary_client_name: 'Debug Client (Server)',
          transaction_value: 500000,
          status: 'pending',
          
          // Metadata
          created_at: new Date(),
          updated_at: new Date()
        }
      ])
      .select()
    
    if (error) {
      console.error('Error inserting test transaction:', error)
      return { success: false, error: error.message }
    }
    
    // Revalidate the transaction pages
    revalidatePath('/agent/transactions')
    revalidatePath('/admin-dashboard/transactions')
    
    return { success: true, data }
  } catch (error) {
    console.error('Error in insertTestTransaction:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export default async function DebugInsertSimplePage() {
  const result = await insertTestTransaction()
  
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Debug Insert Transaction (Simple)</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Insert Test Transaction</CardTitle>
          <CardDescription>
            Server-side insertion of a test transaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result.success ? (
            <div className="p-4 bg-green-50 text-green-800 rounded">
              <p>Transaction inserted successfully!</p>
              <pre className="mt-2 bg-white p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="p-4 bg-red-50 text-red-800 rounded">
              <p>Error: {result.error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <form action={async () => {
            'use server'
            await insertTestTransaction()
            revalidatePath('/debug-insert-simple')
          }}>
            <Button type="submit">Insert Another Test Transaction</Button>
          </form>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Check the agent transactions page:</strong>{' '}
              <a href="/agent/transactions" className="text-blue-600 hover:underline">
                Go to Agent Transactions
              </a>
            </li>
            <li>
              <strong>Check the admin transactions page:</strong>{' '}
              <a href="/admin-dashboard/transactions" className="text-blue-600 hover:underline">
                Go to Admin Transactions
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
