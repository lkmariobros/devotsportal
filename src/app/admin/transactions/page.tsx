import { Metadata } from "next"
import Link from "next/link"
import { getTransactions } from "@/actions/transaction-actions-clean"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"

export const metadata: Metadata = {
  title: "Transactions | Admin Portal",
  description: "View and manage property transactions",
}

export default async function TransactionsPage() {
  // Fetch transactions
  const { success, data: transactions, error } = await getTransactions()

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified'

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get market type display
  const getMarketTypeDisplay = (type: string) => {
    const marketTypes: Record<string, string> = {
      'primary': 'Primary',
      'secondary': 'Secondary',
      'rental': 'Rental'
    }
    return marketTypes[type] || type
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage property transactions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            {transactions?.length || 0} transaction(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!success ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Error loading transactions: {error}</p>
            </div>
          ) : transactions?.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Property</th>
                    <th className="text-left py-3 px-4 font-medium">Market</th>
                    <th className="text-left py-3 px-4 font-medium">Client</th>
                    <th className="text-left py-3 px-4 font-medium">Value</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions?.map((transaction: any) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{transaction.property_address}</p>
                          <p className="text-sm text-muted-foreground">{transaction.property_city}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p>{getMarketTypeDisplay(transaction.market_type)}</p>
                          <p className="text-sm text-muted-foreground">{transaction.market_subcategory}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p>{transaction.primary_client_name || transaction.client_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.primary_client_type || transaction.client_type}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {formatCurrency(transaction.transaction_value)}
                      </td>
                      <td className="py-3 px-4">
                        {formatDate(transaction.transaction_date)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(transaction.status || 'pending')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/transactions/${transaction.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
