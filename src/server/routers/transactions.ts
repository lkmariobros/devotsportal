import { z } from 'zod'
import { router, adminProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

// Validation schemas
const transactionFilterSchema = z.object({
  status: z.string().optional(),
  agentId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
})

const transactionSchema = z.object({
  transaction_type_id: z.string().uuid(),
  property_id: z.string().uuid(),
  transaction_date: z.string(),
  closing_date: z.string().optional(),
  transaction_value: z.number(),
  commission_rate: z.number(),
  commission_amount: z.number(),
  commission_split: z.boolean().default(false),
  co_agent_id: z.string().uuid().optional(),
  co_agent_commission_percentage: z.number().optional(),
  agent_id: z.string().uuid(),
  buyer_name: z.string().optional(),
  buyer_email: z.string().email().optional(),
  buyer_phone: z.string().optional(),
  seller_name: z.string().optional(),
  seller_email: z.string().email().optional(),
  seller_phone: z.string().optional(),
  notes: z.string().optional(),
  payment_schedule_id: z.string().uuid().optional(),
})

export const transactionsRouter = router({
  // Admin dashboard summary
  getDashboardSummary: adminProcedure.query(async ({ ctx }) => {
    const { supabase } = ctx

    // Get transaction counts by status
    const { data: statusCounts, error: statusError } = await supabase
      .from('property_transactions')
      .select('status, count')


    if (statusError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: statusError.message,
      })
    }

    // Get recent transactions
    const { data: recentTransactions, error: recentError } = await supabase
      .from('property_transactions')
      .select(`
        id, transaction_date, transaction_value, status,
        transaction_types(name),
        profiles(first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: recentError.message,
      })
    }

    // Get upcoming commission payments
    const { data: upcomingPayments, error: paymentsError } = await supabase
      .from('commission_installments')
      .select(`
        id, amount, due_date, status,
        commissions(transaction_id, agent_id),
        commissions.property_transactions(transaction_value)
      `)
      .eq('status', 'Pending')
      .order('due_date', { ascending: true })
      .limit(5)

    if (paymentsError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: paymentsError.message,
      })
    }

    return {
      statusCounts,
      recentTransactions,
      upcomingPayments,
    }
  }),

  // Get all transactions with filtering
  getAllTransactions: adminProcedure
    .input(transactionFilterSchema)
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx
      const { status, agentId, startDate, endDate, search, limit, offset } = input

      let query = supabase
        .from('property_transactions')
        .select(`
          *,
          transaction_types(name),
          properties(address, city, state),
          profiles(first_name, last_name, email)
        `, { count: 'exact' })

      // Apply filters
      if (status) query = query.eq('status', status)
      if (agentId) query = query.eq('agent_id', agentId)
      if (startDate) query = query.gte('transaction_date', startDate)
      if (endDate) query = query.lte('transaction_date', endDate)
      if (search) {
        query = query.or(`
          properties.address.ilike.%${search}%,
          profiles.first_name.ilike.%${search}%,
          profiles.last_name.ilike.%${search}%
        `)
      }

      // Apply pagination
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
        transactions: data,
        total: count || 0,
      }
    }),

  // Get transaction by ID
  getTransactionById: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('property_transactions')
        .select(`
          *,
          transaction_types(id, name),
          properties(*),
          profiles!agent_id(id, first_name, last_name, email),
          profiles!co_agent_id(id, first_name, last_name, email),
          commission_payment_schedules(*),
          transaction_documents(*)
        `)
        .eq('id', input.id)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Get transaction audit logs
  getTransactionAuditLogs: adminProcedure
    .input(z.object({
      transactionId: z.string().uuid()
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          id,
          action,
          created_at,
          user:profiles!user_id(id, first_name, last_name)
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

      // Format the response to match the expected AuditLog interface
      return data.map((log: any) => ({
        id: log.id,
        action: log.action,
        created_at: log.created_at,
        user: log.user ? {
          name: `${log.user.first_name} ${log.user.last_name}`
        } : undefined
      }))
    }),

  // Create transaction
  createTransaction: protectedProcedure
    .input(transactionSchema)
    .mutation(async ({ ctx, input }) => {
      const { supabase, user } = ctx

      // Calculate commission amount if not provided
      const commissionAmount = input.commission_amount ||
        (input.transaction_value * (input.commission_rate / 100))

      // Create transaction record
      const { data, error } = await supabase
        .from('property_transactions')
        .insert({
          ...input,
          commission_amount: commissionAmount,
          status: 'Pending',
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      // Create audit log entry
      await supabase
        .from('audit_logs')
        .insert({
          entity_type: 'transactions',
          entity_id: data.id,
          action: 'Transaction created',
          user_id: user.id,
          created_at: new Date().toISOString()
        })

      // Upload any associated documents if needed
      // This would be handled separately or through a different endpoint

      return data
    }),

  // Approve transaction with improved error handling and transaction boundaries
  approveTransaction: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      notes: z.string().optional(),
      expectedVersion: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, user } = ctx

      // Import error handling utilities
      const { executeWithErrorHandling, markTransactionForReview } = await import('@/utils/error-handling')

      return executeWithErrorHandling(
        async () => {
          let result;

          // If expectedVersion is provided, use optimistic concurrency control
          if (input.expectedVersion !== undefined) {
            const { data, error } = await supabase.rpc(
              'approve_transaction_with_version',
              {
                p_transaction_id: input.id,
                p_expected_version: input.expectedVersion,
                p_reviewer_id: user.id,
                p_notes: input.notes || null
              }
            );

            if (error) throw error;
            result = data;
          } else {
            // Otherwise use standard approval
            const { data, error } = await supabase.rpc(
              'approve_transaction',
              {
                p_transaction_id: input.id,
                p_reviewer_id: user.id,
                p_notes: input.notes || null
              }
            );

            if (error) throw error;
            result = data;
          }

          return result;
        },
        {
          component: 'transaction-approval',
          userId: user.id,
          metadata: { transactionId: input.id }
        },
        // Recovery function
        async () => {
          await markTransactionForReview(
            supabase,
            input.id,
            new Error('Failed to approve transaction - system recovery triggered')
          );
        }
      );
    }),

  // Reject transaction with improved error handling and transaction boundaries
  rejectTransaction: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      notes: z.string().optional(),
      expectedVersion: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, user } = ctx

      // Import error handling utilities
      const { executeWithErrorHandling, markTransactionForReview } = await import('@/utils/error-handling')

      return executeWithErrorHandling(
        async () => {
          let result;

          // If expectedVersion is provided, use optimistic concurrency control
          if (input.expectedVersion !== undefined) {
            const { data, error } = await supabase.rpc(
              'reject_transaction_with_version',
              {
                p_transaction_id: input.id,
                p_expected_version: input.expectedVersion,
                p_reviewer_id: user.id,
                p_notes: input.notes || null
              }
            );

            if (error) throw error;
            result = data;
          } else {
            // Otherwise use standard rejection
            const { data, error } = await supabase.rpc(
              'reject_transaction',
              {
                p_transaction_id: input.id,
                p_reviewer_id: user.id,
                p_notes: input.notes || null
              }
            );

            if (error) throw error;
            result = data;
          }

          return result;
        },
        {
          component: 'transaction-rejection',
          userId: user.id,
          metadata: { transactionId: input.id }
        },
        // Recovery function
        async () => {
          await markTransactionForReview(
            supabase,
            input.id,
            new Error('Failed to reject transaction - system recovery triggered')
          );
        }
      );
    }),

  // Batch approve transactions
  batchApproveTransactions: adminProcedure
    .input(z.object({
      ids: z.array(z.string().uuid()),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, user } = ctx

      // Import error handling utilities
      const { executeWithErrorHandling } = await import('@/utils/error-handling')

      return executeWithErrorHandling(
        async () => {
          // Use the batch approval function
          const { data, error } = await supabase.rpc(
            'batch_approve_transactions',
            {
              p_transaction_ids: input.ids,
              p_reviewer_id: user.id,
              p_notes: input.notes || null
            }
          );

          if (error) throw error;
          return data;
        },
        {
          component: 'batch-approval',
          userId: user.id,
          metadata: { transactionCount: input.ids.length }
        }
      );
    }),

  // Get commission forecast
  getCommissionForecast: protectedProcedure
    .input(z.object({
      months: z.number().int().positive().default(12),
      includeHistorical: z.boolean().default(true)
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx
      const { months, includeHistorical } = input

      // Get historical data (past 12 months)
      const historicalData = includeHistorical ? await getHistoricalCommissionData(supabase) : []

      // Get forecast data (next X months)
      const forecastData = await getForecastCommissionData(supabase, months)

      // Calculate summary statistics
      const totalHistoricalCommission = historicalData.reduce((sum, month) => sum + month.commissionAmount, 0)
      const avgMonthlyCommission = historicalData.length > 0
        ? totalHistoricalCommission / historicalData.length
        : 0

      return {
        historical: historicalData,
        forecast: forecastData,
        summary: {
          totalHistoricalCommission,
          avgMonthlyCommission,
          forecastTotal: forecastData.reduce((sum, month) => sum + month.projectedCommissionAmount, 0)
        }
      }
    }),

  // Get agent commission summary
  getAgentCommissionSummary: protectedProcedure
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

      // Get paid commissions
      const { data: paidData } = await supabase
        .from('property_transactions')
        .select('commission_amount')
        .eq('agent_id', input.agentId)
        .eq('status', 'Approved')

      const paidCommission = paidData?.reduce((sum, transaction) => {
        return sum + (transaction.commission_amount || 0)
      }, 0) || 0

      // Get pending commissions
      const { data: pendingData } = await supabase
        .from('property_transactions')
        .select('commission_amount')
        .eq('agent_id', input.agentId)
        .eq('status', 'Pending')

      const pendingCommission = pendingData?.reduce((sum, transaction) => {
        return sum + (transaction.commission_amount || 0)
      }, 0) || 0

      // Get projected commissions (future transactions)
      const today = new Date()
      const { data: projectedData } = await supabase
        .from('property_transactions')
        .select('commission_amount, closing_date')
        .eq('agent_id', input.agentId)
        .gt('closing_date', today.toISOString())

      const projectedCommission = projectedData?.reduce((sum, transaction) => {
        return sum + (transaction.commission_amount || 0)
      }, 0) || 0

      return {
        paidCommission,
        pendingCommission,
        projectedCommission
      }
    })
})

// Helper functions for commission forecast
async function getHistoricalCommissionData(supabase: any) {
  // Get the date 12 months ago
  const oneYearAgo = new Date()
  oneYearAgo.setMonth(oneYearAgo.getMonth() - 12)

  const { data, error } = await supabase
    .from('property_transactions')
    .select('transaction_date, commission_amount')
    .gte('transaction_date', oneYearAgo.toISOString())
    .lte('transaction_date', new Date().toISOString())
    .order('transaction_date', { ascending: true })

  if (error) {
    console.error('Error fetching historical commission data:', error)
    return []
  }

  // Group by month and sum commissions
  const monthlyData: Record<string, number> = {}

  data.forEach((transaction: any) => {
    const date = new Date(transaction.transaction_date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = 0
    }

    monthlyData[monthKey] += transaction.commission_amount || 0
  })

  // Convert to array format
  return Object.entries(monthlyData).map(([monthKey, commissionAmount]) => {
    const [year, month] = monthKey.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)

    return {
      date: date.toISOString(),
      commissionAmount
    }
  })
}

async function getForecastCommissionData(supabase: any, months: number) {
  // Get active transactions for projection basis
  const { data: activeTransactions, error } = await supabase
    .from('property_transactions')
    .select('transaction_value, commission_rate, commission_amount')
    .eq('status', 'Active')

  if (error) {
    console.error('Error fetching active transactions:', error)
    return []
  }

  // Calculate average commission per transaction
  const totalCommission = activeTransactions.reduce(
    (sum: number, tx: any) => sum + (tx.commission_amount || 0),
    0
  )

  const avgCommissionPerTransaction = activeTransactions.length > 0
    ? totalCommission / activeTransactions.length
    : 0

  // Get transaction count for the last 3 months to estimate monthly volume
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  const { data: recentTransactions, error: countError } = await supabase
    .from('property_transactions')
    .select('id')
    .gte('transaction_date', threeMonthsAgo.toISOString())

  if (countError) {
    console.error('Error fetching transaction count:', countError)
    return []
  }

  // Estimate monthly transaction volume
  const estimatedMonthlyTransactions = recentTransactions.length / 3

  // Generate forecast for next X months
  const forecast = []
  const currentDate = new Date()

  for (let i = 1; i <= months; i++) {
    const forecastDate = new Date()
    forecastDate.setMonth(currentDate.getMonth() + i)

    // Apply some randomness to make the forecast more realistic
    const randomFactor = 0.8 + Math.random() * 0.4 // Random between 0.8 and 1.2

    const projectedCommissionAmount = estimatedMonthlyTransactions * avgCommissionPerTransaction * randomFactor

    forecast.push({
      date: forecastDate.toISOString(),
      projectedCommissionAmount
    })
  }

  return forecast
}
