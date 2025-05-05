"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RiTeamLine,
  RiFileChartLine,
  RiMoneyDollarCircleLine,
  RiUserLine,
  RiDownloadLine
} from "@remixicon/react";
import DatePicker from "@/components/reusable-ui/date-picker";
import { useState, Suspense, useMemo } from "react";
import { trpc } from "@/utils/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRange } from "react-day-picker";
import { exportToCsv } from "../../../utils/export-helpers";
import { StatsGrid } from "@/components/ui/stats-grid";
import { Badge } from "@/components/ui/badge";
// Inline utils functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(amount);
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
import { TransactionsChart } from "./transactions-chart";
import { CommissionForecastChart } from "./commission-forecast-chart";
import { AgentActivity } from "./agent-activity";

// Define proper types for your API responses
interface AgentData {
  agents: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    status: string;
    team_id: string;
    created_at: string;
    team: string;
    teams?: { name: string }[];
  }[];
  totalCount: number;
  agentChange?: number | null; // Make it optional and allow null
}

interface TransactionData {
  statusCounts: { status: string; count: number }[];
  recentTransactions: {
    id: string;
    transaction_date: string;
    transaction_value: number;
    status: string;
    transaction_types: { name: string }[];
    profiles: { first_name: string; last_name: string }[];
  }[];
  upcomingPayments: Array<{
    agent_name: string;
    payment_date: string;
    amount: number;
  }>;
  transactionCounts: { active: number; completed: number };
  revenue: number;
  avgCommission: number;
  revenueChange?: number;
  commissionChange?: number;
}

interface CommissionForecastProps {
  data: {
    historical?: Array<{
      date: string;
      commissionAmount: number;
    }>;
    forecast?: Array<{
      date: string;
      projectedCommissionAmount: number;
    }>;
    summary?: {
      totalHistoricalCommission: number;
      avgMonthlyCommission: number;
      forecastTotal: number;
    };
  } | undefined;
  isLoading: boolean;
  filter?: string;
}

// Stats Grid Skeleton component for loading state
function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 min-[1200px]:grid-cols-4 gap-4">
      {Array(4).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}

// Upcoming Payments component
function UpcomingPayments({ data, isLoading }: {
  data?: TransactionData;
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array(3).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data?.upcomingPayments?.length) {
    return <div className="text-center py-4 text-muted-foreground">No upcoming payments</div>;
  }

  return (
    <div className="space-y-3">
      {data.upcomingPayments.slice(0, 3).map((payment, index) => (
        <div key={index} className="flex items-center justify-between border-b pb-2">
          <div>
            <div className="font-medium">{payment.agent_name || "Agent"}</div>
            <div className="text-sm text-muted-foreground">{formatDate(payment.payment_date)}</div>
          </div>
          <div className="font-medium">{formatCurrency(payment.amount)}</div>
        </div>
      ))}
    </div>
  );
}

// Commission Status component
function CommissionStatus({ data, isLoading }: {
  data?: CommissionForecastProps["data"];
  isLoading: boolean
}) {
  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Total Paid</div>
          <div className="text-2xl font-bold">
            {formatCurrency(data?.summary?.totalHistoricalCommission || 0)}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Projected</div>
          <div className="text-2xl font-bold">
            {formatCurrency(data?.summary?.forecastTotal || 0)}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">Monthly Average</div>
        <div className="text-xl font-semibold">
          {formatCurrency(data?.summary?.avgMonthlyCommission || 0)}
        </div>
      </div>
    </div>
  );
}

// Dashboard Stats component
function DashboardStats({
  agentsData,
  dashboardData
}: {
  agentsData?: AgentData;
  dashboardData?: TransactionData
}) {
  // Calculate pending commissions
  const pendingCommissions = useMemo(() => {
    return dashboardData?.upcomingPayments?.reduce(
      (total, payment) => total + (payment?.amount || 0),
      0
    ) || 0;
  }, [dashboardData?.upcomingPayments]);

  return (
    <StatsGrid stats={[
      {
        title: "Total Agents",
        value: agentsData?.totalCount || 0,
        change: {
          value: (agentsData as any)?.agentChange ? `${(agentsData as any).agentChange.toFixed(1)}%` : "0%",
          trend: (agentsData as any)?.agentChange > 0 ? "up" : "down",
          isPositive: (agentsData as any)?.agentChange > 0
        },
        icon: <RiTeamLine className="h-5 w-5" />
      },
      {
        title: "Active Transactions",
        value: dashboardData?.transactionCounts?.active || 0,
        change: {
          value: `${((dashboardData?.transactionCounts?.active || 0) /
                  (dashboardData?.transactionCounts?.completed || 1) * 100).toFixed(1)}%`,
          trend: "up",
          isPositive: true
        },
        icon: <RiFileChartLine className="h-5 w-5" />
      },
      {
        title: "Monthly Revenue",
        value: formatCurrency(dashboardData?.revenue || 0),
        change: {
          value: (dashboardData as any)?.revenueChange !== undefined ? `${(dashboardData as any).revenueChange.toFixed(1)}%` : "0%",
          trend: (dashboardData as any)?.revenueChange > 0 ? "up" : "down",
          isPositive: (dashboardData as any)?.revenueChange > 0
        },
        icon: <RiMoneyDollarCircleLine className="h-5 w-5" />
      },
      {
        title: "Pending Commissions",
        value: formatCurrency(pendingCommissions),
        change: {
          value: (dashboardData as any)?.commissionChange ? `${(dashboardData as any).commissionChange.toFixed(1)}%` : "0%",
          trend: (dashboardData as any)?.commissionChange > 0 ? "up" : "down",
          isPositive: (dashboardData as any)?.commissionChange > 0
        },
        icon: <RiUserLine className="h-5 w-5" />
      }
    ]} />
  );
}

