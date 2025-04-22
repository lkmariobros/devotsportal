"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RiTeamLine, 
  RiUserSettingsLine, 
  RiFileChartLine, 
  RiDashboardLine,
  RiMoneyDollarCircleLine,
  RiUserLine // Added for UserIcon replacement
} from "@remixicon/react";
import DatePicker from "@/components/reusable-ui/date-picker"; // Import DatePicker
import { useId, useState } from "react"; // Added useState
import {
  CartesianGrid,
  Line,
  LineChart,
  Rectangle,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/utils/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRange } from "react-day-picker"; // Import DateRange type

// Import chart components from reusable-ui
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/reusable-ui/chart";
import { CustomTooltipContent } from "@/components/reusable-ui/charts-extra";

export default function AdminDashboardPage() {
  // State for date range picker
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  // Fetch dashboard summary data
  const { data: dashboardData, isLoading: isDashboardLoading } = 
    trpc.transactions.getDashboardSummary.useQuery();
  
  // Fetch commission forecast data
  const { data: commissionForecast, isLoading: isCommissionLoading } = 
    trpc.transactions.getCommissionForecast.useQuery({ 
      months: 12, 
      includeHistorical: true 
    });

  // Get agent count
  const { data: agentsData, isLoading: isAgentsLoading } = 
    trpc.users.getAgents.useQuery();
  
  // Calculate pending commissions total - Fixed type issue
  const pendingCommissions = dashboardData?.upcomingPayments?.reduce(
    (total, payment) => total + (
      payment && 
      typeof payment === 'object' && 
      payment !== null && 
      'amount' in payment ? 
      Number((payment as { amount: number }).amount) : 
      0
    ),
    0
  ) || 0;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <DatePicker value={dateRange} onChange={setDateRange} />
          <Button>Download</Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
                <RiUserLine className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isAgentsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{agentsData?.agents.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Active agent roster</p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Transactions</CardTitle>
                <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" /></svg>
              </CardHeader>
              <CardContent>
                {isDashboardLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {dashboardData?.statusCounts?.find(s => s.status === 'Active')?.count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Current active deals</p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              </CardHeader>
              <CardContent>
                {isCommissionLoading ? (
                  <Skeleton className="h-8 w-28" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {formatCurrency(commissionForecast?.summary?.totalHistoricalCommission || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {commissionForecast?.summary?.avgMonthlyCommission 
                        ? `+${formatCurrency(commissionForecast.summary.avgMonthlyCommission)} monthly avg` 
                        : 'Historical total'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
                <RiMoneyDollarCircleLine className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isDashboardLoading ? (
                  <Skeleton className="h-8 w-28" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{formatCurrency(pendingCommissions)}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardData?.upcomingPayments?.length || 0} pending payments
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            <CommissionForecastChart data={commissionForecast} isLoading={isCommissionLoading} />
            <TransactionsChart />
          </div>
        </TabsContent>
        
        {/* Other tabs remain the same */}
      </Tabs>
    </div>
  );
}

// Improved CustomCursor implementation
function CustomCursor({ fill, x, y, width, height, ...props }: any) {
  return (
    <>
      <Rectangle
        x={x - 12}
        y={y}
        fill={fill}
        fillOpacity={0.1}
        width={24}
        height={height}
        {...props}
      />
      <Rectangle
        x={x - 1}
        y={y}
        fill={fill || "white"}
        fillOpacity={0.2}
        width={1}
        height={height}
        {...props}
      />
    </>
  );
}

// Commission Forecast Chart Component
function CommissionForecastChart({ data, isLoading }: { 
  data: any; 
  isLoading: boolean;
}) {
  const id = useId();
  
  // Transform data for chart
  const chartData = data?.historical?.map((month: any) => ({
    month: new Date(month.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    actual: month.commissionAmount,
    projected: 0
  })) || [];
  
  // Add forecast data
  if (data?.forecast) {
    data.forecast.forEach((month: any) => {
      chartData.push({
        month: new Date(month.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        actual: 0,
        projected: month.projectedCommissionAmount
      });
    });
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Commission Forecast</CardTitle>
          <CardDescription>Historical and projected commission earnings</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-40 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commission Forecast</CardTitle>
        <CardDescription>Historical and projected commission earnings</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="aspect-auto h-[350px] w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-blue-500/10"
          config={{}}
        >
          <LineChart 
            data={chartData}
            margin={{ left: -12, right: 12, top: 12, bottom: 12 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickFormatter={(value: number) => `$${value}`}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <ChartTooltip
              content={<CustomTooltipContent />}
              cursor={<CustomCursor fill="#000" />}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              name="Actual"
            />
            <Line
              type="monotone"
              dataKey="projected"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, strokeWidth: 2 }}
              name="Projected"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Actual
          </Badge>
          <Badge variant="outline" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            Projected
          </Badge>
        </div>
        <Button variant="outline" size="sm">View Details</Button>
      </CardFooter>
    </Card>
  );
}

// Transactions Chart Component
function TransactionsChart() {
  const id = useId();
  
  // Transaction data for the last 12 months
  const chartData = [
    { month: "Jan 2025", revenues: 5000, churn: 1000 },
    { month: "Feb 2025", revenues: 7500, churn: 1200 },
    { month: "Mar 2025", revenues: 12000, churn: 1500 },
    { month: "Apr 2025", revenues: 14000, churn: 1800 },
    { month: "May 2025", revenues: 18000, churn: 2000 },
    { month: "Jun 2025", revenues: 22000, churn: 2200 },
    { month: "Jul 2025", revenues: 24000, churn: 2100 },
    { month: "Aug 2025", revenues: 26000, churn: 2300 },
    { month: "Sep 2025", revenues: 23000, churn: 2500 },
    { month: "Oct 2025", revenues: 25000, churn: 2400 },
    { month: "Nov 2025", revenues: 28000, churn: 2200 },
    { month: "Dec 2025", revenues: 32000, churn: 2000 },
  ];

  const chartConfig = {
    revenues: {
      label: "Revenues",
      color: "var(--chart-1)",
    },
    churn: {
      label: "Churn",
      color: "var(--chart-4)",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle>Transactions</CardTitle>
            <div className="flex items-start gap-2">
              <div className="font-semibold text-2xl">$237,650</div>
              <Badge className="mt-1.5 bg-emerald-500/24 text-emerald-500 border-none">
                +12.3%
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-xs bg-chart-1"
              ></div>
              <div className="text-[13px]/3 text-muted-foreground/50">
                Revenues
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-xs bg-chart-4"
              ></div>
              <div className="text-[13px]/3 text-muted-foreground/50">
                Churn
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-current/10"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: -12, right: 12, top: 12, bottom: 12 }}
          >
            <defs>
              <linearGradient id={`${id}-gradient`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--chart-2)" />
                <stop offset="100%" stopColor="var(--chart-1)" />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="2 2"
              stroke="var(--border)"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={12}
              tickFormatter={(value: string) => value.slice(0, 3)}
              stroke="var(--border)"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) => {
                if (value === 0) return "$0";
                return `$${value / 1000}k`;
              }}
              interval="preserveStartEnd"
            />
            <Line
              type="linear"
              dataKey="churn"
              stroke="var(--chart-4)"
              strokeWidth={2}
              dot={false}
              activeDot={false}
            />
            <ChartTooltip
              content={
                <CustomTooltipContent
                  colorMap={{
                    revenues: "var(--chart-1)",
                    churn: "var(--chart-4)",
                  }}
                  labelMap={{
                    revenues: "Revenues",
                    churn: "Churn",
                  }}
                  dataKeys={["revenues", "churn"]}
                  valueFormatter={(value: number) => `$${value.toLocaleString()}`}
                />
              }
              cursor={<CustomCursor fill="var(--chart-1)" />}
            />
            <Line
              type="linear"
              dataKey="revenues"
              stroke="url(#gradient)"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                strokeWidth: 0,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm">View Detailed Report</Button>
      </CardFooter>
    </Card>
  );
}