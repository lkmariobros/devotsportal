import { TRPCError } from '@trpc/server'
import { createTRPCRouter, publicProcedure } from '../trpc'

interface Transaction {
  id: string
  created_at: string
  transaction_amount: number
  status: string
  transaction_type: string
}

export const transactionsRouter = createTRPCRouter({
  getMonthlyTransactionStats: publicProcedure
    .query(async ({ ctx }) => {
      const { supabase } = ctx;

      // Get the current date and calculate date 12 months ago
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 11); // Last 12 months

      // Format dates for SQL query
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Get all transactions in the date range
      const { data: transactions, error } = await supabase
        .from('property_transactions')
        .select('id, created_at, transaction_amount, status, transaction_type')
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr)
        .order('created_at', { ascending: true });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch transaction stats: ${error.message}`
        });
      }

      // Group transactions by month and calculate stats
      const monthlyStats = new Map<string, {
        date: string;
        revenue: number;
        churn: number;
        count: number;
      }>();

      // Initialize all months in the range
      for (let i = 0; i < 12; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i);
        const monthKey = date.toISOString().substring(0, 7); // YYYY-MM format

        monthlyStats.set(monthKey, {
          date: date.toISOString(),
          revenue: 0,
          churn: 0,
          count: 0
        });
      }

      // Populate with actual data
      (transactions as Transaction[]).forEach((transaction: Transaction) => {
        const monthKey = transaction.created_at.substring(0, 7);
        const monthData = monthlyStats.get(monthKey);

        if (monthData) {
          // Increment transaction count
          monthData.count += 1;

          // Add to revenue if active/completed
          if (['active', 'completed'].includes(transaction.status)) {
            monthData.revenue += Number(transaction.transaction_amount) || 0;
          }

          // Add to churn if cancelled/expired
          if (['cancelled', 'expired'].includes(transaction.status)) {
            monthData.churn -= Number(transaction.transaction_amount) || 0;
          }
        }
      });

      return {
        months: Array.from(monthlyStats.values())
      };
    })
});