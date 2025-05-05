"use client"

import Link from "next/link"
import { TransactionCard } from "./transaction-card"
import { PlusCircle } from "lucide-react"

// Simple Button component to avoid import issues
function SimpleButton({ children, asChild, className = '' }: {
  children: React.ReactNode,
  asChild?: boolean,
  className?: string
}) {
  return asChild ? (
    <div className={`inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 ${className}`}>{children}</div>
  ) : (
    <button className={`inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 ${className}`}>{children}</button>
  );
}

interface TransactionListProps {
  transactions: any[]
  isAdmin?: boolean
}

export function TransactionList({ transactions, isAdmin = false }: TransactionListProps) {
  // Determine the new transaction link based on whether this is admin or agent view
  const newTransactionLink = isAdmin
    ? "/admin-dashboard/transactions/new"
    : "/agent-layout/transactions/new"

  return (
    <div className="space-y-6">
      {transactions.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-medium mb-2">No transactions found</h3>
          <p className="text-muted-foreground mb-6">
            {isAdmin
              ? "There are no transactions in the system yet."
              : "You haven't created any transactions yet."}
          </p>
          {!isAdmin && (
            <SimpleButton asChild>
              <Link href={newTransactionLink}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Transaction
              </Link>
            </SimpleButton>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {transactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  )
}
