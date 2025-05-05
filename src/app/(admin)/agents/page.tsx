"use client"

import { useState } from "react"
import { trpc } from "@/utils/trpc/client"
import { RiSearchLine, RiAddLine, RiFilterLine } from "@remixicon/react"

// Simple UI components to avoid import issues
function SimpleButton({ children, variant = 'default', size = 'default', asChild, onClick, className = '' }: {
  children: React.ReactNode,
  variant?: 'default' | 'outline' | 'ghost',
  size?: 'default' | 'sm' | 'lg' | 'icon',
  asChild?: boolean,
  onClick?: () => void,
  className?: string
}) {
  const sizeClasses = size === 'sm' ? 'h-9 px-3 text-xs' : 'px-4 py-2';
  const variantClasses =
    variant === 'outline' ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' :
    variant === 'ghost' ? 'hover:bg-accent hover:text-accent-foreground' :
    'bg-primary text-primary-foreground hover:bg-primary/90';

  return asChild ? (
    <div className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${sizeClasses} ${variantClasses} ${className}`}>{children}</div>
  ) : (
    <button onClick={onClick} className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${sizeClasses} ${variantClasses} ${className}`}>{children}</button>
  );
}

function SimpleCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>;
}

function SimpleCardContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

function SimpleInput({ type = 'text', placeholder, value, onChange, className = '' }: {
  type?: string,
  placeholder?: string,
  value?: string,
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
  className?: string
}) {
  return <input type={type} placeholder={placeholder} value={value} onChange={onChange} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} />;
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

function SimpleTable({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`w-full overflow-auto ${className}`}><table className="w-full caption-bottom text-sm">{children}</table></div>;
}

function SimpleTableHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <thead className={`[&_tr]:border-b ${className}`}>{children}</thead>;
}

function SimpleTableBody({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <tbody className={`[&_tr:last-child]:border-0 ${className}`}>{children}</tbody>;
}

function SimpleTableRow({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}>{children}</tr>;
}

function SimpleTableHead({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</th>;
}

function SimpleTableCell({ children, colSpan, className = '' }: {
  children: React.ReactNode,
  colSpan?: number,
  className?: string
}) {
  return <td colSpan={colSpan} className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</td>;
}

function SimpleBadge({ children, variant = 'default', className = '' }: {
  children: React.ReactNode,
  variant?: 'default' | 'secondary' | 'outline',
  className?: string
}) {
  const variantClasses =
    variant === 'secondary' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' :
    variant === 'outline' ? 'border-border text-foreground hover:bg-accent hover:text-accent-foreground' :
    'bg-primary text-primary-foreground hover:bg-primary/80';

  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantClasses} ${className}`}>{children}</span>;
}

function SimpleSkeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`}></div>;
}

function SimplePagination({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <nav className={`mx-auto flex w-full justify-center ${className}`}>{children}</nav>;
}

function SimplePaginationContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`flex flex-row items-center gap-1 ${className}`}>{children}</div>;
}

