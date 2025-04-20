"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { StatsEmptyState } from "./stats-empty-state";
import { Skeleton } from "@/components/ui/skeleton";

interface StatItem {
  title: string;
  value: string;
  change?: {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  icon?: ReactNode;
}

interface GenericStatsGridProps {
  stats?: StatItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function GenericStatsGrid({ 
  stats = [], 
  isLoading = false,
  onRefresh,
  className 
}: GenericStatsGridProps) {
  // Show skeleton UI when loading
  if (isLoading) {
    return (
      <div className={cn("grid gap-4", getGridCols(4), className)}>
        {Array.from({ length: 4 }).map((_, index) => (
          <StatSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Show empty state when no stats
  if (!stats.length) {
    return <StatsEmptyState onRefresh={onRefresh} className={className} />;
  }

  // Show stats grid
  return (
    <div className={cn("grid gap-4", getGridCols(stats.length), className)}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex flex-col gap-1 rounded-lg border bg-card p-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              {stat.icon && (
                <div className="flex h-5 w-5 items-center text-foreground">
                  {stat.icon}
                </div>
              )}
              <div>{stat.title}</div>
            </div>
            {stat.change && (
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium",
                  stat.change.trend === "up"
                    ? "bg-success/10 text-success"
                    : stat.change.trend === "down"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {stat.change.trend === "up" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : stat.change.trend === "down" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : null}
                <span>{stat.change.value}</span>
              </div>
            )}
          </div>
          <div className="text-2xl font-bold">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}

// Skeleton component for loading state
function StatSkeleton() {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="h-8 w-20 mt-1" />
    </div>
  );
}

// Helper function to determine grid columns based on number of stats
function getGridCols(count: number): string {
  switch (count) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-1 sm:grid-cols-2";
    case 3:
      return "grid-cols-1 sm:grid-cols-3";
    case 4:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    case 5:
    case 6:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    default:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  }
}