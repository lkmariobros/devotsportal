import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RiAddLine } from "@remixicon/react"

export function TransactionsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">
          Manage and track all property transactions
        </p>
      </div>
      <Button asChild>
        <Link href="/transactions/new">
          <RiAddLine className="mr-2 h-4 w-4" />
          New Transaction
        </Link>
      </Button>
    </div>
  )
}