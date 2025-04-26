import { TRPCError } from '@trpc/server';
import { canTransition, UserRole, TransactionStatus } from '@/utils/transactions/state-machine';
import { Transaction } from '@/types/transactions';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export class TransactionService {
  constructor(private supabase: SupabaseClient<Database>) {}

  // Create a new transaction
  async createTransaction(data: any, userId: string): Promise<Transaction> {
    // Calculate commission amount if not provided
    const commissionAmount = data.commission_amount || 
      (data.transaction_value * (data.commission_rate / 100));
    
    // Create transaction record
    const { data: transaction, error } = await this.supabase
      .from('property_transactions')
      .insert({
        ...data,
        commission_amount: commissionAmount,
        status: 'Draft', // Always start as draft
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      });
    }

    // Log agent activity
    await this.logTransactionActivity(
      userId,
      transaction.id,
      'transaction_created'
    );
    
    return transaction;
  }

  // Update transaction status
  async updateTransactionStatus(
    transactionId: string,
    newStatus: TransactionStatus,
    userId: string,
    role: UserRole,
    notes?: string
  ): Promise<Transaction> {
    // Get current transaction
    const { data: transaction, error: getError } = await this.supabase
      .from('property_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    
    if (getError) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      });
    }
    
    // Check if status transition is allowed
    if (!canTransition(transaction.status as TransactionStatus, newStatus, role)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Cannot transition from ${transaction.status} to ${newStatus} as ${role}`,
      });
    }
    
    // Update transaction status
    const { data: updatedTransaction, error: updateError } = await this.supabase
      .from('property_transactions')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        notes: notes ? `${transaction.notes ? transaction.notes + '\n\n' : ''}${new Date().toISOString()} - Status changed to ${newStatus}${notes ? ': ' + notes : ''} by ${role}` : transaction.notes
      })
      .eq('id', transactionId)
      .select()
      .single();
    
    if (updateError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: updateError.message,
      });
    }
    
    // Log status change in audit logs
    await this.supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'update_transaction_status',
        entity_type: 'transaction',
        entity_id: transactionId,
        previous_state: JSON.stringify({ status: transaction.status }),
        new_state: JSON.stringify({ status: newStatus }),
        metadata: JSON.stringify({ notes })
      });
    
    // Log agent activity
    await this.logTransactionActivity(
      userId,
      transactionId,
      'transaction_updated'
    );
    
    return updatedTransaction;
  }

  // Get transaction by ID with related data
  async getTransactionById(transactionId: string): Promise<Transaction> {
    const { data, error } = await this.supabase
      .from('property_transactions')
      .select(`
        *,
        transaction_types (*),
        properties (*),
        profiles!agent_id (*),
        profiles!co_agent_id (*)
      `)
      .eq('id', transactionId)
      .single();
    
    if (error) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      });
    }
    
    return data as unknown as Transaction;
  }

  // Get transactions with filtering and pagination
  async getTransactions(
    filters: {
      status?: string[];
      agentId?: string;
      startDate?: string;
      endDate?: string;
    },
    pagination: {
      page: number;
      pageSize: number;
    }
  ): Promise<{ transactions: Transaction[]; total: number }> {
    let query = this.supabase
      .from('property_transactions')
      .select(`
        *,
        transaction_types (*),
        properties (*),
        profiles!agent_id (*)
      `, { count: 'exact' });
    
    // Apply filters
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    
    if (filters.agentId) {
      query = query.eq('agent_id', filters.agentId);
    }
    
    if (filters.startDate) {
      query = query.gte('transaction_date', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('transaction_date', filters.endDate);
    }
    
    // Apply pagination
    const from = (pagination.page - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;
    
    query = query.range(from, to).order('transaction_date', { ascending: false });
    
    const { data, error, count } = await query;
    
    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      });
    }
    
    return {
      transactions: data as unknown as Transaction[],
      total: count || 0
    };
  }

  // Helper method to log transaction activity
  private async logTransactionActivity(
    userId: string,
    transactionId: string,
    actionType: 'transaction_created' | 'transaction_updated' | 'document_uploaded'
  ): Promise<void> {
    await this.supabase
      .from('agent_activities')
      .insert({
        agent_id: userId,
        action_type: actionType,
        entity_type: 'transaction',
        entity_id: transactionId,
        created_at: new Date().toISOString()
      });
  }
}