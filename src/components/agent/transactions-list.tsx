"use client"

import Link from "next/link"
import { trpc } from "@/utils/trpc/client"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RiEyeLine } from "@remixicon/react"
import { Skeleton } from "@/components/ui/skeleton"

interface TransactionsListProps {
  agentId?: string
  limit?: number
}

export function TransactionsList({ agentId, limit = 5 }: TransactionsListProps) {
  const { data, isLoading } = trpc.transactions.getAllTransactions.useQuery({
    agentId,
    limit,
    offset: 0
  })
  
  if (isLoading) {
    return <TransactionsListSkeleton />
  }
  
  const transactions = data?.transactions || []
  
  if (transactions.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No transactions found
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div 
          key={transaction.id} 
          className="flex items-center justify-between p-4 border rounded-md"
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {transaction.properties?.address || 'Unknown Property'}
              </p>
              {getStatusBadge(transaction.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDate(transaction.transaction_date)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <p className="font-medium">
              {formatCurrency(transaction.commission_amount || 0)}
            </p>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/agent/transactions/${transaction.id}`}>
                <RiEyeLine className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Link>
            </Button>
          </div>
        </div>
      ))}
      
      <div className="text-center pt-2">
        <Button variant="link" asChild>
          <Link href="/agent-layout/transactions">View all transactions</Link>
        </Button>
      </div>
    </div>
  )
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'Approved':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
    case 'Rejected':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
    case 'Pending':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function TransactionsListSkeleton() {
  return (
    <div className="space-y-4">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  )
}