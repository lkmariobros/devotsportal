import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const analyticsRouter = router({
  // Get commission forecast
  getCommissionForecast: adminProcedure
    .input(z.object({
      months: z.number().int().min(1).max(24).default(12),
      includeHistorical: z.boolean().default(true)
    }))
    .query(async ({ ctx, input }) => {
      const { months, includeHistorical } = input
      const { supabase } = ctx
      
      // Get historical data for the past 12 months
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 12)
      
      // Format dates for Supabase query
      const formattedStartDate = startDate.toISOString().split('T')[0]
      const formattedEndDate = endDate.toISOString().split('T')[0]
      
      // Get historical transactions
      let historicalData = []
      if (includeHistorical) {
        const { data, error } = await supabase
          .from('property_transactions')
          .select('*')
          .gte('transaction_date', formattedStartDate)
          .lte('transaction_date', formattedEndDate)
          .eq('status', 'Approved')
        
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch historical data'
          })
        }
        
        historicalData = data || []
      }
      
      // Group by month and calculate totals
      const historicalByMonth = historicalData.reduce((acc: any, transaction: any) => {
        const date = new Date(transaction.transaction_date)
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
        
        if (!acc[monthKey]) {
          acc[monthKey] = {
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            transactionCount: 0,
            transactionValue: 0,
            commissionAmount: 0
          }
        }
        
        acc[monthKey].transactionCount += 1
        acc[monthKey].transactionValue += Number(transaction.transaction_value || 0)
        acc[monthKey].commissionAmount += Number(transaction.commission_amount || 0)
        
        return acc
      }, {})
      
      // Calculate averages for forecasting
      const monthlyData = Object.values(historicalByMonth)
      const avgTransactionCount = monthlyData.length > 0 
        ? monthlyData.reduce((sum: number, month: any) => sum + month.transactionCount, 0) / monthlyData.length 
        : 0
      const avgCommissionAmount = monthlyData.length > 0
        ? monthlyData.reduce((sum: number, month: any) => sum + month.commissionAmount, 0) / monthlyData.length
        : 0
      
      // Generate forecast for future months
      const forecast = []
      for (let i = 1; i <= months; i++) {
        const forecastDate = new Date()
        forecastDate.setMonth(forecastDate.getMonth() + i)
        
        forecast.push({
          month: forecastDate.getMonth() + 1,
          year: forecastDate.getFullYear(),
          projectedTransactionCount: Math.round(avgTransactionCount),
          projectedCommissionAmount: Math.round(avgCommissionAmount),
          isProjection: true
        })
      }
      
      return {
        historical: monthlyData,
        forecast,
        summary: {
          avgMonthlyTransactions: avgTransactionCount,
          avgMonthlyCommission: avgCommissionAmount,
          totalHistoricalCommission: monthlyData.reduce((sum: number, month: any) => sum + month.commissionAmount, 0),
          totalProjectedCommission: forecast.reduce((sum: number, month: any) => sum + month.projectedCommissionAmount, 0)
        }
      }
    })
})