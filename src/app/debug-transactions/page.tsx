"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function DebugTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()
  
  const fetchTransactions = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Direct SQL query to get all transactions
      const { data, error } = await supabase
        .from('property_transactions')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      setTransactions(data || [])
    } catch (err: any) {
      console.error('Error fetching transactions:', err)
      setError(err.message || 'Failed to fetch transactions')
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    fetchTransactions()
  }, [])
  
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Debug Transactions</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Database Transactions</CardTitle>
          <CardDescription>
            Direct query to the property_transactions table
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading transactions...</p>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-800 rounded">
              <p>Error: {error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <p>No transactions found in the database.</p>
          ) : (
            <div className="space-y-4">
              <p>Found {transactions.length} transactions in the database.</p>
              
              <div className="overflow-auto max-h-96">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left">ID</th>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Address</th>
                      <th className="p-2 text-left">Client</th>
                      <th className="p-2 text-left">Value</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b">
                        <td className="p-2 font-mono text-xs">{tx.id}</td>
                        <td className="p-2">{new Date(tx.created_at).toLocaleString()}</td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={fetchTransactions} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh Transactions'}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction Debugging Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Common Issues:</h3>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Transactions are submitted but not visible in the UI</li>
                <li>UUID type errors when submitting transactions</li>
                <li>Missing required fields in the database</li>
                <li>Permissions issues with Supabase RLS policies</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium">Troubleshooting Steps:</h3>
              <ol className="list-decimal pl-5 space-y-1 mt-2">
                <li>Check if transactions exist in the database (shown above)</li>
                <li>Verify that the transaction_type_id is a valid UUID</li>
                <li>Ensure all required fields are present in the submission</li>
                <li>Check browser console for JavaScript errors</li>
                <li>Verify Supabase RLS policies allow reading transactions</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
