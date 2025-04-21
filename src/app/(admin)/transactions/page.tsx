import { Suspense } from "react"
import { TransactionsList } from "@/components/transactions/transactions-list"
import { TransactionsHeader } from "@/components/transactions/transactions-header"
import { TransactionsFilters } from "@/components/transactions/transactions-filters"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <TransactionsHeader />
      
      <Card className="p-6">
        <TransactionsFilters />
        
        <Suspense fallback={<TransactionsListSkeleton />}>
          <TransactionsList />
        </Suspense>
      </Card>
    </div>
  )
}

function TransactionsListSkeleton() {
  return (
    <div className="space-y-4 mt-6">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  )
}