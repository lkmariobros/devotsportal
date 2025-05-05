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

// Simple UI components to avoid import issues
function SimpleCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>;
}

function SimpleCardHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
}

function SimpleCardTitle({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
}

function SimpleCardDescription({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>;
}

function SimpleCardContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

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
      <SimpleCard>
        <SimpleCardHeader>
          <SimpleCardTitle>Commission Breakdown</SimpleCardTitle>
          <SimpleCardDescription>Monthly commission distribution</SimpleCardDescription>
        </SimpleCardHeader>
        <SimpleCardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
          </div>
        </SimpleCardContent>
      </SimpleCard>
    )
  }

  if (!data || data.length === 0) {
    return (
      <SimpleCard>
        <SimpleCardHeader>
          <SimpleCardTitle>Commission Breakdown</SimpleCardTitle>
          <SimpleCardDescription>Monthly commission distribution</SimpleCardDescription>
        </SimpleCardHeader>
        <SimpleCardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No commission data available for the selected period
          </div>
        </SimpleCardContent>
      </SimpleCard>
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
    <SimpleCard>
      <SimpleCardHeader>
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <SimpleCardTitle>Commission Breakdown</SimpleCardTitle>
            <SimpleCardDescription>Monthly commission distribution</SimpleCardDescription>
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
      </SimpleCardHeader>
      <SimpleCardContent>
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
      </SimpleCardContent>
    </SimpleCard>
  )
}