export default function AdminDashboardPage() {
  // State for date range picker
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Fetch dashboard summary data with date range
  const { data: dashboardData, isLoading: isDashboardLoading } = trpc.transactions.getDashboardSummary.useQuery(
    dateRange ? {
      startDate: dateRange.from?.toISOString(),
      endDate: dateRange.to?.toISOString()
    } : undefined,
    {
      // Add staleTime to reduce unnecessary refetches
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch commission forecast data with date range
  const { data: commissionForecast, isLoading: isCommissionLoading } = trpc.transactions.getCommissionForecast.useQuery(
    {
      startDate: dateRange?.from?.toISOString(),
      endDate: dateRange?.to?.toISOString()
    },
    {
      // Add staleTime to reduce unnecessary refetches
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Get agent count with change percentage
  const { data: agentsData, isLoading: isAgentsLoading } =
    trpc.users.getAgents.useQuery({
      search: "",
      status: "",
      teamId: undefined,
      limit: 10,
      offset: 0,
      includeChangeStats: true // Add this parameter to get the agentChange data
    }, {
      // Add staleTime to reduce unnecessary refetches
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

  // Calculate pending commissions total - moved to the DashboardStats component
  const pendingCommissions = useMemo(() => {
    return dashboardData?.upcomingPayments?.reduce(
      (total, payment) => total + (payment?.amount || 0),
      0
    ) || 0;
  }, [dashboardData?.upcomingPayments]);

  // Enhanced export function with different data types
  function handleExportData(type: 'summary' | 'commissions' | 'all' = 'all') {
    if (!dashboardData && !commissionForecast) return

    let exportData: Record<string, any> = {}
    let filename = `dashboard-export-${new Date().toISOString().split('T')[0]}`

    if (type === 'all' || type === 'summary') {
      exportData.summary = {
        agents: agentsData?.totalCount || 0,
        activeTransactions: dashboardData?.transactionCounts?.active || 0,
        completedTransactions: dashboardData?.transactionCounts?.completed || 0,
        revenue: dashboardData?.revenue || 0,
        pendingCommissions: pendingCommissions || 0
      }
    }

    if (type === 'all' || type === 'commissions') {
      exportData.commissions = {
        historical: commissionForecast?.historical || [],
        forecast: commissionForecast?.forecast || [],
        summary: commissionForecast?.summary || {}
      }

      if (type === 'commissions') {
        filename = `commission-forecast-${new Date().toISOString().split('T')[0]}`
      }
    }

    exportToCsv(exportData, `${filename}.csv`)
  }

  // If you're still having issues, you can add a type assertion to ensure the data matches your interface
  const typedAgentsData: AgentData | undefined = agentsData as AgentData | undefined;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <DatePicker value={dateRange} onChange={setDateRange} />
          <div className="relative">
            <Button onClick={() => handleExportData()}>
              <RiDownloadLine className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid with Suspense for better loading UX */}
      {isDashboardLoading || isAgentsLoading ? (
        <StatsGridSkeleton />
      ) : (
        <DashboardStats
          agentsData={typedAgentsData}
          dashboardData={dashboardData}
        />
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Charts with Suspense for better loading UX */}
          <div className="grid gap-8 md:grid-cols-2">
            <Suspense fallback={<Skeleton className="h-[400px]" />}>
              <CommissionForecastChart
                data={commissionForecast}
                isLoading={isCommissionLoading}
                filter="all"
              />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-[400px]" />}>
              <TransactionsChart />
            </Suspense>
          </div>

          {/* Add Agent Activity component */}
          <Suspense fallback={<Skeleton className="h-[400px]" />}>
            <AgentActivity />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Commission Status</CardTitle>
                <CardDescription>Overview of commission payments</CardDescription>
              </CardHeader>
              <CardContent>
                <CommissionStatus
                  data={commissionForecast}
                  isLoading={isCommissionLoading}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payments</CardTitle>
                <CardDescription>Scheduled commission payments</CardDescription>
              </CardHeader>
              <CardContent>
                <UpcomingPayments
                  data={dashboardData}
                  isLoading={isDashboardLoading}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Generate and view reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Reports content will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                System notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Notifications content will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
