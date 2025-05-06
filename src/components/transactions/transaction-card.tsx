"use client"

import Link from "next/link"
import { TransactionStatusBadge } from "./transaction-status-badge"
import { formatDistanceToNow } from "date-fns"
import { Eye, CheckCircle, XCircle } from "lucide-react"
import { useState } from "react"
import { updateTransactionStatus } from "@/actions/transaction-actions-clean"

// Simple Button component to avoid import issues
function SimpleButton({
  children,
  asChild,
  variant = 'default',
  size = 'default',
  className = '',
  onClick,
  disabled = false,
  type = 'button'
}: {
  children: React.ReactNode,
  asChild?: boolean,
  variant?: 'default' | 'outline' | 'ghost',
  size?: 'default' | 'sm' | 'lg',
  className?: string,
  onClick?: () => void,
  disabled?: boolean,
  type?: 'button' | 'submit' | 'reset'
}) {
  let baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';

  // Size classes
  const sizeClasses = {
    default: 'h-10 py-2 px-4 text-sm',
    sm: 'h-9 px-3 text-xs',
    lg: 'h-11 px-8 text-base'
  };

  // Variant classes
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  };

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  return asChild ? (
    <div className={classes}>{children}</div>
  ) : (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}

// Simple Card components to avoid import issues
function SimpleCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>;
}

function SimpleCardHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
}

function SimpleCardTitle({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
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

interface TransactionCardProps {
  transaction: any
  isAdmin?: boolean
}

export function TransactionCard({ transaction, isAdmin = false }: TransactionCardProps) {
  // State for loading states during approval/rejection
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  // Format the transaction date
  const formattedDate = transaction.created_at
    ? formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })
    : "Unknown date"

  // Format the transaction value
  const formattedValue = new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR'
  }).format(transaction.property_price || transaction.transaction_value || 0)

  // Determine the view link based on whether this is admin or agent view
  const viewLink = isAdmin
    ? `/admin/transactions/${transaction.id}`
    : `/agent/transactions/${transaction.id}`

  // Handle transaction approval
  const handleApprove = async () => {
    if (isApproving || isRejecting) return

    setIsApproving(true)
    setStatusMessage('')

    try {
      // Add a delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500))

      const result = await updateTransactionStatus(transaction.id, 'approved')

      if (result.success) {
        setStatusMessage('Transaction approved successfully')
        // Wait a moment to show the success message before refreshing
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        setStatusMessage(`Error: ${result.error || 'Failed to approve transaction'}`)
      }
    } catch (error) {
      console.error('Error approving transaction:', error)
      setStatusMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsApproving(false)
    }
  }

  // Handle transaction rejection
  const handleReject = async () => {
    if (isApproving || isRejecting) return

    setIsRejecting(true)
    setStatusMessage('')

    try {
      // Add a delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500))

      const result = await updateTransactionStatus(transaction.id, 'rejected')

      if (result.success) {
        setStatusMessage('Transaction rejected successfully')
        // Wait a moment to show the success message before refreshing
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        setStatusMessage(`Error: ${result.error || 'Failed to reject transaction'}`)
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error)
      setStatusMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <SimpleCard>
      <SimpleCardHeader>
        <div className="flex items-start justify-between">
          <SimpleCardTitle>{transaction.property_address || "No address provided"}</SimpleCardTitle>
          <TransactionStatusBadge status={transaction.status} />
        </div>
        <SimpleCardDescription>
          {transaction.transaction_type} - {transaction.property_type} - {formattedDate}
        </SimpleCardDescription>
      </SimpleCardHeader>
      <SimpleCardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Client</p>
            <p className="text-sm">{transaction.primary_client_name || "No client name"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Value</p>
            <p className="text-sm">{formattedValue}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Market Type</p>
            <p className="text-sm">{transaction.market_type || "Not specified"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Property Category</p>
            <p className="text-sm">{transaction.property_category || "Not specified"}</p>
          </div>
        </div>
      </SimpleCardContent>
      {statusMessage && (
        <div className={`px-6 py-2 text-sm ${statusMessage.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {statusMessage}
        </div>
      )}
      <SimpleCardFooter className="bg-muted/50 p-4 flex justify-between">
        {isAdmin && transaction.status === 'pending' && (
          <div className="flex gap-2">
            <SimpleButton
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
              className={`bg-green-600 hover:bg-green-700 text-white ${isApproving ? 'opacity-50' : ''}`}
              size="sm"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isApproving ? 'Approving...' : 'Approve'}
            </SimpleButton>
            <SimpleButton
              onClick={handleReject}
              disabled={isApproving || isRejecting}
              className={`bg-red-600 hover:bg-red-700 text-white ${isRejecting ? 'opacity-50' : ''}`}
              size="sm"
            >
              <XCircle className="mr-2 h-4 w-4" />
              {isRejecting ? 'Rejecting...' : 'Reject'}
            </SimpleButton>
          </div>
        )}
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
