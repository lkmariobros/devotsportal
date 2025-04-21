"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { trpc } from "@/utils/trpc/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { RiEyeLine } from "@remixicon/react"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RealTimeTransactionsList } from "./real-time-transactions-list"

export function TransactionsList() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const limit = 10
  
  const status = searchParams.get("status") || undefined
  const agentId = searchParams.get("agentId") || undefined
  const search = searchParams.get("search") || undefined
  const startDate = searchParams.get("startDate") || undefined
  const endDate = searchParams.get("endDate") || undefined
  
  const { data, isLoading } = trpc.transactions.getAllTransactions.useQuery({
    status,
    agentId,
    search,
    startDate,
    endDate,
    limit,
    offset: (page - 1) * limit
  })
  
  const transactions = data?.transactions || []
  const totalCount = data?.total || 0
  const pageCount = Math.ceil(totalCount / limit)
  
  function getStatusBadge(status: string) {
    switch (status) {
      case "Pending":
        return <Badge variant="outline">Pending</Badge>
      case "Approved":
        return <Badge variant="default">Approved</Badge>
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }
  
  if (isLoading) {
    return <TransactionsListSkeleton />
  }
  
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="table" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                  <TableCell>
                    {transaction.properties?.address}, {transaction.properties?.city}
                  </TableCell>
                  <TableCell>
                    {transaction.profiles?.first_name} {transaction.profiles?.last_name}
                  </TableCell>
                  <TableCell>{formatCurrency(transaction.transaction_value)}</TableCell>
                  <TableCell>{formatCurrency(transaction.commission_amount)}</TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/transactions/${transaction.id}`}>
                        <RiEyeLine className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {pageCount > 1 && (
            <div className="flex justify-center mt-6">
              <CustomPagination 
                page={page}
                count={pageCount}
                onPageChange={setPage}
              />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="cards">
          <RealTimeTransactionsList initialTransactions={transactions} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Custom pagination component to fix the TypeScript error
function CustomPagination({ 
  page, 
  count, 
  onPageChange 
}: { 
  page: number; 
  count: number; 
  onPageChange: (page: number) => void 
}) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => page > 1 && onPageChange(page - 1)}
            className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
        
        {Array.from({ length: Math.min(5, count) }, (_, i) => {
          const pageNumber = i + 1
          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink 
                isActive={page === pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className="cursor-pointer"
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          )
        })}
        
        {count > 5 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        
        {count > 5 && (
          <PaginationItem>
            <PaginationLink 
              onClick={() => onPageChange(count)}
              isActive={page === count}
              className="cursor-pointer"
            >
              {count}
            </PaginationLink>
          </PaginationItem>
        )}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => page < count && onPageChange(page + 1)}
            className={page >= count ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

function TransactionsListSkeleton() {
  return (
    <div className="space-y-4">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  )
}