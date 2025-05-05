import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { getTransactions } from "@/actions/transaction-actions-clean"
import { TransactionList } from "@/components/transactions/transaction-list"
import { createServerSupabaseClient } from "@/utils/supabase/server"

export const dynamic = 'force-dynamic'

export default async function TransactionsPage({
  searchParams = {}
}: {
  searchParams?: { status?: string; page?: string; search?: string }
}) {
  // Get the current user
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get query parameters
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined
  const limit = 10
  const offset = (page - 1) * limit

  // Fetch transactions for the current user
  const result = await getTransactions({
    agentId: user?.id,
    status,
    limit,
    offset,
    search
  })

  // Get transactions from the result
  const transactions = result.success ? result.data : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Transactions
        </h1>
        <Link href="/agent-layout/transactions/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  )
}