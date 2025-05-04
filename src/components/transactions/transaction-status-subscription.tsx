"use client"

import { useEffect, useState } from "react"
import { createClientSupabaseClient } from "@/utils/supabase/client"
import { Badge } from "@/components/ui/badge"

interface TransactionStatusSubscriptionProps {
  transactionId: string
  initialStatus: string
}

export function TransactionStatusSubscription({
  transactionId,
  initialStatus
}: TransactionStatusSubscriptionProps) {
  const [status, setStatus] = useState<string>(initialStatus)
  const [isLive, setIsLive] = useState<boolean>(false)
  
  useEffect(() => {
    const supabase = createClientSupabaseClient()
    
    // Subscribe to changes
    const subscription = supabase
      .channel(`transaction-${transactionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'property_transactions',
        filter: `id=eq.${transactionId}`
      }, (payload) => {
        // Update status if it changed
        if (payload.new.status !== status) {
          setStatus(payload.new.status)
          setIsLive(true)
          
          // Reset live indicator after 3 seconds
          setTimeout(() => {
            setIsLive(false)
          }, 3000)
        }
      })
      .subscribe()
    
    // Cleanup
    return () => {
      subscription.unsubscribe()
    }
  }, [transactionId, status])
  
  // Get badge variant based on status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success'
      case 'Rejected':
        return 'destructive'
      case 'Pending':
        return 'warning'
      case 'Completed':
        return 'default'
      default:
        return 'secondary'
    }
  }
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant={getBadgeVariant(status) as any}>
        {status}
      </Badge>
      {isLive && (
        <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" 
              title="Status updated in real-time" />
      )}
    </div>
  )
}
