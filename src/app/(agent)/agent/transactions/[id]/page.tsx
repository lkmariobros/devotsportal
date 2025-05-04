import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, PencilIcon } from "lucide-react"
import { getTransactionById } from "@/utils/transaction-service-new"
import { TransactionDetailCard } from "@/components/transactions/transaction-detail-card"

export const dynamic = 'force-dynamic'

export default async function TransactionDetailPage({
  params
}: {
  params: { id: string }
}) {
  // Get the transaction ID from the URL
  const { id } = params

  // Fetch the transaction details
  const result = await getTransactionById(id)

  // If the transaction doesn't exist, show a 404 page
  if (!result.success || !result.data) {
    notFound()
  }

  // Get the transaction from the result
  const transaction = result.data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/agent/transactions">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Transactions
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            Transaction Details
          </h1>
        </div>
        <div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/agent/transactions/${id}/edit`}>
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <TransactionDetailCard transaction={transaction} />
    </div>
  )
}

