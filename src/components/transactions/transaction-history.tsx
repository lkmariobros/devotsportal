"use client"

import { trpc } from "@/utils/trpc/client"
import { Skeleton } from "@/components/ui/skeleton"

interface AuditLog {
  id: string
  action: string
  created_at: string
  user?: {
    name: string
  }
}

function TransactionHistory({ transactionId }: { transactionId: string }) {
  const { data: auditLogs, isLoading } = trpc.admin.getTransactionAuditLogs.useQuery({ 
    transactionId 
  })
  
  if (isLoading) return <Skeleton className="h-40 w-full" />
  
  return (
    <div className="space-y-4">
      {auditLogs?.length ? (
        <div className="space-y-2">
          {auditLogs.map((log: AuditLog) => (
            <div key={log.id} className="flex justify-between p-3 border rounded-md">
              <div>
                <p className="font-medium">{log.action}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm">{log.user?.name || 'System'}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No history available</p>
      )}
    </div>
  )
}

export { TransactionHistory }