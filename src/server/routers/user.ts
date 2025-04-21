import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const usersRouter = router({
  // Get all agents for dropdowns
  getAgents: adminProcedure.query(async ({ ctx }) => {
    const { supabase } = ctx
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('role', 'agent')
      .order('first_name', { ascending: true })
    
    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }
    
    return {
      agents: data || [],
    }
  }),
})