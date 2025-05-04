"use server"

import { createServerSupabaseClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { SUPABASE_CONFIG } from '@/utils/supabase/config'

/**
 * Get all transactions with optional filtering
 */
export async function getTransactions({
  agentId,
  status,
  limit = 10,
  offset = 0,
  search
}: {
  agentId?: string
  status?: string
  limit?: number
  offset?: number
  search?: string
}) {
  try {
    // Try to create the Supabase client, with a fallback
    let supabase;
    try {
      supabase = createServerSupabaseClient();
    } catch (clientError) {
      console.error('Error creating server Supabase client:', clientError);
      console.warn('Falling back to direct Supabase client creation');
      supabase = createClient<Database>(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    }

    // Start building the query
    let query = supabase
      .from('property_transactions')
      .select('*', { count: 'exact' })

    // Apply filters if provided
    if (agentId) {
      query = query.eq('created_by', agentId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`
        property_address.ilike.%${search}%,
        primary_client_name.ilike.%${search}%
      `)
    }

    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Execute the query
    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching transactions:', error)
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data,
      count: count || 0
    }
  } catch (error) {
    console.error('Error in getTransactions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get a single transaction by ID
 */
export async function getTransactionById(id: string) {
  try {
    // Try to create the Supabase client, with a fallback
    let supabase;
    try {
      supabase = createServerSupabaseClient();
    } catch (clientError) {
      console.error('Error creating server Supabase client:', clientError);
      console.warn('Falling back to direct Supabase client creation');
      supabase = createClient<Database>(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    }

    const { data, error } = await supabase
      .from('property_transactions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching transaction:', error)
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Error in getTransactionById:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  id: string,
  status: string,
  notes?: string
) {
  try {
    // Try to create the Supabase client, with a fallback
    let supabase;
    try {
      supabase = createServerSupabaseClient();
    } catch (clientError) {
      console.error('Error creating server Supabase client:', clientError);
      console.warn('Falling back to direct Supabase client creation');
      supabase = createClient<Database>(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    }

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    // Update the transaction
    const { data, error } = await supabase
      .from('property_transactions')
      .update({
        status,
        admin_notes: notes,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating transaction status:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Revalidate the transaction pages
    revalidatePath('/transactions')
    revalidatePath('/agent/transactions')
    revalidatePath(`/transactions/${id}`)
    revalidatePath(`/agent/transactions/${id}`)

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Error in updateTransactionStatus:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Store transaction data from the fallback action
 * This function will be called when a transaction is submitted via the fallback action
 */
export async function storeTransactionFromFallback(data: any) {
  try {
    // Try to create the Supabase client, with a fallback
    let supabase;
    try {
      supabase = createServerSupabaseClient();
    } catch (clientError) {
      console.error('Error creating server Supabase client:', clientError);
      console.warn('Falling back to direct Supabase client creation');
      supabase = createClient<Database>(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    }

    // Generate a unique ID for the transaction
    const transactionId = crypto.randomUUID()

    // Prepare transaction data
    const transactionData = {
      id: transactionId,
      // Essential fields
      market_type: data.market_type || 'secondary',
      market_subcategory: data.market_subcategory || 'residential',
      transaction_type_id: data.transaction_type_id || 'sale',
      transaction_date: data.transaction_date || new Date().toISOString().split('T')[0],
      property_address: data.property_address || 'Unknown Address',
      property_city: data.property_city || '',
      property_state: data.property_state || '',
      property_zip: data.property_zip || '',
      property_type: data.property_type || 'Unknown',

      // Client information
      primary_client_name: data.primary_client_name || 'Unknown Client',
      primary_client_email: data.primary_client_email || '',
      primary_client_phone: data.primary_client_phone || '',
      primary_client_type: data.primary_client_type || 'buyer',
      primary_is_company: data.primary_is_company || false,
      primary_company_name: data.primary_company_name || '',

      // Secondary party
      include_secondary_party: data.include_secondary_party || false,
      secondary_client_name: data.secondary_client_name || '',
      secondary_client_email: data.secondary_client_email || '',
      secondary_client_phone: data.secondary_client_phone || '',
      secondary_client_type: data.secondary_client_type || 'seller',
      secondary_is_company: data.secondary_is_company || false,
      secondary_company_name: data.secondary_company_name || '',

      // Co-broking
      co_broking_enabled: data.co_broking_enabled || false,
      co_agent_id: data.co_agent_id || null,
      co_agent_name: data.co_agent_name || '',
      co_agent_email: data.co_agent_email || '',
      commission_split: data.commission_split || 50,

      // Financial details
      transaction_value: typeof data.transaction_value === 'number' ? data.transaction_value : 0,
      commission_rate: typeof data.commission_rate === 'number' ? data.commission_rate : 0,
      commission_amount: typeof data.commission_amount === 'number' ? data.commission_amount :
        (typeof data.transaction_value === 'number' && typeof data.commission_rate === 'number' ?
          data.transaction_value * (data.commission_rate / 100) : 0),
      agent_tier: data.agent_tier || 'Advisor',

      // Status and metadata
      status: 'pending',
      created_by: data.agent_id || '00000000-0000-0000-0000-000000000000',
      updated_by: data.agent_id || '00000000-0000-0000-0000-000000000000',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Insert the transaction
    const { data: transaction, error } = await supabase
      .from('property_transactions')
      .insert([transactionData])
      .select()

    if (error) {
      console.error('Error storing transaction:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Revalidate the transaction pages
    revalidatePath('/transactions')
    revalidatePath('/agent/transactions')

    return {
      success: true,
      data: transaction[0],
      id: transactionId
    }
  } catch (error) {
    console.error('Error in storeTransactionFromFallback:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
