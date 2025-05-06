"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionList } from "./transaction-list"

interface TransactionTabsProps {
  transactions: any[]
  pendingCount: number
  approvedCount: number
  rejectedCount: number
  allCount: number
}

export function TransactionTabs({
  transactions,
  pendingCount,
  approvedCount,
  rejectedCount,
  allCount,
}: TransactionTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const status = searchParams.get("status")
  const activeTab = status || "all"

  const handleTabChange = (value: string) => {
    if (value === "all") {
      router.push("/admin/transactions")
    } else {
      router.push(`/admin/transactions?status=${value}`)
    }
  }

  return (
    <Tabs defaultValue={activeTab} className="w-full" onValueChange={handleTabChange}>
      <TabsList className="mb-4">
        <TabsTrigger value="all">
          All ({allCount})
        </TabsTrigger>
        <TabsTrigger value="pending">
          Pending ({pendingCount})
        </TabsTrigger>
        <TabsTrigger value="approved">
          Approved ({approvedCount})
        </TabsTrigger>
        <TabsTrigger value="rejected">
          Rejected ({rejectedCount})
        </TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab} className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === 'all' && 'All Transactions'}
              {activeTab === 'pending' && 'Pending Transactions'}
              {activeTab === 'approved' && 'Approved Transactions'}
              {activeTab === 'rejected' && 'Rejected Transactions'}
            </CardTitle>
            <CardDescription>
              {transactions?.length || 0} transaction(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionList transactions={transactions} isAdmin={true} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
