import { createServerSupabaseClient } from "@/utils/supabase/server"
import { NODE_ENV, SUPABASE_URL } from "../../env-config.js"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DebugTransactionsPage() {
  // Get the Supabase client
  const supabase = createServerSupabaseClient()

  // Fetch all transactions directly
  const { data: transactions, error } = await supabase
    .from('property_transactions')
    .select('*')
    .order('created_at', { ascending: false })

  // Get the database schema
  const { data: schema, error: schemaError } = await supabase
    .from('property_transactions')
    .select('*')
    .limit(0)

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Debug: Transactions</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Environment</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
          {JSON.stringify({
            NODE_ENV: NODE_ENV,
            SUPABASE_URL: SUPABASE_URL.substring(0, 20) + '...',
          }, null, 2)}
        </pre>
      </div>

      {schemaError && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Schema Error</h2>
          <pre className="bg-red-50 p-4 rounded overflow-auto max-h-40">
            {JSON.stringify(schemaError, null, 2)}
          </pre>
        </div>
      )}

      {schema && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Table Schema</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
            {JSON.stringify(schema, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
          <pre className="bg-red-50 p-4 rounded overflow-auto max-h-40">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Transactions ({transactions?.length || 0})
        </h2>
        {transactions && transactions.length > 0 ? (
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(transactions, null, 2)}
          </pre>
        ) : (
          <div className="bg-yellow-50 p-4 rounded">
            <p className="text-yellow-800">No transactions found in the database.</p>
          </div>
        )}
      </div>
    </div>
  )
}
