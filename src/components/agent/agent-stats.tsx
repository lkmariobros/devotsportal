"use client"

import { Card, CardContent } from "@/components/ui/card"
import { trpc } from "@/utils/trpc/client"
import { RiMoneyDollarCircleLine, RiFileList3Line, RiTimeLine } from "@remixicon/react"

interface AgentStatsProps {
  agentId?: string
}

export function AgentStats({ agentId }: AgentStatsProps) {
  const { data, isLoading } = trpc.agents.getDashboardStats.useQuery(
    { agentId: agentId || "" },
    { enabled: !!agentId }
  )

  if (isLoading) {
    return <div className="grid gap-4 md:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="h-24 animate-pulse bg-muted" />
      ))}
    </div>
  }

  const stats = [
    {
      title: "Total Transactions",
      value: data?.totalTransactions || 0,
      icon: RiFileList3Line,
      description: "All time"
    },
    {
      title: "Total Commission",
      value: new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR"
      }).format(data?.totalCommission || 0),
      icon: RiMoneyDollarCircleLine,
      description: "All time"
    },
    {
      title: "Pending Transactions",
      value: data?.pendingTransactions || 0,
      icon: RiTimeLine,
      description: "Awaiting completion"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </div>
              <stat.icon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}