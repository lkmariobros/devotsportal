"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { trpc } from "@/utils/trpc/client"
import { useRouter } from "next/navigation"

interface TransactionActionsProps {
  transaction: any // Replace with proper type
}

export function TransactionActions({ transaction }: TransactionActionsProps) {
  const router = useRouter()
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [notes, setNotes] = useState("")

  // Get the current version of the transaction for optimistic concurrency control
  const currentVersion = transaction.version || 1

  const approveTransaction = trpc.transactions.approveTransaction.useMutation({
    onSuccess: (result) => {
      toast.success("Transaction approved successfully")
      setIsApproveOpen(false)
      router.refresh()
    },
    onError: (error) => {
      // Handle version mismatch errors specially
      if (error.message.includes('version mismatch')) {
        toast.error(
          "This transaction has been modified by another user. Please refresh and try again."
        )
      } else {
        toast.error(`Error approving transaction: ${error.message}`)
      }
    }
  })

  const rejectTransaction = trpc.transactions.rejectTransaction.useMutation({
    onSuccess: (result) => {
      toast.success("Transaction rejected successfully")
      setIsRejectOpen(false)
      router.refresh()
    },
    onError: (error) => {
      // Handle version mismatch errors specially
      if (error.message.includes('version mismatch')) {
        toast.error(
          "This transaction has been modified by another user. Please refresh and try again."
        )
      } else {
        toast.error(`Error rejecting transaction: ${error.message}`)
      }
    }
  })

  // Don't show actions if transaction is already approved or rejected
  if (transaction.status !== "Pending") {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" disabled>
          {transaction.status}
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setIsApproveOpen(true)}
        >
          Approve
        </Button>
        <Button
          variant="destructive"
          onClick={() => setIsRejectOpen(true)}
        >
          Reject
        </Button>
      </div>

      {/* Approve Dialog */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this transaction? This will generate commission records.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Add notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => approveTransaction.mutate({
                id: transaction.id,
                notes,
                expectedVersion: currentVersion
              })}
              disabled={approveTransaction.isPending}
            >
              {approveTransaction.isPending ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this transaction?
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Add reason for rejection"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectTransaction.mutate({
                id: transaction.id,
                notes,
                expectedVersion: currentVersion
              })}
              disabled={rejectTransaction.isPending}
            >
              {rejectTransaction.isPending ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}