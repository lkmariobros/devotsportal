"use client"

import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionDocuments } from "@/components/transactions/transaction-documents"
import { TransactionCommission } from "@/components/transactions/transaction-commission"
import { TransactionStatusSubscription } from "@/components/transactions/transaction-status-subscription"

interface TransactionDetailsProps {
  transaction: any
}

export function TransactionDetails({ transaction }: TransactionDetailsProps) {
  function getStatusBadge(status: string) {
    switch (status) {
      case "Pending":
        return <Badge variant="outline">Pending</Badge>
      case "Approved":
        return <Badge>Approved</Badge>
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            {transaction.properties.address}
          </h2>
          <p className="text-muted-foreground">
            {transaction.properties.city}, {transaction.properties.state} {transaction.properties.zip}
          </p>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold">
              {formatCurrency(transaction.transaction_value)}
            </span>
            <TransactionStatusSubscription
              transactionId={transaction.id}
              initialStatus={transaction.status}
            />
          </div>
          <p className="text-muted-foreground">
            Transaction Date: {formatDate(transaction.transaction_date)}
          </p>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-4">
              <h3 className="font-medium">Transaction Information</h3>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-muted-foreground">Transaction Type:</p>
                <p>{transaction.transaction_types.name}</p>

                <p className="text-muted-foreground">Transaction Date:</p>
                <p>{formatDate(transaction.transaction_date)}</p>

                <p className="text-muted-foreground">Closing Date:</p>
                <p>{formatDate(transaction.closing_date)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Property Information</h3>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-muted-foreground">Address:</p>
                <p>{transaction.properties.address}</p>

                <p className="text-muted-foreground">City:</p>
                <p>{transaction.properties.city}</p>

                <p className="text-muted-foreground">State:</p>
                <p>{transaction.properties.state}</p>

                <p className="text-muted-foreground">Zip:</p>
                <p>{transaction.properties.zip}</p>

                <p className="text-muted-foreground">Property Type:</p>
                <p>{transaction.properties.property_type}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="commission">
          <TransactionCommission transaction={transaction} />
        </TabsContent>

        <TabsContent value="documents">
          <TransactionDocuments documents={transaction.transaction_documents || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}