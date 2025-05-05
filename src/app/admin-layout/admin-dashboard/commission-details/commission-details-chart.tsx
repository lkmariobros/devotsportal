"use client"

import { useId } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartData {
  month: string
  pending: number
  paid: number
  projected: number
}

interface CommissionDetailsChartProps {
  data?: ChartData[]
  isLoading: boolean
  filter: string
}

export function CommissionDetailsChart({ data, isLoading, filter }: CommissionDetailsChartProps) {
  const id = useId()
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Commission Breakdown</CardTitle>
          <CardDescription>Monthly commission distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Commission Breakdown</CardTitle>
          <CardDescription>Monthly commission distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No commission data available for the selected period
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // Calculate totals
  const totals = data.reduce(
    (acc, item) => {
      acc.pending += item.pending || 0
      acc.paid += item.paid || 0
      acc.projected += item.projected || 0
      acc.total += (item.pending || 0) + (item.paid || 0) + (item.projected || 0)
      return acc
    },
    { pending: 0, paid: 0, projected: 0, total: 0 }
  )
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <CardTitle>Commission Breakdown</CardTitle>
            <CardDescription>Monthly commission distribution</CardDescription>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 md:mt-0">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-semibold">${totals.total.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="text-lg font-semibold text-green-600">${totals.paid.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold text-amber-600">${totals.pending.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Projected</p>
              <p className="text-lg font-semibold text-blue-600">${totals.projected.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis 
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value) => [`$${Number(value).toLocaleString()}`, undefined]}
              />
              <Legend />
              <Bar 
                dataKey="paid" 
                name="Paid" 
                stackId="a" 
                fill="#22c55e" 
              />
              <Bar 
                dataKey="pending" 
                name="Pending" 
                stackId="a" 
                fill="#f59e0b" 
              />
              <Bar 
                dataKey="projected" 
                name="Projected" 
                stackId="a" 
                fill="#3b82f6" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}