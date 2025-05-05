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

export default function DebugTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hardcoded values for Vercel deployment
  const SUPABASE_URL = 'https://drelzxbshewqkaznwhrn.supabase.co'
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyZWx6eGJzaGV3cWthem53aHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMTg0MjgsImV4cCI6MjA2MDc5NDQyOH0.NfbfbAS4x68A39znICZK4w4G7tIgAA3BxYZkrhnVRTQ'

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

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

      <SimpleCard className="mb-6">
        <SimpleCardHeader>
          <SimpleCardTitle>Database Transactions</SimpleCardTitle>
          <SimpleCardDescription>
            Direct query to the property_transactions table
          </SimpleCardDescription>
        </SimpleCardHeader>
        <SimpleCardContent>
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
        </SimpleCardContent>
        <SimpleCardFooter>
          <SimpleButton onClick={fetchTransactions} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh Transactions'}
          </SimpleButton>
        </SimpleCardFooter>
      </SimpleCard>

      <SimpleCard>
        <SimpleCardHeader>
          <SimpleCardTitle>Transaction Debugging Tips</SimpleCardTitle>
        </SimpleCardHeader>
        <SimpleCardContent>
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
        </SimpleCardContent>
      </SimpleCard>
    </div>
  )
}
