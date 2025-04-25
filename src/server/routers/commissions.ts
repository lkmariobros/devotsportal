import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const commissionsRouter = router({
  getCommissionDetails: adminProcedure
    .input(z.object({
      dateRange: z.object({
        from: z.string(),
        to: z.string()
      }).optional(),
      filter: z.enum(['all', 'pending', 'paid', 'projected']).default('all')
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx
      const { dateRange, filter } = input
      
      // Build the query for transactions with commissions
      let query = supabase
        .from('commissions')
        .select(`
          id,
          amount,
          status,
          created_at,
          property_transactions(
            id,
            transaction_date,
            property_address,
            transaction_value
          )
        `)
      
      // Apply date range filter if provided
      if (dateRange) {
        query = query.gte('created_at', dateRange.from)
                     .lte('created_at', dateRange.to)
      }
      
      // Apply status filter if not 'all'
      if (filter !== 'all') {
        query = query.eq('status', filter)
      }
      
      const { data: commissionData, error } = await query
      
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }
      
      // Transform data for the transactions table
      const transactions = commissionData?.map(commission => {
        const transaction = commission.property_transactions
        return {
          id: commission.id,
          date: commission.created_at,
          description: transaction?.property_address || 'Unknown property',
          amount: commission.amount,
          status: commission.status,
          source: 'Property Transaction',
          transactionId: transaction?.id
        }
      }) || []
      
      // Generate chart data by grouping by month
      const monthlyData = commissionData?.reduce((acc, commission) => {
        const date = new Date(commission.created_at)
        const month = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
        
        if (!acc[month]) {
          acc[month] = { month, pending: 0, paid: 0, projected: 0 }
        }
        
        if (commission.status === 'pending') {
          acc[month].pending += commission.amount || 0
        } else if (commission.status === 'paid') {
          acc[month].paid += commission.amount || 0
        } else if (commission.status === 'projected') {
          acc[month].projected += commission.amount || 0
        }
        
        return acc
      }, {} as Record<string, { month: string, pending: number, paid: number, projected: number }>) || {}
      
      // Convert to array and sort by month
      const chartData = Object.values(monthlyData).sort((a, b) => {
        const [monthA, yearA] = a.month.split(' ')
        const [monthB, yearB] = b.month.split(' ')
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthIndexA = months.indexOf(monthA)
        const monthIndexB = months.indexOf(monthB)
        
        if (yearA !== yearB) return Number(yearA) - Number(yearB)
        return monthIndexA - monthIndexB
      })
      
      return {
        transactions,
        chartData
      }
    }),
    
  // Add a procedure to get forecast data for the dashboard
  getCommissionForecast: adminProcedure
    .query(async ({ ctx }) => {
      const { supabase } = ctx
      
      // Get historical commission data
      const { data: historicalData, error: historicalError } = await supabase
        .from('commissions')
        .select('amount, created_at, status')
        .or('status.eq.paid,status.eq.pending')
        .order('created_at', { ascending: true })
      
      if (historicalError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: historicalError.message
        })
      }
      
      // Process historical data by month
      const historicalByMonth = historicalData?.reduce((acc, commission) => {
        const date = new Date(commission.created_at)
        const month = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
        
        if (!acc[month]) {
          acc[month] = {
            date: month,
            commissionAmount: 0
          }
        }
        
        acc[month].commissionAmount += commission.amount || 0
        return acc
      }, {} as Record<string, { date: string, commissionAmount: number }>) || {}
      
      // Calculate average monthly commission for forecasting
      const monthlyAmounts = Object.values(historicalByMonth).map(m => m.commissionAmount)
      const avgMonthlyCommission = monthlyAmounts.length > 0 
        ? monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / monthlyAmounts.length 
        : 0
      
      // Generate forecast data for the next 6 months
      const forecast = []
      const lastHistoricalDate = historicalData && historicalData.length > 0 
        ? new Date(historicalData[historicalData.length - 1].created_at) 
        : new Date()
      
      for (let i = 1; i <= 6; i++) {
        const forecastDate = new Date(lastHistoricalDate)
        forecastDate.setMonth(forecastDate.getMonth() + i)
        
        forecast.push({
          date: `${forecastDate.toLocaleString('default', { month: 'short' })} ${forecastDate.getFullYear()}`,
          projectedCommissionAmount: avgMonthlyCommission
        })
      }
      
      // Calculate summary data
      const totalHistoricalCommission = Object.values(historicalByMonth)
        .reduce((sum, month) => sum + month.commissionAmount, 0)
      
      const forecastTotal = forecast.reduce((sum, month) => sum + month.projectedCommissionAmount, 0)
      
      return {
        historical: Object.values(historicalByMonth),
        forecast,
        summary: {
          totalHistoricalCommission,
          avgMonthlyCommission,
          forecastTotal
        }
      }
    })
})