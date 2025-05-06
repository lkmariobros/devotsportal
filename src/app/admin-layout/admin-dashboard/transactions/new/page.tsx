"use client"

import { TransactionFormClient } from "@/components/agent/transaction-form-client-clean"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminNewTransactionPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          New Transaction
        </h1>
      </div>
      <p className="text-muted-foreground">Create a new property transaction</p>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>
            Enter the details of the new transaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionFormClient isAdmin={true} />
        </CardContent>
      </Card>
    </div>
  )
}
