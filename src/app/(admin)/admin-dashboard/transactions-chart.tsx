"use client";

import { useId, useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc/client";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/reusable-ui/chart";
import { CustomTooltipContent } from "@/components/reusable-ui/charts-extra";
import { CustomCursor } from "./custom-cursor";

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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-normal">Transaction Revenue & Churn</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="h-60 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle>Transactions</CardTitle>
            <div className="flex items-start gap-2">
              <div className="font-semibold text-2xl">
                ${totalRevenue.toLocaleString()}
              </div>
              <Badge className={`mt-1.5 ${growthPercentage >= 0 ? 'bg-emerald-500/24 text-emerald-500' : 'bg-red-500/24 text-red-500'} border-none`}>
                {growthPercentage >= 0 ? '+' : ''}{growthPercentage}%
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
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.location.href = "/transactions"}
        >
          View Detailed Report
        </Button>
      </CardFooter>
    </Card>
  );
}

export { TransactionsChart };
export default TransactionsChart;