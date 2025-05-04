"use client"

import { trpc } from "@/utils/trpc/client"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from "recharts"

interface CommissionSummaryProps {
  agentId?: string
}

export function CommissionSummary({ agentId }: CommissionSummaryProps) {
  const { data, isLoading } = trpc.transactions.getAgentCommissionSummary.useQuery(
    { agentId: agentId || "" },
    { enabled: !!agentId }
  )
  
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />
  }
  
  const commissionData = [
    { name: "Paid", value: data?.paidCommission || 0, color: "#10b981" },
    { name: "Pending", value: data?.pendingCommission || 0, color: "#f59e0b" },
    { name: "Projected", value: data?.projectedCommission || 0, color: "#3b82f6" }
  ].filter(item => item.value > 0)
  
  const totalCommission = commissionData.reduce((sum, item) => sum + item.value, 0)
  
  if (totalCommission === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No commission data available
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={commissionData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {commissionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => formatCurrency(value as number)} 
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        {commissionData.map((item) => (
          <div key={item.name}>
            <p className="text-sm text-muted-foreground">{item.name}</p>
            <p className="font-medium">{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}