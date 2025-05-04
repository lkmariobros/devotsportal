"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TransactionStatusBadge } from "./transaction-status-badge"
import { formatDistanceToNow } from "date-fns"
import { Eye } from "lucide-react"

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
    <Card className="overflow-hidden">
      <CardContent className="p-0">
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
      </CardContent>
      <CardFooter className="bg-muted/50 p-4 flex justify-end">
        <Button asChild variant="outline" size="sm">
          <Link href={viewLink}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
