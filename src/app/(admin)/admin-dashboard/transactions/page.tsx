import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getTransactions } from "@/utils/transaction-service-new"
import { TransactionList } from "@/components/transactions/transaction-list"

export const dynamic = 'force-dynamic'

export default async function AdminTransactionsPage({
  searchParams = {}
}: {
  searchParams?: { status?: string; page?: string; search?: string }
}) {
  // Get query parameters
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined
  const limit = 10
  const offset = (page - 1) * limit

  // Fetch all transactions (no agentId filter for admin)
  const result = await getTransactions({
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
          All Transactions
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Management</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList transactions={transactions} isAdmin={true} />
        </CardContent>
      </Card>
    </div>
  )
}
