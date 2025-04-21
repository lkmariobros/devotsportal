'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { trpc } from '@/utils/trpc/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface TransactionRecord {
  id: string
  [key: string]: any
}

export function useRealTimeTransactions(initialTransactions: any[] = []) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const utils = trpc.useUtils()
  const supabase = createBrowserClient()
  
  useEffect(() => {
    // Set initial transactions if provided
    if (initialTransactions.length > 0) {
      setTransactions(initialTransactions)
    }
    
    // Subscribe to changes in the property_transactions table
    const channel = supabase
      .channel('property_transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'property_transactions'
        },
        async (payload: RealtimePostgresChangesPayload<{
          id: string
          [key: string]: any
        }>) => {
          console.log('Real-time update received:', payload)
          
          // Invalidate the transactions query to refetch data
          utils.transactions.getAllTransactions.invalidate()
          
          // If you want to update the state directly without refetching:
          if (payload.eventType === 'INSERT') {
            // Fetch the complete transaction data with relations
            const { data } = await supabase
              .from('property_transactions')
              .select(`
                *,
                transaction_types(name),
                properties(address, city, state),
                profiles(first_name, last_name, email)
              `)
              .eq('id', payload.new.id)
              .single()
            
            if (data) {
              setTransactions(prev => [data, ...prev])
            }
          } else if (payload.eventType === 'UPDATE') {
            setTransactions(prev => 
              prev.map(transaction => 
                transaction.id === payload.new.id 
                  ? { ...transaction, ...payload.new } 
                  : transaction
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setTransactions(prev => 
              prev.filter(transaction => transaction.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()
    
    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [utils, initialTransactions])
  
  return transactions
}