"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionStatusBadge } from "./transaction-status-badge"
import { format } from "date-fns"

interface TransactionDetailCardProps {
  transaction: any
}

export function TransactionDetailCard({ transaction }: TransactionDetailCardProps) {
  // Format dates
  const createdDate = transaction.created_at
    ? format(new Date(transaction.created_at), "PPP")
    : "Unknown"

  // Format the transaction value
  const formattedValue = new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR'
  }).format(transaction.transaction_value || 0)

  // Format commission amount
  const formattedCommission = new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR'
  }).format(transaction.commission_amount || 0)

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{transaction.property_address || "Unknown Property"}</CardTitle>
            <CardDescription>
              Transaction #{transaction.id?.substring(0, 8) || "Unknown"}
            </CardDescription>
          </div>
          <TransactionStatusBadge status={transaction.status || "pending"} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Property Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-muted-foreground">Address</div>
              <div>{transaction.property_address || "N/A"}</div>

              <div className="text-muted-foreground">City</div>
              <div>{transaction.property_city || "N/A"}</div>

              <div className="text-muted-foreground">State</div>
              <div>{transaction.property_state || "N/A"}</div>

              <div className="text-muted-foreground">Zip</div>
              <div>{transaction.property_zip || "N/A"}</div>

              <div className="text-muted-foreground">Property Type</div>
              <div className="capitalize">{transaction.property_type || "N/A"}</div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Transaction Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-muted-foreground">Transaction Type</div>
              <div className="capitalize">{transaction.transaction_type_id || "N/A"}</div>

              <div className="text-muted-foreground">Market Type</div>
              <div className="capitalize">{transaction.market_type || "N/A"} - {transaction.market_subcategory || "N/A"}</div>

              <div className="text-muted-foreground">Transaction Value</div>
              <div>{formattedValue}</div>

              <div className="text-muted-foreground">Commission Rate</div>
              <div>{transaction.commission_rate || 0}%</div>

              <div className="text-muted-foreground">Commission Amount</div>
              <div>{formattedCommission}</div>

              <div className="text-muted-foreground">Created Date</div>
              <div>{createdDate}</div>
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Primary Client</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-muted-foreground">Name</div>
              <div>{transaction.primary_client_name || "N/A"}</div>

              <div className="text-muted-foreground">Email</div>
              <div>{transaction.primary_client_email || "N/A"}</div>

              <div className="text-muted-foreground">Phone</div>
              <div>{transaction.primary_client_phone || "N/A"}</div>

              <div className="text-muted-foreground">Type</div>
              <div className="capitalize">{transaction.primary_client_type || "N/A"}</div>

              {transaction.primary_is_company && (
                <>
                  <div className="text-muted-foreground">Company Name</div>
                  <div>{transaction.primary_company_name || "N/A"}</div>
                </>
              )}
            </div>
          </div>

          {/* Secondary Client Information (if applicable) */}
          {transaction.include_secondary_party && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Secondary Client</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-muted-foreground">Name</div>
                <div>{transaction.secondary_client_name || "N/A"}</div>

                <div className="text-muted-foreground">Email</div>
                <div>{transaction.secondary_client_email || "N/A"}</div>

                <div className="text-muted-foreground">Phone</div>
                <div>{transaction.secondary_client_phone || "N/A"}</div>

                <div className="text-muted-foreground">Type</div>
                <div className="capitalize">{transaction.secondary_client_type || "N/A"}</div>

                {transaction.secondary_is_company && (
                  <>
                    <div className="text-muted-foreground">Company Name</div>
                    <div>{transaction.secondary_company_name || "N/A"}</div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Co-Broking Information (if applicable) */}
          {transaction.co_broking_enabled && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Co-Broking Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-muted-foreground">Co-Agent Name</div>
                <div>{transaction.co_agent_name || "N/A"}</div>

                <div className="text-muted-foreground">Co-Agent Email</div>
                <div>{transaction.co_agent_email || "N/A"}</div>

                <div className="text-muted-foreground">Commission Split</div>
                <div>{transaction.commission_split || 50}%</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
