"use client"

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

// Simplified mock data
const mockAgents = [
  { 
    id: '1', 
    first_name: 'John', 
    last_name: 'Doe', 
    email: 'john@example.com',
    status: 'Active',
    team: 'Sales Team',
    transactionCount: 5,
    commissionYTD: 25000
  },
  { 
    id: '2', 
    first_name: 'Jane', 
    last_name: 'Smith', 
    email: 'jane@example.com',
    status: 'Active',
    team: 'Marketing Team',
    transactionCount: 3,
    commissionYTD: 15000
  }
];

export default function AgentsPage() {
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
                  {mockAgents.map((agent) => (
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {/* Similar content for active agents */}
          <Card>
            <CardContent className="p-4 text-center">
              Active agents will be displayed here
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          {/* Similar content for pending agents */}
          <Card>
            <CardContent className="p-4 text-center">
              Pending agents will be displayed here
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inactive" className="space-y-4">
          {/* Similar content for inactive agents */}
          <Card>
            <CardContent className="p-4 text-center">
              Inactive agents will be displayed here
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
