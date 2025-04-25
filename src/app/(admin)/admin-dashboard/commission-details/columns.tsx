"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export interface CommissionTransaction {
  id: string
  date: string
  description: string
  amount: number
  status: "pending" | "paid" | "projected"
  source: string
  transactionId?: string
}

export const columns: ColumnDef<CommissionTransaction>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"))
      return <div>{format(date, "MMM d, yyyy")}</div>
    }
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <div className="font-medium">{row.getValue("description")}</div>
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => <div>{row.getValue("source")}</div>
  },
  {
    accessorKey: "transactionId",
    header: "Transaction ID",
    cell: ({ row }) => {
      const id = row.getValue("transactionId") as string | undefined
      return id ? <div className="font-mono text-xs">{id.slice(-6)}</div> : <div>-</div>
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant="outline"
          className={
            status === "paid" 
              ? "bg-green-100 text-green-700 hover:bg-green-100" 
              : status === "pending" 
                ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                : "bg-blue-100 text-blue-700 hover:bg-blue-100"
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    }
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(amount)
      
      return <div className="text-right font-medium">{formatted}</div>
    }
  }
]