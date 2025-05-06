"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { RiSearchLine, RiFilterLine } from "@remixicon/react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Mock data for transactions
const mockTransactions = [
  {
    id: "1",
    reference: "TX-001",
    propertyAddress: "123 Main St, Kuala Lumpur",
    clientName: "John Doe",
    agentName: "Jane Smith",
    status: "Pending",
    submissionDate: "2023-05-15",
    amount: 500000,
  },
  {
    id: "2",
    reference: "TX-002",
    propertyAddress: "456 Park Ave, Petaling Jaya",
    clientName: "Alice Johnson",
    agentName: "Bob Brown",
    status: "Approved",
    submissionDate: "2023-05-10",
    amount: 750000,
  },
];

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Helper function to get badge variant based on status
  const getBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "success"
      case "pending":
        return "warning"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Format currency as MYR
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full md:w-auto">
          <RiSearchLine className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search transactions..."
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

      <Card>
        <CardHeader className="py-4">
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.reference}</TableCell>
                  <TableCell>{transaction.propertyAddress}</TableCell>
                  <TableCell>{transaction.clientName}</TableCell>
                  <TableCell>{transaction.agentName}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.submissionDate}</TableCell>
                  <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/admin/transactions/${transaction.id}`}>View</a>
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
    </div>
  )
}
