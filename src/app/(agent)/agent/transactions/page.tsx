import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { getTransactions } from "@/actions/transaction-actions-clean"
import { TransactionList } from "@/components/transactions/transaction-list"
import { createServerSupabaseClient } from "@/utils/supabase/server"

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

function SimpleCardContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

function SimpleButton({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <button className={`inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 ${className}`}>{children}</button>;
}

export const dynamic = 'force-dynamic'

export default async function TransactionsPage({
  searchParams = {}
}: {
  searchParams?: { status?: string; page?: string; search?: string }
}) {
  // Get the current user
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get query parameters
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined
  const limit = 10
  const offset = (page - 1) * limit

  // Fetch transactions for the current user
  const result = await getTransactions({
    agentId: user?.id,
    status,
    limit,
    offset,
    search
  })

  // Get transactions from the result
  const transactions = result.success ? result.data : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Transactions
        </h1>
        <Link href="/agent/transactions/new">
          <SimpleButton>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Transaction
          </SimpleButton>
        </Link>
      </div>

      <SimpleCard>
        <SimpleCardHeader>
          <SimpleCardTitle>Your Transactions</SimpleCardTitle>
        </SimpleCardHeader>
        <SimpleCardContent>
          <TransactionList transactions={transactions} />
        </SimpleCardContent>
      </SimpleCard>
    </div>
  )
}