import { z } from 'zod'
import { router, adminProcedure, adminProcedureWithAudit } from '../trpc'
import { TRPCError } from '@trpc/server'
import { commissions, commissionAdjustments } from '@/db/schema'

// Add this to your existing admin router or create a new file if needed
export const adminCommissionRouter = router({
  // Adjust commission amount
  adjustCommission: adminProcedureWithAudit
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
  // Add to your admin router
  getTransactionAuditLogs: adminProcedure
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
})
