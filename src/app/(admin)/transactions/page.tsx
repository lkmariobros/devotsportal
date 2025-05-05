"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown, Filter, MoreHorizontal, Search } from "lucide-react"
import { trpc } from "@/utils/trpc/client"
import { TransactionDetails } from "@/components/transactions/transaction-details"

// Simple toast implementation
const toast = {
  success: (message: string) => console.log('SUCCESS:', message),
  error: (message: string) => console.error('ERROR:', message)
}

// Inline utils functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(amount);
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

// Simple UI components to avoid import issues
function SimpleButton({
  children,
  variant = 'default',
  size = 'default',
  onClick,
  disabled = false,
  className = ''
}: {
  children: React.ReactNode,
  variant?: 'default' | 'outline' | 'ghost' | 'icon',
  size?: 'default' | 'sm' | 'lg' | 'icon',
  onClick?: () => void,
  disabled?: boolean,
  className?: string
}) {
  const sizeClasses =
    size === 'sm' ? 'h-9 px-3 text-xs' :
    size === 'icon' ? 'h-10 w-10' :
    'px-4 py-2';

  const variantClasses =
    variant === 'outline' ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' :
    variant === 'ghost' ? 'hover:bg-accent hover:text-accent-foreground' :
    variant === 'icon' ? 'h-10 w-10 rounded-full' :
    'bg-primary text-primary-foreground hover:bg-primary/90';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${sizeClasses} ${variantClasses} ${className}`}
    >
      {children}
    </button>
  );
}

function SimpleCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>;
}

function SimpleCardHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
}

function SimpleCardTitle({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
}

function SimpleCardDescription({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>;
}

function SimpleCardContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

function SimpleCardFooter({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>;
}

function SimpleCheckbox({
  checked = false,
  onCheckedChange,
  onClick,
  className = ''
}: {
  checked?: boolean,
  onCheckedChange?: (checked: boolean) => void,
  onClick?: (e: React.MouseEvent) => void,
  className?: string
}) {
  return (
    <div
      onClick={(e) => {
        if (onClick) onClick(e);
        if (onCheckedChange) onCheckedChange(!checked);
      }}
      className={`h-4 w-4 rounded-sm border border-primary flex items-center justify-center ${checked ? 'bg-primary text-primary-foreground' : 'bg-background'} ${className}`}
    >
      {checked && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-white">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
    </div>
  );
}

function SimpleDropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="relative">{children}</div>;
}

function SimpleDropdownMenuTrigger({ children, asChild, onClick }: { children: React.ReactNode, asChild?: boolean, onClick?: (e: React.MouseEvent) => void }) {
  return <div onClick={onClick}>{children}</div>;
}

function SimpleDropdownMenuContent({ children, align = 'center', className = '' }: { children: React.ReactNode, align?: 'center' | 'start' | 'end', className?: string }) {
  return <div className={`z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${align === 'end' ? 'right-0' : align === 'start' ? 'left-0' : ''} ${className}`}>{children}</div>;
}

function SimpleDropdownMenuItem({ children, onClick, className = '' }: { children: React.ReactNode, onClick?: () => void, className?: string }) {
  return <button onClick={onClick} className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground ${className}`}>{children}</button>;
}

function SimpleInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  onKeyDown,
  className = ''
}: {
  type?: string,
  placeholder?: string,
  value?: string,
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void,
  className?: string
}) {
  return <input type={type} placeholder={placeholder} value={value} onChange={onChange} onKeyDown={onKeyDown} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} />;
}

function SimpleSelect({ children, value, onValueChange }: { children: React.ReactNode, value?: string, onValueChange?: (value: string) => void }) {
  return <div className="relative">{children}</div>;
}

