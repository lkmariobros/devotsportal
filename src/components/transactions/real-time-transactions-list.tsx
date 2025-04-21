'use client'

import { useRealTimeTransactions } from '@/hooks/use-real-time-transactions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

interface RealTimeTransactionsListProps {
  initialTransactions: any[]
}

export function RealTimeTransactionsList({ initialTransactions }: RealTimeTransactionsListProps) {
  const transactions = useRealTimeTransactions(initialTransactions)
  const router = useRouter()
  
  function getStatusBadge(status: string) {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline">Pending</Badge>
      case 'Approved':
        return <Badge>Approved</Badge>
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }
  
  return (
    <div className="space-y-4">
      {transactions.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          No transactions found
        </Card>
      ) : (
        transactions.map((transaction) => (
          <Card key={transaction.id} className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">
                    {transaction.properties?.address || 'Unknown Property'}
                  </h3>
                  {getStatusBadge(transaction.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {transaction.transaction_types?.name || 'Unknown Type'} • 
                  {formatDate(transaction.transaction_date)}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(transaction.transaction_value)}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.profiles?.first_name} {transaction.profiles?.last_name}
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/transactions/${transaction.id}`)}
                >
                  View
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}