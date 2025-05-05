"use client"

import { useState } from "react"
import { trpc } from "@/utils/trpc/client"
import { RiSearchLine, RiAddLine, RiTeamLine, RiUserLine } from "@remixicon/react"

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

function SimpleCardHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
}

function SimpleCardTitle({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
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

function SimplePaginationPrevious({ onClick, isDisabled, className = '' }: {
  onClick?: () => void,
  isDisabled?: boolean,
  className?: string
}) {
  return <button onClick={onClick} disabled={isDisabled} className={`h-9 min-w-9 items-center justify-center rounded-md border border-input bg-background p-0 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}>Previous</button>;
}

function SimplePaginationNext({ onClick, isDisabled, className = '' }: {
  onClick?: () => void,
  isDisabled?: boolean,
  className?: string
}) {
  return <button onClick={onClick} disabled={isDisabled} className={`h-9 min-w-9 items-center justify-center rounded-md border border-input bg-background p-0 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}>Next</button>;
}

export default function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Mock data - replace with actual trpc query when available
  const { data: teamsData, isLoading } = {
    data: {
      teams: [
        { id: "1", name: "Elite Performers", leadName: "John Smith", memberCount: 12, transactionCount: 87, totalRevenue: 1250000 },
        { id: "2", name: "Rising Stars", leadName: "Sarah Johnson", memberCount: 8, transactionCount: 54, totalRevenue: 780000 },
        { id: "3", name: "Coastal Group", leadName: "Michael Brown", memberCount: 15, transactionCount: 102, totalRevenue: 1650000 },
        { id: "4", name: "Downtown Specialists", leadName: "Emily Davis", memberCount: 6, transactionCount: 41, totalRevenue: 620000 },
        { id: "5", name: "Luxury Division", leadName: "Robert Wilson", memberCount: 9, transactionCount: 63, totalRevenue: 2100000 },
      ]
    },
    isLoading: false
  }

  // Filter teams based on search query
  const filteredTeams = teamsData?.teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.leadName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  // Pagination logic
  const totalPages = Math.ceil((filteredTeams.length || 0) / pageSize)
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Team Management</h2>
        <SimpleButton>
          <RiAddLine className="mr-2 h-4 w-4" />
          Create New Team
        </SimpleButton>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SimpleCard>
          <SimpleCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SimpleCardTitle className="text-sm font-medium">Total Teams</SimpleCardTitle>
            <RiTeamLine className="h-4 w-4 text-muted-foreground" />
          </SimpleCardHeader>
          <SimpleCardContent>
            <div className="text-2xl font-bold">{teamsData?.teams.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active team roster</p>
          </SimpleCardContent>
        </SimpleCard>

        <SimpleCard>
          <SimpleCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SimpleCardTitle className="text-sm font-medium">Total Agents</SimpleCardTitle>
            <RiUserLine className="h-4 w-4 text-muted-foreground" />
          </SimpleCardHeader>
          <SimpleCardContent>
            <div className="text-2xl font-bold">
              {teamsData?.teams.reduce((sum, team) => sum + team.memberCount, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Across all teams</p>
          </SimpleCardContent>
        </SimpleCard>

        <SimpleCard>
          <SimpleCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SimpleCardTitle className="text-sm font-medium">Total Transactions</SimpleCardTitle>
            <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" /></svg>
          </SimpleCardHeader>
          <SimpleCardContent>
            <div className="text-2xl font-bold">
              {teamsData?.teams.reduce((sum, team) => sum + team.transactionCount, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Year to date</p>
          </SimpleCardContent>
        </SimpleCard>

        <SimpleCard>
          <SimpleCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SimpleCardTitle className="text-sm font-medium">Total Revenue</SimpleCardTitle>
            <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          </SimpleCardHeader>
          <SimpleCardContent>
            <div className="text-2xl font-bold">
              ${(teamsData?.teams.reduce((sum, team) => sum + team.totalRevenue, 0) || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Year to date</p>
          </SimpleCardContent>
        </SimpleCard>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Teams List</h3>
        <div className="relative">
          <RiSearchLine className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <SimpleInput
            type="search"
            placeholder="Search teams..."
            className="w-full pl-8 md:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <SimpleCard>
        <SimpleCardContent className="p-0">
          <SimpleTable>
            <SimpleTableHeader>
              <SimpleTableRow>
                <SimpleTableHead>Team Name</SimpleTableHead>
                <SimpleTableHead>Team Lead</SimpleTableHead>
                <SimpleTableHead>Members</SimpleTableHead>
                <SimpleTableHead>Transactions</SimpleTableHead>
                <SimpleTableHead>Revenue</SimpleTableHead>
                <SimpleTableHead className="text-right">Actions</SimpleTableHead>
              </SimpleTableRow>
            </SimpleTableHeader>
            <SimpleTableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <SimpleTableRow key={i}>
                    <SimpleTableCell><SimpleSkeleton className="h-6 w-[150px]" /></SimpleTableCell>
                    <SimpleTableCell><SimpleSkeleton className="h-6 w-[120px]" /></SimpleTableCell>
                    <SimpleTableCell><SimpleSkeleton className="h-6 w-[60px]" /></SimpleTableCell>
                    <SimpleTableCell><SimpleSkeleton className="h-6 w-[80px]" /></SimpleTableCell>
                    <SimpleTableCell><SimpleSkeleton className="h-6 w-[100px]" /></SimpleTableCell>
                    <SimpleTableCell><SimpleSkeleton className="h-6 w-[80px]" /></SimpleTableCell>
                  </SimpleTableRow>
                ))
              ) : paginatedTeams.length > 0 ? (
                paginatedTeams.map((team) => (
                  <SimpleTableRow key={team.id}>
                    <SimpleTableCell className="font-medium">{team.name}</SimpleTableCell>
                    <SimpleTableCell>{team.leadName}</SimpleTableCell>
                    <SimpleTableCell>{team.memberCount}</SimpleTableCell>
                    <SimpleTableCell>{team.transactionCount}</SimpleTableCell>
                    <SimpleTableCell>${team.totalRevenue.toLocaleString()}</SimpleTableCell>
                    <SimpleTableCell className="text-right">
                      <SimpleButton variant="ghost" size="sm" asChild>
                        <a href={`/admin/teams/${team.id}`}>View</a>
                      </SimpleButton>
                    </SimpleTableCell>
                  </SimpleTableRow>
                ))
              ) : (
                <SimpleTableRow>
                  <SimpleTableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No teams found. Try adjusting your search.
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
                isDisabled={currentPage === 1}
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
                isDisabled={currentPage === totalPages}
              />
            </SimplePaginationItem>
          </SimplePaginationContent>
        </SimplePagination>
      )}
    </div>
  )
}