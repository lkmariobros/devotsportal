import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTransactions } from "@/utils/transaction-service-new"
import { TransactionList } from "@/components/transactions/transaction-list"
import { RiFilterLine } from "@remixicon/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

  // Get count of transactions by status
  const pendingCount = transactions.filter(t => t.status === 'pending').length
  const approvedCount = transactions.filter(t => t.status === 'approved').length
  const rejectedCount = transactions.filter(t => t.status === 'rejected').length
  const allCount = transactions.length

  // Determine which tab to show based on status parameter
  const activeTab = status || 'all'

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Transactions
        </h1>
        <div className="flex items-center space-x-2">
          <RiFilterLine className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <p className="text-muted-foreground">View and manage property transactions</p>

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all" asChild>
            <a href="/admin/transactions">All ({allCount})</a>
          </TabsTrigger>
          <TabsTrigger value="pending" asChild>
            <a href="/admin/transactions?status=pending">Pending ({pendingCount})</a>
          </TabsTrigger>
          <TabsTrigger value="approved" asChild>
            <a href="/admin/transactions?status=approved">Approved ({approvedCount})</a>
          </TabsTrigger>
          <TabsTrigger value="rejected" asChild>
            <a href="/admin/transactions?status=rejected">Rejected ({rejectedCount})</a>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>
                {activeTab === 'all' && 'All Transactions'}
                {activeTab === 'pending' && 'Pending Transactions'}
                {activeTab === 'approved' && 'Approved Transactions'}
                {activeTab === 'rejected' && 'Rejected Transactions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionList transactions={transactions} isAdmin={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
