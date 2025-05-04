"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateField, DateInput } from "@/components/ui/datefield-rac"
import { parseDate, DateValue } from "@internationalized/date"
import { trpc } from "@/utils/trpc/client"
import { RiSearchLine, RiFilterLine, RiCloseLine } from "@remixicon/react"
import { createClient } from "@supabase/supabase-js"

// Define agent type to fix the implicit any error
interface Agent {
  id: string
  first_name: string
  last_name: string
}

export function TransactionsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get initial values from URL
  const [status, setStatus] = useState(searchParams.get("status") || "")
  const [agentId, setAgentId] = useState(searchParams.get("agentId") || "")
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "")
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "")
  const [search, setSearch] = useState(searchParams.get("search") || "")

  // Get agents for dropdown
  const { data: agentsData } = trpc.users.getAgents.useQuery({
    search: "",
    status: "",
    teamId: undefined,
    limit: 100,
    offset: 0
  })
  const agents = agentsData?.agents || []

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams()

    if (status) params.set("status", status)
    if (agentId) params.set("agentId", agentId)
    if (startDate) params.set("startDate", startDate)
    if (endDate) params.set("endDate", endDate)
    if (search) params.set("search", search)

    router.push(`/transactions?${params.toString()}`)
  }

  // Reset filters
  const resetFilters = () => {
    setStatus("")
    setAgentId("")
    setStartDate("")
    setEndDate("")
    setSearch("")
    router.push("/transactions")
  }

  // Handle search on enter key
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      applyFilters()
    }
  }

  // Set up real-time updates
  const utils = trpc.useUtils()

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const channel = supabase
      .channel('public:transactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          // Invalidate or refetch your transaction list query here
          utils.transactions.getAllTransactions.invalidate()
        }
      )
      .subscribe()
    return () => {
      channel.unsubscribe()
    }
  }, [utils])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={agentId} onValueChange={setAgentId}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Agents</SelectItem>
              {agents.map((agent: Agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.first_name} {agent.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="w-[140px]">
            <DateField
              aria-label="Start Date"
              value={startDate ? parseDate(startDate) : undefined}
              onChange={(date: DateValue | null) => setStartDate(date ? date.toString() : "")}
            >
              <DateInput />
            </DateField>
          </div>

          <div className="w-[140px]">
            <DateField
              aria-label="End Date"
              value={endDate ? parseDate(endDate) : undefined}
              onChange={(date: DateValue | null) => setEndDate(date ? date.toString() : "")}
            >
              <DateInput />
            </DateField>
          </div>

          <Button onClick={applyFilters} size="icon" variant="outline">
            <RiFilterLine className="h-4 w-4" />
            <span className="sr-only">Apply Filters</span>
          </Button>

          <Button onClick={resetFilters} size="icon" variant="outline">
            <RiCloseLine className="h-4 w-4" />
            <span className="sr-only">Reset Filters</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
