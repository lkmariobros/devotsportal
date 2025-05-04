"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { updateTransactionStatus } from "@/utils/transaction-service-new"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle } from "lucide-react"

interface TransactionStatusUpdateProps {
  transaction: any
}

export function TransactionStatusUpdate({ transaction }: TransactionStatusUpdateProps) {
  const router = useRouter()
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle status update
  const handleStatusUpdate = async (newStatus: string) => {
    setIsSubmitting(true)

    try {
      const result = await updateTransactionStatus(transaction.id, newStatus, notes)

      if (result.success) {
        toast.success(`Transaction ${newStatus} successfully`)
        router.refresh()
      } else {
        toast.error(`Failed to update status: ${result.error}`)
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error("Error updating transaction status:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Only show for pending transactions
  if (transaction.status !== "pending") {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Transaction</CardTitle>
        <CardDescription>
          Approve or reject this transaction
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Notes (optional)
            </label>
            <Textarea
              placeholder="Add any notes about this transaction..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="destructive"
          onClick={() => handleStatusUpdate("rejected")}
          disabled={isSubmitting}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Reject
        </Button>
        <Button
          variant="default"
          onClick={() => handleStatusUpdate("approved")}
          disabled={isSubmitting}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Approve
        </Button>
      </CardFooter>
    </Card>
  )
}