function SimpleSelectTrigger({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <button className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>{children}</button>;
}

function SimpleSelectValue({ placeholder }: { placeholder: string }) {
  return <span className="text-muted-foreground">{placeholder}</span>;
}

function SimpleSelectContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md ${className}`}>{children}</div>;
}

function SimpleSelectItem({ children, value, className = '' }: { children: React.ReactNode, value: string, className?: string }) {
  return <div className={`relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${className}`}>{children}</div>;
}

function SimpleTable({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`w-full overflow-auto ${className}`}><table className="w-full caption-bottom text-sm">{children}</table></div>;
}

function SimpleTableHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <thead className={`[&_tr]:border-b ${className}`}>{children}</thead>;
}

function SimpleTableBody({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <tbody className={`[&_tr:last-child]:border-0 ${className}`}>{children}</tbody>;
}

function SimpleTableRow({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}>{children}</tr>;
}

function SimpleTableHead({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</th>;
}

function SimpleTableCell({ children, colSpan, className = '' }: {
  children: React.ReactNode,
  colSpan?: number,
  className?: string
}) {
  return <td colSpan={colSpan} className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</td>;
}

function SimpleBadge({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>{children}</span>;
}

function SimplePagination({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <nav className={`mx-auto flex w-full justify-center ${className}`}>{children}</nav>;
}

function SimplePaginationContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`flex flex-row items-center gap-1 ${className}`}>{children}</div>;
}

function SimplePaginationItem({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={className}>{children}</div>;
}

function SimplePaginationLink({
  children,
  href,
  isActive,
  isDisabled,
  className = ''
}: {
  children: React.ReactNode,
  href?: string,
  isActive?: boolean,
  isDisabled?: boolean,
  className?: string
}) {
  return <a href={href} className={`h-9 min-w-9 items-center justify-center rounded-md border border-input bg-background p-0 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${isActive ? 'bg-accent text-accent-foreground' : ''} ${isDisabled ? 'pointer-events-none opacity-50' : ''} ${className}`}>{children}</a>;
}

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

function TransactionsContent() {
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
          <SimpleButton
            variant="default"
            onClick={handleBatchApprove}
            disabled={selectedTransactions.length === 0 || batchApproveMutation.isPending}
          >
            Approve Selected ({selectedTransactions.length})
          </SimpleButton>
          <SimpleButton
            variant="outline"
            onClick={handleBatchReject}
            disabled={selectedTransactions.length === 0}
          >
            Reject Selected
          </SimpleButton>
        </div>
      </div>

      <SimpleCard>
        <SimpleCardHeader className="pb-4">
          <SimpleCardTitle>Transactions</SimpleCardTitle>
          <SimpleCardDescription>View and manage all property transactions</SimpleCardDescription>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <SimpleInput
                type="search"
                placeholder="Search transactions..."
                className="pl-8"
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && applyFilters()}
              />
            </div>

            <div className="flex items-center gap-2">
              <SimpleDropdownMenu>
                <SimpleDropdownMenuTrigger asChild>
                  <SimpleButton variant="outline" size="sm" className="h-8 gap-1">
                    <Filter className="h-3.5 w-3.5" />
                    <span>Filter</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </SimpleButton>
                </SimpleDropdownMenuTrigger>
                <SimpleDropdownMenuContent align="end" className="w-[200px]">
                  <div className="grid gap-4 p-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <SimpleSelect
                        value={filters.status}
                        onValueChange={value => setFilters(prev => ({ ...prev, status: value }))}
                      >
                        <SimpleSelectTrigger>
                          <SimpleSelectValue placeholder="All statuses" />
                        </SimpleSelectTrigger>
                        <SimpleSelectContent>
                          <SimpleSelectItem value="">All statuses</SimpleSelectItem>
                          <SimpleSelectItem value="Pending">Pending</SimpleSelectItem>
                          <SimpleSelectItem value="Approved">Approved</SimpleSelectItem>
                          <SimpleSelectItem value="Rejected">Rejected</SimpleSelectItem>
                          <SimpleSelectItem value="Completed">Completed</SimpleSelectItem>
                        </SimpleSelectContent>
                      </SimpleSelect>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date Range</label>
                      <SimpleSelect
                        value={filters.dateRange}
                        onValueChange={value => setFilters(prev => ({ ...prev, dateRange: value }))}
                      >
                        <SimpleSelectTrigger>
                          <SimpleSelectValue placeholder="All time" />
                        </SimpleSelectTrigger>
                        <SimpleSelectContent>
                          <SimpleSelectItem value="all">All time</SimpleSelectItem>
                          <SimpleSelectItem value="today">Today</SimpleSelectItem>
                          <SimpleSelectItem value="thisWeek">This week</SimpleSelectItem>
                          <SimpleSelectItem value="thisMonth">This month</SimpleSelectItem>
                          <SimpleSelectItem value="lastMonth">Last month</SimpleSelectItem>
                          <SimpleSelectItem value="last3Months">Last 3 months</SimpleSelectItem>
                        </SimpleSelectContent>
                      </SimpleSelect>
                    </div>

                    <SimpleButton className="w-full" onClick={applyFilters}>
                      Apply Filters
                    </SimpleButton>
                  </div>
                </SimpleDropdownMenuContent>
              </SimpleDropdownMenu>
            </div>
          </div>
        </SimpleCardHeader>

        <SimpleCardContent>
          <div className="rounded-md border">
            <SimpleTable>
              <SimpleTableHeader>
                <SimpleTableRow>
                  <SimpleTableHead className="w-[50px]">
                    <SimpleCheckbox
                      checked={selectedTransactions.length > 0 && selectedTransactions.length === data?.transactions.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </SimpleTableHead>
                  <SimpleTableHead>Transaction ID</SimpleTableHead>
                  <SimpleTableHead>Property</SimpleTableHead>
                  <SimpleTableHead>Agent</SimpleTableHead>
                  <SimpleTableHead>Amount</SimpleTableHead>
                  <SimpleTableHead>Date</SimpleTableHead>
                  <SimpleTableHead>Status</SimpleTableHead>
                  <SimpleTableHead className="text-right">Actions</SimpleTableHead>
                </SimpleTableRow>
              </SimpleTableHeader>
              <SimpleTableBody>
                {isLoading ? (
                  <SimpleTableRow>
                    <SimpleTableCell colSpan={8} className="h-24 text-center">
                      Loading transactions...
                    </SimpleTableCell>
                  </SimpleTableRow>
                ) : data?.transactions.length === 0 ? (
                  <SimpleTableRow>
                    <SimpleTableCell colSpan={8} className="h-24 text-center">
                      No transactions found.
                    </SimpleTableCell>
                  </SimpleTableRow>
                ) : (
                  data?.transactions.map((transaction: Transaction) => (
                    <>
                      <SimpleTableRow key={transaction.id} className="cursor-pointer hover:bg-muted/50">
                        <SimpleTableCell>
                          <SimpleCheckbox
                            checked={selectedTransactions.includes(transaction.id)}
                            onCheckedChange={checked => handleSelectTransaction(transaction.id, !!checked)}
                            onClick={e => e.stopPropagation()}
                          />
                        </SimpleTableCell>
                        <SimpleTableCell
                          className="font-medium"
                          onClick={() => setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)}
                        >
                          {transaction.id.slice(0, 8)}...
                        </SimpleTableCell>
                        <SimpleTableCell onClick={() => setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)}>
                          {transaction.property.address}
                        </SimpleTableCell>
                        <SimpleTableCell onClick={() => setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)}>
                          {transaction.agent.name}
                        </SimpleTableCell>
                        <SimpleTableCell onClick={() => setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)}>
                          {formatCurrency(transaction.amount)}
                        </SimpleTableCell>
                        <SimpleTableCell onClick={() => setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)}>
                          {formatDate(transaction.createdAt)}
                        </SimpleTableCell>
                        <SimpleTableCell onClick={() => setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)}>
                          <SimpleBadge className={statusColors[transaction.status] || ""}>
                            {transaction.status}
                          </SimpleBadge>
                        </SimpleTableCell>
                        <SimpleTableCell className="text-right">
                          <SimpleDropdownMenu>
                            <SimpleDropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                              <SimpleButton variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </SimpleButton>
                            </SimpleDropdownMenuTrigger>
                            <SimpleDropdownMenuContent align="end">
                              <SimpleDropdownMenuItem onClick={() => router.push(`/admin/transactions/${transaction.id}`)}>
                                View Details
                              </SimpleDropdownMenuItem>
                              {transaction.status === "Pending" && (
                                <>
                                  <SimpleDropdownMenuItem onClick={() => approveTransactionMutation.mutate({ id: transaction.id })}>
                                    Approve
                                  </SimpleDropdownMenuItem>
                                  <SimpleDropdownMenuItem onClick={() => rejectTransactionMutation.mutate({ id: transaction.id })}>
                                    Reject
                                  </SimpleDropdownMenuItem>
                                </>
                              )}
                            </SimpleDropdownMenuContent>
                          </SimpleDropdownMenu>
                        </SimpleTableCell>
                      </SimpleTableRow>
                      {expandedTransaction === transaction.id && (
                        <SimpleTableRow>
                          <SimpleTableCell colSpan={8} className="p-0">
                            <TransactionDetails transaction={transaction} />
                          </SimpleTableCell>
                        </SimpleTableRow>
                      )}
                    </>
                  ))
                )}
              </SimpleTableBody>
            </SimpleTable>
          </div>
        </SimpleCardContent>

        <SimpleCardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {data?.transactions.length || 0} of {data?.total || 0} transactions
          </div>

          <SimplePagination>
            <SimplePaginationContent>
              <SimplePaginationItem>
                <SimplePaginationLink
                  href={`/admin/transactions?page=${Math.max(1, page - 1)}&limit=${limit}`}
                  isDisabled={page <= 1}
                >
                  Previous
                </SimplePaginationLink>
              </SimplePaginationItem>

              {Array.from({ length: Math.min(5, Math.ceil((data?.total || 0) / limit)) }, (_, i) => {
                const pageNumber = i + 1
                return (
                  <SimplePaginationItem key={pageNumber}>
                    <SimplePaginationLink
                      href={`/admin/transactions?page=${pageNumber}&limit=${limit}`}
                      isActive={pageNumber === page}
                    >
                      {pageNumber}
                    </SimplePaginationLink>
                  </SimplePaginationItem>
                )
              })}

              <SimplePaginationItem>
                <SimplePaginationLink
                  href={`/admin/transactions?page=${page + 1}&limit=${limit}`}
                  isDisabled={!data || page >= Math.ceil(data.total / limit)}
                >
                  Next
                </SimplePaginationLink>
              </SimplePaginationItem>
            </SimplePaginationContent>
          </SimplePagination>
        </SimpleCardFooter>
      </SimpleCard>
    </div>
  )
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div>Loading transactions...</div>}>
      <TransactionsContent />
    </Suspense>
  )
}