import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTransactionById, updateTransactionStatus } from "@/actions/transaction-actions-clean"
import { TransactionDetails } from "@/components/admin/transaction-details"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Transaction Details | Admin Portal",
  description: "View and manage transaction details",
}

interface TransactionDetailPageProps {
  params: {
    id: string
  }
}

export default async function TransactionDetailPage({ params }: TransactionDetailPageProps) {
  const { id } = params

  // Fetch transaction data
  const { success, data: transaction, error } = await getTransactionById(id)

  // If transaction not found, show 404
  if (!success || !transaction) {
    notFound()
  }

  // Handle status change
  async function handleStatusChange(transactionId: string, newStatus: string, notes?: string) {
    "use server"

    return updateTransactionStatus(transactionId, newStatus, notes)
  }

  return (
    <div className="container py-6 space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/admin-layout/transactions">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Transactions
          </Link>
        </Button>
      </div>

      <TransactionDetails
        transaction={transaction}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
