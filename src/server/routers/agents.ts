import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const agentsRouter = router({
  // Get dashboard stats for an agent
  getDashboardStats: protectedProcedure
    .input(z.object({
      agentId: z.string().uuid()
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, user } = ctx

      // Ensure the user is querying their own data
      if (user.id !== input.agentId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view your own dashboard stats',
        })
      }

      // Get total transactions count
      const { count: totalTransactions } = await supabase
        .from('property_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', input.agentId)

      // Get pending transactions count
      const { count: pendingTransactions } = await supabase
        .from('property_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', input.agentId)
        .eq('status', 'Pending')

      // Get total commission amount
      const { data: commissionData } = await supabase
        .from('property_transactions')
        .select('commission_amount')
        .eq('agent_id', input.agentId)

      const totalCommission = commissionData?.reduce((sum, transaction) => {
        return sum + (transaction.commission_amount || 0)
      }, 0) || 0

      return {
        totalTransactions: totalTransactions || 0,
        pendingTransactions: pendingTransactions || 0,
        totalCommission
      }
    }),

  // Get commission summary for an agent
  getCommissionSummary: protectedProcedure
    .input(z.object({
      agentId: z.string().uuid()
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, user } = ctx

      // Ensure the user is querying their own data
      if (user.id !== input.agentId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view your own commission data',
        })
      }

      // Get total commission amount
      const { data: totalData } = await supabase
        .from('property_transactions')
        .select('commission_amount')
        .eq('agent_id', input.agentId)

      const totalCommission = totalData?.reduce((sum, transaction) => {
        return sum + (transaction.commission_amount || 0)
      }, 0) || 0

      // Get pending commission amount
      const { data: pendingData } = await supabase
        .from('property_transactions')
        .select('commission_amount')
        .eq('agent_id', input.agentId)
        .eq('status', 'Pending')

      const pendingCommission = pendingData?.reduce((sum, transaction) => {
        return sum + (transaction.commission_amount || 0)
      }, 0) || 0

      // Get paid commission amount
      const { data: paidData } = await supabase
        .from('property_transactions')
        .select('commission_amount')
        .eq('agent_id', input.agentId)
        .eq('status', 'Approved')

      const paidCommission = paidData?.reduce((sum, transaction) => {
        return sum + (transaction.commission_amount || 0)
      }, 0) || 0

      // Calculate monthly average (based on last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: recentData } = await supabase
        .from('property_transactions')
        .select('commission_amount, created_at')
        .eq('agent_id', input.agentId)
        .eq('status', 'Approved')
        .gte('created_at', sixMonthsAgo.toISOString())

      const recentTotal = recentData?.reduce((sum, transaction) => {
        return sum + (transaction.commission_amount || 0)
      }, 0) || 0

      const monthlyAverage = recentData && recentData.length > 0 ?
        recentTotal / 6 : 0

      // Forecast for next month (simple projection based on average)
      const forecastNextMonth = monthlyAverage * 1.1 // 10% growth projection

      return {
        totalCommission,
        pendingCommission,
        paidCommission,
        monthlyAverage,
        forecastNextMonth
      }
    }),

  // Get agent profile
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const { supabase, user } = ctx

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),
})