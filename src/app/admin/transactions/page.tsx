import { Metadata } from "next"
import { getTransactions } from "@/actions/transaction-actions-clean"
import { TransactionTabs } from "@/components/transactions/transaction-tabs"

export const metadata: Metadata = {
  title: "Transactions | Admin Dashboard",
  description: "View and manage property transactions",
}

export const dynamic = 'force-dynamic'

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  // Fetch all transactions
  const { success, data: allTransactions, error } = await getTransactions()
  
  // Get status from URL if available
  const statusFilter = typeof searchParams?.status === 'string' ? searchParams.status : undefined
  
  // Filter transactions based on status if provided
  const transactions = success && allTransactions ? 
    (statusFilter ? allTransactions.filter(t => t.status === statusFilter) : allTransactions) : 
    []

  // Get count of transactions by status
  const pendingCount = allTransactions?.filter(t => t.status === 'pending').length || 0
  const approvedCount = allTransactions?.filter(t => t.status === 'approved').length || 0
  const rejectedCount = allTransactions?.filter(t => t.status === 'rejected').length || 0
  const allCount = allTransactions?.length || 0

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage property transactions
          </p>
        </div>
      </div>

      <TransactionTabs 
        transactions={transactions}
        pendingCount={pendingCount}
        approvedCount={approvedCount}
        rejectedCount={rejectedCount}
        allCount={allCount}
      />
    </div>
  )
}
