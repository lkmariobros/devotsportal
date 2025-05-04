"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { checkTransactionsTable, insertTestTransaction } from "@/utils/create-database"

export default function SetupDatabasePage() {
  const [isCreating, setIsCreating] = useState(false)
  const [createResult, setCreateResult] = useState<any>(null)
  const [isInserting, setIsInserting] = useState(false)
  const [insertResult, setInsertResult] = useState<any>(null)

  const handleCheckTable = async () => {
    setIsCreating(true)
    try {
      const result = await checkTransactionsTable()
      setCreateResult(result)
    } catch (error) {
      setCreateResult({ success: false, error: String(error) })
    } finally {
      setIsCreating(false)
    }
  }

  const handleInsertTest = async () => {
    setIsInserting(true)
    try {
      const result = await insertTestTransaction()
      setInsertResult(result)
    } catch (error) {
      setInsertResult({ success: false, error: String(error) })
    } finally {
      setIsInserting(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Database Setup</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Check Transactions Table</CardTitle>
            <CardDescription>
              Check if the property_transactions table exists in the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This will check if the transactions table exists and is accessible. If the table doesn't exist, you'll need to create it in the Supabase dashboard.
            </p>

            {createResult && (
              <div className={`mt-4 p-4 rounded ${createResult.success && createResult.tableExists ? 'bg-green-50' : 'bg-yellow-50'}`}>
                {createResult.success && createResult.tableExists ? (
                  <p className="text-green-800">Table exists and is accessible!</p>
                ) : (
                  <div>
                    <p className="text-yellow-800 font-medium">Table doesn't exist or isn't accessible</p>
                    <p className="text-yellow-800 mt-2">{createResult.error}</p>
                    <div className="mt-4 p-4 bg-gray-100 rounded">
                      <p className="font-medium mb-2">To create the table:</p>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Go to the <a href="https://supabase.com/dashboard" target="_blank" className="text-blue-600 hover:underline">Supabase Dashboard</a></li>
                        <li>Select your project</li>
                        <li>Go to the SQL Editor</li>
                        <li>Create a new query with this SQL:</li>
                      </ol>
                      <pre className="mt-2 bg-white p-2 rounded text-xs overflow-auto max-h-40">
{`CREATE TABLE IF NOT EXISTS property_transactions (
  id UUID PRIMARY KEY,
  market_type TEXT,
  transaction_type_id TEXT,
  property_address TEXT,
  primary_client_name TEXT,
  transaction_value NUMERIC,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);`}
                      </pre>
                    </div>
                  </div>
                )}
                {createResult.data && createResult.data.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium">Sample data:</p>
                    <pre className="mt-2 bg-white p-2 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(createResult.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleCheckTable} disabled={isCreating}>
              {isCreating ? 'Checking...' : 'Check Table'}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insert Test Transaction</CardTitle>
            <CardDescription>
              Insert a test transaction into the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This will insert a test transaction with sample data. Use this to verify that the table is working correctly.
            </p>

            {insertResult && (
              <div className={`mt-4 p-4 rounded ${insertResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={insertResult.success ? 'text-green-800' : 'text-red-800'}>
                  {insertResult.success ? 'Test transaction inserted successfully!' : `Error: ${insertResult.error}`}
                </p>
                {insertResult.data && (
                  <pre className="mt-2 bg-white p-2 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(insertResult.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleInsertTest} disabled={isInserting}>
              {isInserting ? 'Inserting...' : 'Insert Test Transaction'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Check if the transactions table exists using the button above</li>
              <li>If the table doesn't exist, create it using the SQL provided</li>
              <li>Insert a test transaction to verify the table works</li>
              <li>View the <a href="/debug/transactions" className="text-blue-600 hover:underline">debug transactions page</a> to see all transactions</li>
              <li>Try submitting a new transaction through the <a href="/agent/transactions/new" className="text-blue-600 hover:underline">transaction form</a></li>
              <li>View the transactions in the <a href="/agent/transactions" className="text-blue-600 hover:underline">agent portal</a> and <a href="/admin-dashboard/transactions" className="text-blue-600 hover:underline">admin portal</a></li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
