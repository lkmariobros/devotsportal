"use client"

import { Badge } from "@/components/ui/badge"
import { cva } from "class-variance-authority"

const statusVariants = cva("", {
  variants: {
    status: {
      pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      approved: "bg-green-100 text-green-800 hover:bg-green-100",
      rejected: "bg-red-100 text-red-800 hover:bg-red-100",
      completed: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      cancelled: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      draft: "bg-slate-100 text-slate-800 hover:bg-slate-100",
    },
  },
  defaultVariants: {
    status: "pending",
  },
})

interface TransactionStatusBadgeProps {
  status: string
}

export function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
  return (
    <Badge variant="outline" className={statusVariants({ status: status as any })}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}
