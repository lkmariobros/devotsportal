"use server"

import { createServerSupabaseClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

async function getTransactions() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get all transactions
    const { data, error, count } = await supabase
      .from('property_transactions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching transactions:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, data, count }
  } catch (error) {
    console.error('Error in getTransactions:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export default async function AgentTransactionsFixedPage() {
  const result = await getTransactions()
  
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agent Transactions (Fixed)</h1>
        <Button asChild>
          <Link href="/simple-transaction-form">
            New Transaction
          </Link>
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            View and manage your transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result.success ? (
            <div>
              {result.data && result.data.length > 0 ? (
                <div className="space-y-4">
                  <p>Found {result.count} transactions in the database.</p>
                  
                  <div className="overflow-auto max-h-96">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left">Date</th>
                          <th className="p-2 text-left">Address</th>
                          <th className="p-2 text-left">Client</th>
                          <th className="p-2 text-left">Value</th>
                          <th className="p-2 text-left">Status</th>
                          <th className="p-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.data.map((tx) => (
                          <tr key={tx.id} className="border-b">
                            <td className="p-2">{new Date(tx.created_at).toLocaleDateString()}</td>
                            <td className="p-2">{tx.property_address || 'N/A'}</td>
                            <td className="p-2">{tx.primary_client_name || 'N/A'}</td>
                            <td className="p-2">
                              {tx.transaction_value 
                                ? new Intl.NumberFormat('en-MY', {
                                    style: 'currency',
                                    currency: 'MYR'
                                  }).format(tx.transaction_value)
                                : 'N/A'
                              }
                            </td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                tx.status === 'approved' ? 'bg-green-100 text-green-800' :
                                tx.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100'
                              }`}>
                                {tx.status || 'Unknown'}
                              </span>
                            </td>
                            <td className="p-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/agent/transactions/${tx.id}`}>
                                  View
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p>No transactions found in the database.</p>
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
          <CardTitle>Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li>
              <Link href="/simple-transaction-form" className="text-blue-600 hover:underline">
                Submit a New Transaction
              </Link>
            </li>
            <li>
              <Link href="/debug-transactions-simple" className="text-blue-600 hover:underline">
                View Debug Transactions
              </Link>
            </li>
            <li>
              <Link href="/agent-layout/transactions" className="text-blue-600 hover:underline">
                Go to Original Agent Transactions
              </Link>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
