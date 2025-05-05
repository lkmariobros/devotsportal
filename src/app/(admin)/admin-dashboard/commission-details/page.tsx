"use client"

import { useState } from "react"
import { trpc } from "@/utils/trpc/client"
import { DownloadIcon, FilterIcon } from "lucide-react"
import { format } from "date-fns"
import { columns } from "./columns"
import { CommissionDetailsChart } from "./commission-details-chart"

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

function SimpleTabs({ children, defaultValue, value, onValueChange, className = '' }: {
  children: React.ReactNode,
  defaultValue?: string,
  value?: string,
  onValueChange?: (value: string) => void,
  className?: string
}) {
  return <div className={`w-full ${className}`}>{children}</div>;
}

function SimpleTabsList({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}>{children}</div>;
}

function SimpleTabsTrigger({ children, value, onClick, className = '' }: {
  children: React.ReactNode,
  value: string,
  onClick?: () => void,
  className?: string
}) {
  return <button onClick={onClick} className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm ${className}`}>{children}</button>;
}

function SimpleTabsContent({ children, value, className = '' }: {
  children: React.ReactNode,
  value: string,
  className?: string
}) {
  return <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}>{children}</div>;
}

function SimpleButton({ children, variant = 'default', size = 'default', onClick, className = '' }: {
  children: React.ReactNode,
  variant?: 'default' | 'outline' | 'ghost',
  size?: 'default' | 'sm' | 'lg' | 'icon',
  onClick?: () => void,
  className?: string
}) {
  const sizeClasses = size === 'icon' ? 'h-10 w-10 p-0' : 'px-4 py-2';
  const variantClasses = variant === 'outline' ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90';

  return <button onClick={onClick} className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${sizeClasses} ${variantClasses} ${className}`}>{children}</button>;
}

function SimpleDatePickerWithRange({ value, onChange }: {
  value: { from: Date | undefined; to: Date | undefined },
  onChange: (value: { from: Date | undefined; to: Date | undefined }) => void
}) {
  return (
    <div className="flex items-center space-x-2 rounded-md border p-2">
      <div className="grid gap-1">
        <div className="text-xs font-medium">Date Range</div>
        <div className="text-xs text-muted-foreground">
          {value.from ? format(value.from, 'LLL dd, y') : 'Pick a date'} -
          {value.to ? format(value.to, 'LLL dd, y') : 'Pick a date'}
        </div>
      </div>
    </div>
  );
}

function SimpleDataTable({ columns, data }: { columns: any[], data: any[] }) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((column, i) => (
              <th key={i} className="p-2 text-left text-sm font-medium">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b">
              {columns.map((column, j) => (
                <td key={j} className="p-2 text-sm">
                  {column.cell ? column.cell({ row: { getValue: () => row[column.accessorKey] } }) : row[column.accessorKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Define the filter type to fix type error
type FilterType = "all" | "pending" | "paid" | "projected"

export default function CommissionDetailsPage() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined
  })

  const [activeTab, setActiveTab] = useState<FilterType>("all")

  const { data, isLoading } = trpc.commissions.getCommissionDetails.useQuery({
    dateRange: dateRange.from && dateRange.to ? {
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString()
    } : undefined,
    filter: activeTab
  })

  const handleExport = () => {
    // Implementation for exporting commission data
    alert("Export functionality will be implemented")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commission Details</h1>
          <p className="text-muted-foreground">
            View and analyze your commission data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SimpleDatePickerWithRange
            value={dateRange}
            onChange={setDateRange}
          />
          <SimpleButton variant="outline" size="icon" onClick={handleExport}>
            <DownloadIcon className="h-4 w-4" />
          </SimpleButton>
        </div>
      </div>

      <SimpleTabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as FilterType)}>
        <SimpleTabsList>
          <SimpleTabsTrigger value="all" onClick={() => setActiveTab('all')}>All Commissions</SimpleTabsTrigger>
          <SimpleTabsTrigger value="pending" onClick={() => setActiveTab('pending')}>Pending</SimpleTabsTrigger>
          <SimpleTabsTrigger value="paid" onClick={() => setActiveTab('paid')}>Paid</SimpleTabsTrigger>
          <SimpleTabsTrigger value="projected" onClick={() => setActiveTab('projected')}>Projected</SimpleTabsTrigger>
        </SimpleTabsList>

        <SimpleTabsContent value={activeTab} className="space-y-6">
          <CommissionDetailsChart
            data={data?.chartData}
            isLoading={isLoading}
            filter={activeTab}
          />

          <SimpleCard>
            <SimpleCardHeader>
              <SimpleCardTitle>Commission Transactions</SimpleCardTitle>
              <SimpleCardDescription>
                {dateRange.from && dateRange.to
                  ? `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`
                  : "All time commission transactions"}
              </SimpleCardDescription>
            </SimpleCardHeader>
            <SimpleCardContent>
              {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="animate-pulse text-muted-foreground">Loading commission data...</div>
                </div>
              ) : (
                <SimpleDataTable
                  columns={columns}
                  data={data?.transactions || []}
                />
              )}
            </SimpleCardContent>
          </SimpleCard>
        </SimpleTabsContent>
      </SimpleTabs>
    </div>
  )
}
