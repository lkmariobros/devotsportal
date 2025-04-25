import { z } from 'zod'
import { router, adminProcedure, adminProcedureWithAudit } from '../trpc'
import { TRPCError } from '@trpc/server'
import { commissions, commissionAdjustments } from '@/db/schema'

// Create a main admin router that combines all admin functionality
export const adminRouter = router({
  // Commission management
  commissions: router({
    // Adjust commission amount
    adjust: adminProcedureWithAudit
      .input(z.object({
        commissionId: z.string().uuid(),
        newAmount: z.number().positive(),
        adjustmentReason: z.string().min(10),
        notifyAgent: z.boolean().default(true)
      }))
      .mutation(async ({ ctx, input }) => {
        const { commissionId, newAmount, adjustmentReason, notifyAgent } = input
        const { supabase, user } = ctx
        
        // Get the original commission
        const { data: originalCommission, error: fetchError } = await supabase
          .from('commissions')
          .select(`
            *,
            property_transactions(id, agent_id)
          `)
          .eq('id', commissionId)
          .single()
        
        if (fetchError || !originalCommission) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Commission not found'
          })
        }
        
        // Update the commission amount
        const { data: updatedCommission, error: updateError } = await supabase
          .from('commissions')
          .update({
            amount: newAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', commissionId)
          .select()
          .single()
          
        if (updateError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update commission'
          })
        }
        
        // Create an adjustment record
        const { error: adjustmentError } = await supabase
          .from('commission_adjustments')
          .insert({
            commission_id: commissionId,
            previous_amount: originalCommission.amount,
            new_amount: newAmount,
            adjustment_reason: adjustmentReason,
            adjusted_by: user?.id,
            created_at: new Date().toISOString()
          })
          
        if (adjustmentError) {
          console.error('Failed to create adjustment record:', adjustmentError)
        }
        
        // Notify the agent if requested
        if (notifyAgent) {
          // Implement notification logic here
          // This could be an email, in-app notification, etc.
          console.log(`Notification would be sent to agent ${originalCommission.agent_id}`)
        }
        
        return updatedCommission
      }),
      
    // Get all commission adjustments for a commission
    getAdjustments: adminProcedure
      .input(z.object({
        commissionId: z.string().uuid()
      }))
      .query(async ({ ctx, input }) => {
        const { supabase } = ctx
        
        const { data, error } = await supabase
          .from('commission_adjustments')
          .select(`
            *,
            adjusted_by_user:profiles!adjusted_by(id, first_name, last_name)
          `)
          .eq('commission_id', input.commissionId)
          .order('created_at', { ascending: false })
        
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message
          })
        }
        
        return data
      })
  }),
  
  // Audit logs
  auditLogs: router({
    // Get audit logs for any entity
    getByEntity: adminProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.string().uuid()
      }))
      .query(async ({ ctx, input }) => {
        const { supabase } = ctx
        const { entityType, entityId } = input
        
        const { data, error } = await supabase
          .from('audit_logs')
          .select(`
            *,
            profiles:user_id(id, first_name, last_name)
          `)
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .order('created_at', { ascending: false })
        
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message
          })
        }
        
        return data
      }),
      
    // Get transaction audit logs (keeping for backward compatibility)
    getTransactionLogs: adminProcedure
      .input(z.object({
        transactionId: z.string().uuid()
      }))
      .query(async ({ ctx, input }) => {
        const { supabase } = ctx
        
        const { data, error } = await supabase
          .from('audit_logs')
          .select(`
            *,
            profiles:user_id(id, first_name, last_name)
          `)
          .eq('entity_type', 'transactions')
          .eq('entity_id', input.transactionId)
          .order('created_at', { ascending: false })
        
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message
          })
        }
        
        return data
      })
  }),
  
  // Dashboard
  dashboard: router({
    // Get summary statistics for admin dashboard
    getSummary: adminProcedure.query(async ({ ctx }) => {
      const { supabase } = ctx
      
      // Get agent count
      const { count: agentCount, error: agentError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'agent')
      
      // Get transaction count
      const { count: transactionCount, error: transactionError } = await supabase
        .from('property_transactions')
        .select('*', { count: 'exact', head: true })
      
      // Get total commission amount
      const { data: commissionData, error: commissionError } = await supabase
        .from('commissions')
        .select('amount')
        .is('status', 'paid')
      
      const totalCommission = commissionData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0
      
      if (agentError || transactionError || commissionError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dashboard data'
        })
      }
      
      return {
        agentCount: agentCount || 0,
        transactionCount: transactionCount || 0,
        totalCommission
      }
    })
  })
})