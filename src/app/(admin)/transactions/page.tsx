"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination"
import { ChevronDown, Filter, MoreHorizontal, Search } from "lucide-react"
import { trpc } from "@/utils/trpc/client"
import { formatCurrency, formatDate } from "@/lib/utils"
import { TransactionDetails } from "@/components/transactions/transaction-details"
import { toast } from "sonner"

interface Transaction {
  id: string
  property: {
    address: string
  }
  agent: {
    name: string
  }
  amount: number
  createdAt: string
  status: string
}

export default function TransactionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Pagination state
  const page = Number(searchParams.get("page") || "1")
  const limit = Number(searchParams.get("limit") || "10")

  // Filter state
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    search: searchParams.get("search") || "",
    dateRange: searchParams.get("dateRange") || "all"
  })

  // Selected transactions for batch operations
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null)

  // Helper function to convert dateRange to startDate/endDate
  function getDateRangeValues(dateRange: string) {
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))

    switch (dateRange) {
      case 'today':
        return { startDate: startOfDay.toISOString() }
      case 'thisWeek': {
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        return { startDate: startOfWeek.toISOString() }
      }
      case 'thisMonth': {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        return { startDate: startOfMonth.toISOString() }
      }
      case 'lastMonth': {
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
        return {
          startDate: startOfLastMonth.toISOString(),
          endDate: endOfLastMonth.toISOString()
        }
      }
      case 'last3Months': {
        const startOfLast3Months = new Date(today.getFullYear(), today.getMonth() - 3, 1)
        return { startDate: startOfLast3Months.toISOString() }
      }
      default:
        return {}
    }
  }

  // Query with proper parameters
  const { data, isLoading, refetch } = trpc.transactions.getAllTransactions.useQuery({
    offset: (page - 1) * limit,
    limit,
    status: filters.status || undefined,
    search: filters.search || undefined,
    ...(filters.dateRange && filters.dateRange !== 'all' ? getDateRangeValues(filters.dateRange) : {})
  })

  // Use the new batch approval mutation
  const batchApproveMutation = trpc.transactions.batchApproveTransactions.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully approved ${data.success_count} transactions`)
      if (data.failure_count > 0) {
        toast.error(`Failed to approve ${data.failure_count} transactions`)
      }
      setSelectedTransactions([])
      refetch()
    },
    onError: (error) => {
      toast.error(`Error in batch approval: ${error.message}`)
    }
  })

  // Individual approval/rejection mutations for single transactions
  const approveTransactionMutation = trpc.transactions.approveTransaction.useMutation({
    onSuccess: () => {
      refetch()
    }
  })

  const rejectTransactionMutation = trpc.transactions.rejectTransaction.useMutation({
    onSuccess: () => {
      refetch()
    }
  })

  // Handle batch approval with improved error handling
  const handleBatchApprove = async () => {
    if (selectedTransactions.length === 0) return

    // Show confirmation dialog for large batches
    if (selectedTransactions.length > 10) {
      const confirmed = window.confirm(
        `You are about to approve ${selectedTransactions.length} transactions. This operation cannot be undone. Continue?`
      )
      if (!confirmed) return
    }

    // Use the batch approval endpoint
    await batchApproveMutation.mutateAsync({
      ids: selectedTransactions,
      notes: 'Batch approved'
    })
  }

  // For now, handle batch rejection sequentially
  // In the future, we could implement a batch rejection endpoint
  const handleBatchReject = async () => {
    if (selectedTransactions.length === 0) return

    // Show confirmation dialog
    const confirmed = window.confirm(
      `You are about to reject ${selectedTransactions.length} transactions. This operation cannot be undone. Continue?`
    )
    if (!confirmed) return

    // Track progress
    let completed = 0
    let failed = 0

    // Process in chunks of 5 for better UX
    const chunkSize = 5
    for (let i = 0; i < selectedTransactions.length; i += chunkSize) {
      const chunk = selectedTransactions.slice(i, i + chunkSize)

      // Process chunk in parallel
      const results = await Promise.allSettled(
        chunk.map(id =>
          rejectTransactionMutation.mutateAsync({ id, notes: 'Batch rejected' })
        )
      )

      // Count successes and failures
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          completed++
        } else {
          failed++
        }
      })

      // Update progress toast
      toast.success(`Processed ${completed + failed} of ${selectedTransactions.length} transactions`)
    }

    // Show final results
    toast.success(`Successfully rejected ${completed} transactions`)
    if (failed > 0) {
      toast.error(`Failed to reject ${failed} transactions`)
    }

    // Clear selection and refresh
    setSelectedTransactions([])
    refetch()
  }

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(data?.transactions.map((t: Transaction) => t.id) || [])
    } else {
      setSelectedTransactions([])
    }
  }

  // Handle individual selection
  const handleSelectTransaction = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedTransactions(prev => [...prev, id])
    } else {
      setSelectedTransactions(prev => prev.filter(t => t !== id))
    }
  }

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams()
    params.set("page", "1")
    params.set("limit", limit.toString())

    if (filters.status) params.set("status", filters.status)
    if (filters.search) params.set("search", filters.search)
    if (filters.dateRange) params.set("dateRange", filters.dateRange)

    router.push(`/admin/transactions?${params.toString()}`)
  }

  // Status colors for badges
  const statusColors: Record<string, string> = {
    "Pending": "bg-yellow-100 text-yellow-800",
    "Approved": "bg-green-100 text-green-800",
    "Rejected": "bg-red-100 text-red-800",
    "Completed": "bg-blue-100 text-blue-800"
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction Management</h1>
          <p className="text-muted-foreground">Manage and process property transactions</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={handleBatchApprove}
            disabled={selectedTransactions.length === 0 || batchApproveMutation.isPending}
          >
            Approve Selected ({selectedTransactions.length})
          </Button>
          <Button
            variant="outline"
            onClick={handleBatchReject}
            disabled={selectedTransactions.length === 0 || batchRejectMutation.isPending}
          >
            Reject Selected
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Transactions</CardTitle>
          <CardDescription>View and manage all property transactions</CardDescription>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                className="pl-8"
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && applyFilters()}
              />
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Filter className="h-3.5 w-3.5" />
                    <span>Filter</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <div className="grid gap-4 p-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select
                        value={filters.status}
                        onValueChange={value => setFilters(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All statuses</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date Range</label>
                      <Select
                        value={filters.dateRange}
                        onValueChange={value => setFilters(prev => ({ ...prev, dateRange: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="thisWeek">This week</SelectItem>
                          <SelectItem value="thisMonth">This month</SelectItem>
                          <SelectItem value="lastMonth">Last month</SelectItem>
                          <SelectItem value="last3Months">Last 3 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button className="w-full" onClick={applyFilters}>
                      Apply Filters
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedTransactions.length > 0 && selectedTransactions.length === data?.transactions.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Loading transactions...
                    </TableCell>
                  </TableRow>
                ) : data?.transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.transactions.map((transaction: Transaction) => (
                    <>
                      <TableRow key={transaction.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <Checkbox
                            checked={selectedTransactions.includes(transaction.id)}
                            onCheckedChange={checked => handleSelectTransaction(transaction.id, !!checked)}
                            onClick={e => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell
                          className="font-medium"
                          onClick={() => setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)}
                        >
                          {transaction.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell onClick={() => setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)}>
                          {transaction.property.address}
                        </TableCell>
                        <TableCell onClick={() => setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)}>
                          {transaction.agent.name}
                        </TableCell>
                        <TableCell onClick={() => setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)}>
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell onClick={() => setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)}>
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                        <TableCell onClick={() => setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)}>
                          <Badge className={statusColors[transaction.status] || ""}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/admin/transactions/${transaction.id}`)}>
                                View Details
                              </DropdownMenuItem>
                              {transaction.status === "Pending" && (
                                <>
                                  <DropdownMenuItem onClick={() => batchApproveMutation.mutate({ id: transaction.id })}>
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => batchRejectMutation.mutate({ id: transaction.id })}>
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      {expandedTransaction === transaction.id && (
                        <TableRow>
                          <TableCell colSpan={8} className="p-0">
                            <TransactionDetails transaction={transaction} />
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {data?.transactions.length || 0} of {data?.total || 0} transactions
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationLink
                  href={`/admin/transactions?page=${Math.max(1, page - 1)}&limit=${limit}`}
                  isDisabled={page <= 1}
                >
                  Previous
                </PaginationLink>
              </PaginationItem>

              {Array.from({ length: Math.min(5, Math.ceil((data?.total || 0) / limit)) }, (_, i) => {
                const pageNumber = i + 1
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href={`/admin/transactions?page=${pageNumber}&limit=${limit}`}
                      isActive={pageNumber === page}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              <PaginationItem>
                <PaginationLink
                  href={`/admin/transactions?page=${page + 1}&limit=${limit}`}
                  isDisabled={!data || page >= Math.ceil(data.total / limit)}
                >
                  Next
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </div>
  )
}