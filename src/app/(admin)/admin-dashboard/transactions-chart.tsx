"use client";

import { useId, useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { trpc } from "@/utils/trpc/client";
import { CustomCursor } from "./custom-cursor";

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

function SimpleCardContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

function SimpleCardFooter({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>;
}

function SimpleBadge({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>{children}</span>;
}

function SimpleButton({ children, variant = 'default', size = 'default', onClick, className = '' }: {
  children: React.ReactNode,
  variant?: 'default' | 'outline' | 'ghost',
  size?: 'default' | 'sm' | 'lg' | 'icon',
  onClick?: () => void,
  className?: string
}) {
  const sizeClasses = size === 'sm' ? 'h-9 px-3 text-xs' : 'px-4 py-2';
  const variantClasses = variant === 'outline' ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90';

  return <button onClick={onClick} className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${sizeClasses} ${variantClasses} ${className}`}>{children}</button>;
}

// Simple chart components
function SimpleChartContainer({ children, className = '', config = {} }: {
  children: React.ReactNode,
  className?: string,
  config?: any
}) {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function SimpleChartTooltip({ content, cursor }: { content: React.ReactNode, cursor?: React.ReactNode }) {
  return <Tooltip content={content} cursor={cursor} />;
}

// Simple custom tooltip content
function SimpleCustomTooltipContent({ active, payload, label, colorMap, labelMap, dataKeys, valueFormatter }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="font-medium">{label}</div>
      <div className="mt-1 flex flex-col gap-0.5">
        {dataKeys.map((key: string) => {
          const item = payload.find((p: any) => p.dataKey === key);
          if (!item || !item.value) return null;

          return (
            <div key={key} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <div className="size-2 rounded-full" style={{ backgroundColor: colorMap[key] }}></div>
                <span className="text-xs text-muted-foreground">{labelMap[key]}</span>
              </div>
              <span className="text-xs font-medium">
                {valueFormatter ? valueFormatter(item.value) : item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Define the type for the transaction data
interface Transaction {
  transaction_date: string;
  transaction_value: number;
}

interface TransactionData {
  recentTransactions: Transaction[];
}

// Define the type for the monthly data
interface MonthlyData {
  [key: string]: {
    revenues: number;
    churn: number;
  };
}

function TransactionsChart() {
  const id = useId();

  const { data: transactionData, isLoading } = trpc.transactions.getDashboardSummary.useQuery() as
    { data: TransactionData | undefined, isLoading: boolean };

  const chartData = useMemo(() => {
    if (!transactionData?.recentTransactions) return [];

    // Group transactions by month and calculate revenues
    const monthlyData: MonthlyData = transactionData.recentTransactions.reduce((acc: MonthlyData, transaction) => {
      const date = new Date(transaction.transaction_date);
      const month = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;

      if (!acc[month]) {
        acc[month] = { revenues: 0, churn: 0 };
      }

      acc[month].revenues += transaction.transaction_value || 0;
      return acc;
    }, {});

    // Convert to array format for chart
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenues: data.revenues,
      churn: data.churn || Math.round(data.revenues * 0.1) // Placeholder until real churn data
    }));
  }, [transactionData]);

  // Calculate total revenue and growth percentage
  const { totalRevenue, growthPercentage } = useMemo(() => {
    if (!chartData || chartData.length < 2) {
      return { totalRevenue: 0, growthPercentage: 0 };
    }

    // Calculate total revenue from all months
    const totalRevenue = chartData.reduce((sum, item) => sum + item.revenues, 0);

    // Calculate growth percentage by comparing the last two months
    const lastMonthRevenue = chartData[chartData.length - 1].revenues;
    const previousMonthRevenue = chartData[chartData.length - 2].revenues;

    let growthPercentage = 0;
    if (previousMonthRevenue > 0) {
      growthPercentage = ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    }

    return {
      totalRevenue,
      growthPercentage: parseFloat(growthPercentage.toFixed(1))
    };
  }, [chartData]);

  const chartConfig = {
    revenues: {
      label: "Revenues",
      color: "var(--chart-1)"
    },
    churn: {
      label: "Churn",
      color: "var(--chart-4)"
    }
  };

  if (isLoading) {
    return (
      <SimpleCard>
        <SimpleCardHeader className="flex flex-row items-center justify-between pb-2">
          <SimpleCardTitle className="text-base font-normal">Transaction Revenue & Churn</SimpleCardTitle>
        </SimpleCardHeader>
        <SimpleCardContent className="pb-2">
          <div className="h-60 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
          </div>
        </SimpleCardContent>
      </SimpleCard>
    );
  }

  return (
    <SimpleCard>
      <SimpleCardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <SimpleCardTitle>Transactions</SimpleCardTitle>
            <div className="flex items-start gap-2">
              <div className="font-semibold text-2xl">
                ${totalRevenue.toLocaleString()}
              </div>
              <SimpleBadge className={`mt-1.5 ${growthPercentage >= 0 ? 'bg-emerald-500/24 text-emerald-500' : 'bg-red-500/24 text-red-500'} border-none`}>
                {growthPercentage >= 0 ? '+' : ''}{growthPercentage}%
              </SimpleBadge>
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
      </SimpleCardHeader>
      <SimpleCardContent>
        <SimpleChartContainer
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
            <SimpleChartTooltip
              content={
                <SimpleCustomTooltipContent
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
        </SimpleChartContainer>
      </SimpleCardContent>
      <SimpleCardFooter>
        <SimpleButton
          variant="outline"
          size="sm"
          onClick={() => window.location.href = "/transactions"}
        >
          View Detailed Report
        </SimpleButton>
      </SimpleCardFooter>
    </SimpleCard>
  );
}

export { TransactionsChart };
export default TransactionsChart;