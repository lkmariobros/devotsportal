import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getTransactions } from "@/utils/transaction-service-new"
import { TransactionList } from "@/components/transactions/transaction-list"
import { RiAddLine } from "@remixicon/react"

export const dynamic = 'force-dynamic'

export default async function AdminTransactionsPage(props: {
  searchParams?: { status?: string; page?: string; search?: string }
}) {
  const searchParams = props.searchParams || {}
  // Get query parameters
  const status = searchParams?.status ? String(searchParams.status) : undefined
  const page = searchParams?.page ? parseInt(String(searchParams.page)) : 1
  const search = searchParams?.search ? String(searchParams.search) : undefined
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
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Transactions
        </h1>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/admin/transactions/new">
              <RiAddLine className="mr-2 h-4 w-4" />
              Add Transaction
            </Link>
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground">View and manage property transactions</p>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList transactions={transactions} isAdmin={true} />
        </CardContent>
      </Card>
    </div>
  )
}
