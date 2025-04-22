"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { trpc } from "@/utils/trpc/client"
import { Skeleton } from "@/components/ui/skeleton"
import { RiSearchLine, RiAddLine, RiFilterLine } from "@remixicon/react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

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

  const { data: agentsData, isLoading } = trpc.users.getAgents.useQuery()
  
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
        <Button>
          <RiAddLine className="mr-2 h-4 w-4" />
          Add New Agent
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Agents</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        
        <div className="flex items-center justify-between mt-4">
          <div className="relative">
            <RiSearchLine className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search agents..."
              className="w-full pl-8 md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm">
            <RiFilterLine className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Commission YTD</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[180px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[60px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                      </TableRow>
                    ))
                  ) : paginatedAgents.length > 0 ? (
                    paginatedAgents.map((agent: Agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{`${agent.first_name} ${agent.last_name}`}</TableCell>
                        <TableCell>{agent.email}</TableCell>
                        <TableCell>
                          <Badge variant={getBadgeVariant(agent.status)}>
                            {agent.status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>{agent.team || 'Unassigned'}</TableCell>
                        <TableCell>{agent.transactionCount || 0}</TableCell>
                        <TableCell>${agent.commissionYTD?.toLocaleString() || '0'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`/admin/agents/${agent.id}`}>View</a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No agents found. Try adjusting your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {/* Similar content for active agents */}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          {/* Similar content for pending agents */}
        </TabsContent>
        
        <TabsContent value="inactive" className="space-y-4">
          {/* Similar content for inactive agents */}
        </TabsContent>
      </Tabs>
    </div>
  )
}