function SimplePaginationItem({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={className}>{children}</div>;
}

function SimplePaginationLink({ children, isActive, onClick, className = '' }: {
  children: React.ReactNode,
  isActive?: boolean,
  onClick?: () => void,
  className?: string
}) {
  return <button onClick={onClick} className={`h-9 min-w-9 items-center justify-center rounded-md border border-input bg-background p-0 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${isActive ? 'bg-accent text-accent-foreground' : ''} ${className}`}>{children}</button>;
}

function SimplePaginationPrevious({ onClick, className = '' }: { onClick?: () => void, className?: string }) {
  return <button onClick={onClick} className={`h-9 min-w-9 items-center justify-center rounded-md border border-input bg-background p-0 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}>Previous</button>;
}

function SimplePaginationNext({ onClick, className = '' }: { onClick?: () => void, className?: string }) {
  return <button onClick={onClick} className={`h-9 min-w-9 items-center justify-center rounded-md border border-input bg-background p-0 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}>Next</button>;
}

// Define the agent type to match the actual structure
interface Agent {
  id: any
  first_name: any
  last_name: any
  email: any
  status?: string
  team?: string
  transactionCount?: number
  commissionYTD?: number
}

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const { data: agentsData, isLoading: isAgentsLoading } = trpc.users.getAgents.useQuery({
    search: "",
    status: "",
    teamId: undefined,
    limit: 10,
    offset: 0
  })

  // Filter agents based on search query
  const filteredAgents = agentsData?.agents.filter((agent: Agent) =>
    `${agent.first_name} ${agent.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  // Pagination logic
  const totalPages = Math.ceil((filteredAgents.length || 0) / pageSize)
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Helper function to get badge variant
  const getBadgeVariant = (status?: string) => {
    if (status === 'Active') return "default"
    if (status === 'Pending') return "secondary"
    return "outline"
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Agent Management</h2>
        <SimpleButton>
          <RiAddLine className="mr-2 h-4 w-4" />
          Add New Agent
        </SimpleButton>
      </div>

      <SimpleTabs defaultValue="all" className="space-y-4">
        <SimpleTabsList>
          <SimpleTabsTrigger value="all">All Agents</SimpleTabsTrigger>
          <SimpleTabsTrigger value="active">Active</SimpleTabsTrigger>
          <SimpleTabsTrigger value="pending">Pending</SimpleTabsTrigger>
          <SimpleTabsTrigger value="inactive">Inactive</SimpleTabsTrigger>
        </SimpleTabsList>

        <div className="flex items-center justify-between mt-4">
          <div className="relative">
            <RiSearchLine className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <SimpleInput
              type="search"
              placeholder="Search agents..."
              className="w-full pl-8 md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <SimpleButton variant="outline" size="sm">
            <RiFilterLine className="mr-2 h-4 w-4" />
            Filter
          </SimpleButton>
        </div>

        <SimpleTabsContent value="all" className="space-y-4">
          <SimpleCard>
            <SimpleCardContent className="p-0">
              <SimpleTable>
                <SimpleTableHeader>
                  <SimpleTableRow>
                    <SimpleTableHead>Name</SimpleTableHead>
                    <SimpleTableHead>Email</SimpleTableHead>
                    <SimpleTableHead>Status</SimpleTableHead>
                    <SimpleTableHead>Team</SimpleTableHead>
                    <SimpleTableHead>Transactions</SimpleTableHead>
                    <SimpleTableHead>Commission YTD</SimpleTableHead>
                    <SimpleTableHead className="text-right">Actions</SimpleTableHead>
                  </SimpleTableRow>
                </SimpleTableHeader>
                <SimpleTableBody>
                  {isAgentsLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <SimpleTableRow key={i}>
                        <SimpleTableCell><SimpleSkeleton className="h-6 w-[150px]" /></SimpleTableCell>
                        <SimpleTableCell><SimpleSkeleton className="h-6 w-[180px]" /></SimpleTableCell>
                        <SimpleTableCell><SimpleSkeleton className="h-6 w-[80px]" /></SimpleTableCell>
                        <SimpleTableCell><SimpleSkeleton className="h-6 w-[100px]" /></SimpleTableCell>
                        <SimpleTableCell><SimpleSkeleton className="h-6 w-[60px]" /></SimpleTableCell>
                        <SimpleTableCell><SimpleSkeleton className="h-6 w-[100px]" /></SimpleTableCell>
                        <SimpleTableCell><SimpleSkeleton className="h-6 w-[80px]" /></SimpleTableCell>
                      </SimpleTableRow>
                    ))
                  ) : paginatedAgents.length > 0 ? (
                    paginatedAgents.map((agent: Agent) => (
                      <SimpleTableRow key={agent.id}>
                        <SimpleTableCell className="font-medium">{`${agent.first_name} ${agent.last_name}`}</SimpleTableCell>
                        <SimpleTableCell>{agent.email}</SimpleTableCell>
                        <SimpleTableCell>
                          <SimpleBadge variant={getBadgeVariant(agent.status)}>
                            {agent.status || 'Unknown'}
                          </SimpleBadge>
                        </SimpleTableCell>
                        <SimpleTableCell>{agent.team || 'Unassigned'}</SimpleTableCell>
                        <SimpleTableCell>{agent.transactionCount || 0}</SimpleTableCell>
                        <SimpleTableCell>${agent.commissionYTD?.toLocaleString() || '0'}</SimpleTableCell>
                        <SimpleTableCell className="text-right">
                          <SimpleButton variant="ghost" size="sm" asChild>
                            <a href={`/admin/agents/${agent.id}`}>View</a>
                          </SimpleButton>
                        </SimpleTableCell>
                      </SimpleTableRow>
                    ))
                  ) : (
                    <SimpleTableRow>
                      <SimpleTableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No agents found. Try adjusting your search.
                      </SimpleTableCell>
                    </SimpleTableRow>
                  )}
                </SimpleTableBody>
              </SimpleTable>
            </SimpleCardContent>
          </SimpleCard>

          {totalPages > 1 && (
            <SimplePagination>
              <SimplePaginationContent>
                <SimplePaginationItem>
                  <SimplePaginationPrevious
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </SimplePaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <SimplePaginationItem key={i}>
                    <SimplePaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </SimplePaginationLink>
                  </SimplePaginationItem>
                ))}

                <SimplePaginationItem>
                  <SimplePaginationNext
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </SimplePaginationItem>
              </SimplePaginationContent>
            </SimplePagination>
          )}
        </SimpleTabsContent>

        <SimpleTabsContent value="active" className="space-y-4">
          {/* Similar content for active agents */}
        </SimpleTabsContent>

        <SimpleTabsContent value="pending" className="space-y-4">
          {/* Similar content for pending agents */}
        </SimpleTabsContent>

        <SimpleTabsContent value="inactive" className="space-y-4">
          {/* Similar content for inactive agents */}
        </SimpleTabsContent>
      </SimpleTabs>
    </div>
  )
}