import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const usersRouter = router({
  // Get recent agent activity
  getRecentAgentActivity: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(20).default(5)
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx
      const { limit } = input

      // Query agent activity from the database
      const { data, error } = await supabase
        .from('agent_activity')
        .select(`
          id,
          agent_id,
          action_type,
          entity_type,
          entity_id,
          created_at,
          agent:profiles(id, first_name, last_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return {
        activities: data || []
      }
    }),

  // Get all agents with filtering
  getAgents: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.string().optional(),
      teamId: z.string().uuid().optional(),
      limit: z.number().min(1).max(100).default(10),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx
      const { search, status, teamId, limit, offset } = input

      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, email, status, team_id, created_at', { count: 'exact' })
        .eq('role', 'agent')

      // Apply filters
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      if (status) {
        query = query.eq('status', status)
      }

      if (teamId) {
        query = query.eq('team_id', teamId)
      }

      // Apply pagination
      query = query
        .order('first_name', { ascending: true })
        .range(offset, offset + limit - 1)

      const { data, count, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return {
        agents: data || [],
        totalCount: count || 0
      }
    }),
})