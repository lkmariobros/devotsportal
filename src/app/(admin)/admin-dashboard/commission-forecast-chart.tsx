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
import { CustomCursor } from "./custom-cursor";
import { useRouter } from "next/navigation";

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

function SimpleBadge({ children, className = '', variant = 'default' }: {
  children: React.ReactNode,
  className?: string,
  variant?: 'default' | 'outline'
}) {
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

export function CommissionForecastChart({ data, isLoading, filter = "all" }: CommissionForecastProps) {
  const id = useId();
  const router = useRouter();

  const filteredData = useMemo(() => {
    if (!data) return null;

    return {
      historical: data.historical,
      forecast: data.forecast,
      summary: data.summary
    };
  }, [data, filter]);

  const chartData = useMemo(() => {
    const result = filteredData?.historical?.map((month) => ({
      month: new Date(month.date).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      }),
      actual: month.commissionAmount,
      projected: 0
    })) || [];

    if (filteredData?.forecast) {
      filteredData.forecast.forEach((month) => {
        result.push({
          month: new Date(month.date).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
          }),
          actual: 0,
          projected: month.projectedCommissionAmount
        });
      });
    }

    return result;
  }, [filteredData]);

  // Calculate summary data if not provided
  const summaryData = useMemo(() => {
    if (filteredData?.summary) return filteredData.summary;

    const totalHistorical = chartData.reduce((sum, item) => sum + (item.actual || 0), 0);
    const historicalMonths = chartData.filter(item => item.actual > 0).length;
    const avgMonthly = historicalMonths > 0 ? totalHistorical / historicalMonths : 0;
    const forecastTotal = chartData.reduce((sum, item) => sum + (item.projected || 0), 0);

    return {
      totalHistoricalCommission: totalHistorical,
      avgMonthlyCommission: avgMonthly,
      forecastTotal: forecastTotal
    };
  }, [chartData, filteredData]);

  const handleViewDetails = () => {
    router.push("/admin-dashboard/commission-details");
  };

  if (isLoading) {
    return (
      <SimpleCard>
        <SimpleCardHeader className="flex flex-row items-center justify-between pb-2">
          <SimpleCardTitle className="text-base font-normal">Commission Forecast</SimpleCardTitle>
        </SimpleCardHeader>
        <SimpleCardContent className="pb-2">
          <div className="h-60 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading forecast data...</div>
          </div>
        </SimpleCardContent>
      </SimpleCard>
    );
  }

  return (
    <SimpleCard>
      <SimpleCardHeader>
        <SimpleCardTitle>Commission Forecast</SimpleCardTitle>
        <SimpleCardDescription>Historical and projected commission earnings</SimpleCardDescription>
      </SimpleCardHeader>
      <SimpleCardContent>
        {summaryData && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Historical Total</p>
              <p className="text-xl font-semibold">${summaryData.totalHistoricalCommission.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Monthly Average</p>
              <p className="text-xl font-semibold">${summaryData.avgMonthlyCommission.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Forecast Total</p>
              <p className="text-xl font-semibold">${summaryData.forecastTotal.toLocaleString()}</p>
            </div>
          </div>
        )}
        <SimpleChartContainer
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
            <SimpleChartTooltip
              content={<SimpleCustomTooltipContent
                colorMap={{
                  actual: "#0ea5e9",
                  projected: "#f59e0b"
                }}
                labelMap={{
                  actual: "Actual",
                  projected: "Projected"
                }}
                dataKeys={["actual", "projected"]}
                valueFormatter={(value: number) => `$${value.toLocaleString()}`}
              />}
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
        </SimpleChartContainer>
      </SimpleCardContent>
      <SimpleCardFooter className="flex justify-between">
        <div className="flex items-center gap-2">
          <SimpleBadge variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Actual
          </SimpleBadge>
          <SimpleBadge variant="outline" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            Projected
          </SimpleBadge>
        </div>
        <SimpleButton variant="outline" size="sm" onClick={handleViewDetails}>
          View Details
        </SimpleButton>
      </SimpleCardFooter>
    </SimpleCard>
  );
}