// Shared transaction type definitions

/**
 * Core transaction interface that represents the database structure
 */
export interface Transaction {
    id: string
    transaction_date: string
    transaction_value: number
    status: string
    property_id?: string
    agent_id?: string
    co_agent_id?: string
    created_at: string
    updated_at?: string
    
    // Related entities (populated through joins)
    transaction_types?: { id: string; name: string }[]
    properties?: {
      id: string
      address: string
      city?: string
      state?: string
      zip_code?: string
    }
    profiles?: {
      id: string
      first_name: string | null
      last_name: string | null
      email?: string
      avatar_url?: string | null
    }[]
  }
  
  /**
   * Dashboard-specific transaction data
   */
  export interface DashboardTransactionData {
    statusCounts: { status: string; count: number }[]
    recentTransactions: Transaction[]
    upcomingPayments: Array<{
      agent_name: string
      payment_date: string
      amount: number
    }>
    transactionCounts: { active: number; completed: number }
    revenue: number
    avgCommission: number
    revenueChange?: number
    commissionChange?: number
  }
  
  /**
   * Transaction list view data
   */
  export interface TransactionListItem {
    id: string
    property: {
      address: string
    }
    agent: {
      name: string
    }
    amount: number
    createdAt: string
    status: string
  }