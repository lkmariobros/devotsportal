"use client"

import Link from "next/link"
import { TransactionStatusBadge } from "./transaction-status-badge"
import { formatDistanceToNow } from "date-fns"
import { Eye } from "lucide-react"

// Simple UI components to avoid import issues
function SimpleCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>;
}

function SimpleCardContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

function SimpleCardFooter({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>;
}

function SimpleButton({ children, variant = 'default', size = 'default', asChild, className = '' }: {
  children: React.ReactNode,
  variant?: 'default' | 'outline' | 'ghost',
  size?: 'default' | 'sm' | 'lg' | 'icon',
  asChild?: boolean,
  className?: string
}) {
  const sizeClasses = size === 'sm' ? 'h-9 px-3 text-xs' : 'px-4 py-2';
  const variantClasses = variant === 'outline' ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90';

  return asChild ? (
    <div className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${sizeClasses} ${variantClasses} ${className}`}>{children}</div>
  ) : (
    <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${sizeClasses} ${variantClasses} ${className}`}>{children}</button>
  );
}

interface TransactionCardProps {
  transaction: any
  isAdmin?: boolean
}

export function TransactionCard({ transaction, isAdmin = false }: TransactionCardProps) {
  // Format the transaction date
  const formattedDate = transaction.created_at
    ? formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })
    : "Unknown date"

  // Format the transaction value
  const formattedValue = new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR'
  }).format(transaction.transaction_value || 0)

  // Determine the view link based on whether this is admin or agent view
  const viewLink = isAdmin
    ? `/admin-dashboard/transactions/${transaction.id}`
    : `/agent/transactions/${transaction.id}`

  return (
    <SimpleCard className="overflow-hidden">
      <SimpleCardContent className="p-0">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">
                {transaction.property_address || "Unknown Property"}
              </h3>
              <TransactionStatusBadge status={transaction.status || "pending"} />
            </div>
            <div className="text-sm text-muted-foreground">
              {formattedDate}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Client</div>
              <div>{transaction.primary_client_name || "Unknown Client"}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Type</div>
              <div className="capitalize">
                {transaction.transaction_type_id || "Unknown"} - {transaction.market_type || "Unknown"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Value</div>
              <div>{formattedValue}</div>
            </div>
          </div>
        </div>
      </SimpleCardContent>
      <SimpleCardFooter className="bg-muted/50 p-4 flex justify-end">
        <SimpleButton asChild variant="outline" size="sm">
          <Link href={viewLink}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </SimpleButton>
      </SimpleCardFooter>
    </SimpleCard>
  )
}
