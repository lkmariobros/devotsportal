import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { transactionsRouter } from './transactions'
import { usersRouter } from './user'
import { documentsRouter } from './documents'
import { notificationsRouter } from './notifications'
import { createTRPCContext } from '../trpc'

export const appRouter = router({
  transactions: transactionsRouter,
  users: usersRouter,
  documents: documentsRouter,
  notifications: notificationsRouter,
  
  // Get all commissions
  getAllCommissions: adminProcedure
    .input(z.object({
      status: z.string().optional(),
      agentId: z.string().uuid().optional(),
      limit: z.number().min(1).max(100).default(10),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx
      const { status, agentId, limit, offset } = input
      
      let query = supabase
        .from('commissions')
        .select(`
          *,
          property_transactions(id, transaction_date, transaction_value),
          profiles(first_name, last_name, email)
        `, { count: 'exact' })
      
      if (status) query = query.eq('status', status)
      if (agentId) query = query.eq('agent_id', agentId)
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
        
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }
      
      return {
        commissions: data,
        total: count || 0,
      }
    })
})

// Create a server-side caller for use in Server Components
// We need to create the context first, then pass it to createCaller
export const createCaller = async () => {
  const ctx = await createTRPCContext()
  return appRouter.createCaller(ctx)
}

export type AppRouter = typeof appRouter