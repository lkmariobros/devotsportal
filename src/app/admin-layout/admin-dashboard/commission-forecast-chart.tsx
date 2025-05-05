"use client";

import { useId, useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/reusable-ui/chart";
import { CustomTooltipContent } from "@/components/reusable-ui/charts-extra";
import { CustomCursor } from "./custom-cursor";
import { useRouter } from "next/navigation";

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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-normal">Commission Forecast</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="h-60 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading forecast data...</div>
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
              content={<CustomTooltipContent 
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
        <Button variant="outline" size="sm" onClick={handleViewDetails}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}