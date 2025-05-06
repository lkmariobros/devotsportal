"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import { DownloadIcon, FilterIcon } from "lucide-react"
import { format } from "date-fns"
import { columns } from "./columns"
import { CommissionDetailsChart } from "./commission-details-chart"

// Import trpc dynamically to avoid server-side import
// This ensures the import only happens on the client
let trpc: any = null

// Define the filter type to fix type error
type FilterType = "all" | "pending" | "paid" | "projected"

export default function CommissionDetailsPage() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined
  })

  const [activeTab, setActiveTab] = useState<FilterType>("all")

  // Use useEffect to dynamically import trpc on the client side only
  // This is commented out for now as we'll use mock data
  /*
  useEffect(() => {
    // Dynamically import trpc only on the client side
    import('@/utils/trpc/client').then((module) => {
      trpc = module.trpc;
    });
  }, []);
  */

  // Mock data instead of using trpc query
  const { data, isLoading } = {
    data: {
      transactions: [],
      chartData: []
    },
    isLoading: false
  }

  const handleExport = () => {
    // Implementation for exporting commission data
    alert("Export functionality will be implemented")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commission Details</h1>
          <p className="text-muted-foreground">
            View and analyze your commission data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DatePickerWithRange
            value={dateRange}
            onChange={setDateRange}
          />
          <Button variant="outline" size="icon" onClick={handleExport}>
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as FilterType)}>
        <TabsList>
          <TabsTrigger value="all">All Commissions</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="projected">Projected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <CommissionDetailsChart
            data={data?.chartData}
            isLoading={isLoading}
            filter={activeTab}
          />

          <Card>
            <CardHeader>
              <CardTitle>Commission Transactions</CardTitle>
              <CardDescription>
                {dateRange.from && dateRange.to
                  ? `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`
                  : "All time commission transactions"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="animate-pulse text-muted-foreground">Loading commission data...</div>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={data?.transactions || []}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
