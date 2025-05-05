"use client";

import {
  RiTeamLine,
  RiFileChartLine,
  RiMoneyDollarCircleLine,
  RiUserLine,
  RiDownloadLine
} from "@remixicon/react";
import { useState, Suspense, useMemo } from "react";
import { trpc } from "@/utils/trpc/client";
import { DateRange } from "react-day-picker";
import { exportToCsv } from "../../../utils/export-helpers";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionsChart } from "./transactions-chart";
import { CommissionForecastChart } from "./commission-forecast-chart";
import { AgentActivity } from "./agent-activity";

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

function SimpleCardFooter({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>;
}

function SimpleButton({ children, onClick, className = '' }: {
  children: React.ReactNode,
  onClick?: () => void,
  className?: string
}) {
  return <button onClick={onClick} className={`inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 ${className}`}>{children}</button>;
}

function SimpleTabs({ children, defaultValue, className = '' }: {
  children: React.ReactNode,
  defaultValue?: string,
  className?: string
}) {
  return <div className={`w-full ${className}`}>{children}</div>;
}

function SimpleTabsList({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}>{children}</div>;
}

function SimpleTabsTrigger({ children, value, className = '' }: {
  children: React.ReactNode,
  value: string,
  className?: string
}) {
  return <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm ${className}`}>{children}</button>;
}

function SimpleTabsContent({ children, value, className = '' }: {
  children: React.ReactNode,
  value: string,
  className?: string
}) {
  return <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}>{children}</div>;
}

function SimpleSkeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`}></div>;
}

function SimpleBadge({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>{children}</span>;
}

function SimpleDatePicker({ value, onChange }: {
  value?: DateRange,
  onChange: (value?: DateRange) => void
}) {
  return (
    <div className="flex items-center space-x-2 rounded-md border p-2">
      <div className="grid gap-1">
        <div className="text-xs font-medium">Date Range</div>
        <div className="text-xs text-muted-foreground">
          {value?.from ? formatDate(value.from.toISOString()) : 'Pick a date'} -
          {value?.to ? formatDate(value.to.toISOString()) : 'Pick a date'}
        </div>
      </div>
    </div>
  );
}

// Simple StatsGrid component
function SimpleStatsGrid({ stats }: { stats: Array<{
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
    isPositive: boolean;
  };
}> }) {
  return (
    <div className="grid grid-cols-2 min-[1200px]:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <SimpleCard key={index} className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
              {stat.change && (
                <p className={`text-xs ${stat.change.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change.trend === 'up' ? '↑' : '↓'} {stat.change.value}
                </p>
              )}
            </div>
            {stat.icon && (
              <div className="rounded-full bg-muted p-2">
                {stat.icon}
              </div>
            )}
          </div>
        </SimpleCard>
      ))}
    </div>
  );
}

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
        <SimpleSkeleton key={i} className="h-32 w-full" />
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
          <SimpleSkeleton key={i} className="h-12 w-full" />
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
    return <SimpleSkeleton className="h-40 w-full" />;
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
    <SimpleStatsGrid stats={[
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
          <SimpleDatePicker value={dateRange} onChange={setDateRange} />
          <div className="relative">
            <SimpleButton onClick={() => handleExportData()}>
              <RiDownloadLine className="mr-2 h-4 w-4" />
              Download
            </SimpleButton>
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

      <SimpleTabs defaultValue="overview" className="space-y-4">
        <SimpleTabsList>
          <SimpleTabsTrigger value="overview">Overview</SimpleTabsTrigger>
          <SimpleTabsTrigger value="analytics">Analytics</SimpleTabsTrigger>
          <SimpleTabsTrigger value="reports">Reports</SimpleTabsTrigger>
          <SimpleTabsTrigger value="notifications">Notifications</SimpleTabsTrigger>
        </SimpleTabsList>

        <SimpleTabsContent value="overview" className="space-y-4">
          {/* Charts with Suspense for better loading UX */}
          <div className="grid gap-8 md:grid-cols-2">
            <Suspense fallback={<SimpleSkeleton className="h-[400px]" />}>
              <CommissionForecastChart
                data={commissionForecast}
                isLoading={isCommissionLoading}
                filter="all"
              />
            </Suspense>
            <Suspense fallback={<SimpleSkeleton className="h-[400px]" />}>
              <TransactionsChart />
            </Suspense>
          </div>

          {/* Add Agent Activity component */}
          <Suspense fallback={<SimpleSkeleton className="h-[400px]" />}>
            <AgentActivity />
          </Suspense>
        </SimpleTabsContent>

        <SimpleTabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <SimpleCard>
              <SimpleCardHeader>
                <SimpleCardTitle>Commission Status</SimpleCardTitle>
                <SimpleCardDescription>Overview of commission payments</SimpleCardDescription>
              </SimpleCardHeader>
              <SimpleCardContent>
                <CommissionStatus
                  data={commissionForecast}
                  isLoading={isCommissionLoading}
                />
              </SimpleCardContent>
            </SimpleCard>

            <SimpleCard>
              <SimpleCardHeader>
                <SimpleCardTitle>Upcoming Payments</SimpleCardTitle>
                <SimpleCardDescription>Scheduled commission payments</SimpleCardDescription>
              </SimpleCardHeader>
              <SimpleCardContent>
                <UpcomingPayments
                  data={dashboardData}
                  isLoading={isDashboardLoading}
                />
              </SimpleCardContent>
            </SimpleCard>
          </div>
        </SimpleTabsContent>

        <SimpleTabsContent value="reports">
          <SimpleCard>
            <SimpleCardHeader>
              <SimpleCardTitle>Reports</SimpleCardTitle>
              <SimpleCardDescription>
                Generate and view reports
              </SimpleCardDescription>
            </SimpleCardHeader>
            <SimpleCardContent>
              <p>Reports content will be displayed here.</p>
            </SimpleCardContent>
          </SimpleCard>
        </SimpleTabsContent>

        <SimpleTabsContent value="notifications">
          <SimpleCard>
            <SimpleCardHeader>
              <SimpleCardTitle>Notifications</SimpleCardTitle>
              <SimpleCardDescription>
                System notifications and alerts
              </SimpleCardDescription>
            </SimpleCardHeader>
            <SimpleCardContent>
              <p>Notifications content will be displayed here.</p>
            </SimpleCardContent>
          </SimpleCard>
        </SimpleTabsContent>
      </SimpleTabs>
    </div>
  );
}
