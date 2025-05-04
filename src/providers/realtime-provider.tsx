'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { RealtimeChannel } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

interface RealTimeContextType {
  channels: Record<string, RealtimeChannel>
  subscribeToTable: (tableName: string, callback: (payload: any) => void) => void
  unsubscribeFromTable: (tableName: string) => void
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined)

export function RealTimeProvider({ children }: { children: ReactNode }) {
  const [channels, setChannels] = useState<Record<string, RealtimeChannel>>({})
  const [supabase, setSupabase] = useState<ReturnType<typeof createClientComponentClient<Database>> | null>(null)

  // Initialize Supabase client
  useEffect(() => {
    try {
      // Check if environment variables are available in the browser
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase environment variables are missing in RealTimeProvider')

        // In development, use placeholder values
        if (process.env.NODE_ENV === 'development') {
          const client = createClientComponentClient<Database>({
            supabaseUrl: 'https://placeholder-project.supabase.co',
            supabaseKey: 'placeholder-key-for-development-only'
          })
          setSupabase(client)
          return
        }

        console.error('Supabase environment variables are required in production')
        return
      }

      // Create the client with the available environment variables
      const client = createClientComponentClient<Database>({
        supabaseUrl,
        supabaseKey
      })
      setSupabase(client)
    } catch (error) {
      console.error('Error initializing Supabase client in RealTimeProvider:', error)

      // In development, create a fallback client
      if (process.env.NODE_ENV === 'development') {
        const client = createClientComponentClient<Database>({
          supabaseUrl: 'https://placeholder-project.supabase.co',
          supabaseKey: 'placeholder-key-for-development-only'
        })
        setSupabase(client)
      }
    }
  }, [])

  // Clean up all channels on unmount
  useEffect(() => {
    if (!supabase) return;

    return () => {
      Object.values(channels).forEach(channel => {
        supabase.removeChannel(channel)
      })
    }
  }, [channels, supabase])

  // Subscribe to a table's real-time changes
  const subscribeToTable = (tableName: string, callback: (payload: any) => void) => {
    if (!supabase) {
      console.warn('Cannot subscribe to table: Supabase client not initialized');
      return;
    }

    // If already subscribed to this table, remove the old channel
    if (channels[tableName]) {
      supabase.removeChannel(channels[tableName])
    }

    // Create a new channel for this table
    const channel = supabase
      .channel(`${tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName
        },
        callback
      )
      .subscribe()

    // Store the channel
    setChannels(prev => ({
      ...prev,
      [tableName]: channel
    }))
  }

  // Unsubscribe from a table's real-time changes
  const unsubscribeFromTable = (tableName: string) => {
    if (!supabase) {
      console.warn('Cannot unsubscribe from table: Supabase client not initialized');
      return;
    }

    if (channels[tableName]) {
      supabase.removeChannel(channels[tableName])
      setChannels(prev => {
        const newChannels = { ...prev }
        delete newChannels[tableName]
        return newChannels
      })
    }
  }

  return (
    <RealTimeContext.Provider value={{
      channels,
      subscribeToTable,
      unsubscribeFromTable
    }}>
      {children}
    </RealTimeContext.Provider>
  )
}

// Hook to use the real-time context
export function useRealTime() {
  const context = useContext(RealTimeContext)
  if (context === undefined) {
    throw new Error('useRealTime must be used within a RealTimeProvider')
  }
  return context
}