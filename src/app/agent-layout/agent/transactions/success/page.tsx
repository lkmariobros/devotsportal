import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { getTransactionById } from "@/utils/transaction-service-new"

export default async function TransactionSuccessPage({
  searchParams
}: {
  searchParams: { id?: string }
}) {
  // Get the transaction ID from the URL if available
  const transactionId = searchParams.id

  // If we have a transaction ID, fetch the transaction details
  let transaction = null
  if (transactionId) {
    const result = await getTransactionById(transactionId)
    if (result.success) {
      transaction = result.data
    }
  }

  return (
    <div className="container py-10 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Transaction Submitted</CardTitle>
          <CardDescription>
            Your transaction has been successfully submitted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your transaction has been submitted and is pending review. You can view the status of your transaction in the transactions list.
            </p>

            {transaction && (
              <div className="mt-4 p-4 bg-muted rounded-md text-left">
                <h3 className="font-medium mb-2">Transaction Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Property:</div>
                  <div>{transaction.property_address}</div>

                  <div className="text-muted-foreground">Client:</div>
                  <div>{transaction.primary_client_name}</div>

                  <div className="text-muted-foreground">Value:</div>
                  <div>{new Intl.NumberFormat('en-MY', {
                    style: 'currency',
                    currency: 'MYR'
                  }).format(transaction.transaction_value)}</div>

                  <div className="text-muted-foreground">Status:</div>
                  <div className="capitalize">{transaction.status}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/agent-layout/transactions">
              View All Transactions
            </Link>
          </Button>
          {transaction && (
            <Button asChild variant="secondary">
              <Link href={`/agent/transactions/${transaction.id}`}>
                View This Transaction
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/agent-layout/transactions/new">
              Create Another Transaction
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
