"use server"

import { createServerSupabaseClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
// No need to import ENV anymore as we're using direct Supabase client

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
    console.log('[DEBUG] getTransactions called with:', { agentId, status, limit, offset, search })

    // Get the Supabase client
    const supabase = createServerSupabaseClient()

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

    // Log debugging info
    console.log('[DEBUG] Query executed')

    // Log the first few transactions if available
    if (data && data.length > 0) {
      console.log('[DEBUG] First transaction:', JSON.stringify(data[0], null, 2))
    } else {
      console.log('[DEBUG] No transactions found')
    }

    console.log('[DEBUG] getTransactions found:', { count, dataLength: data?.length })
    if (data && data.length > 0) {
      console.log('[DEBUG] First transaction:', data[0])
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
    // Get the Supabase client
    const supabase = createServerSupabaseClient()

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
    // Get the Supabase client
    const supabase = createServerSupabaseClient()

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
    revalidatePath('/admin-dashboard/transactions')
    revalidatePath("/agent-layout/transactions')
    revalidatePath(`/admin-dashboard/transactions/${id}`)
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
    console.log('[DEBUG] storeTransactionFromFallback called with data:', JSON.stringify(data, null, 2))

    // Get the Supabase client
    const supabase = createServerSupabaseClient()

    // Generate a unique ID for the transaction
    const transactionId = crypto.randomUUID()

    // Log the transaction_type_id specifically
    console.log("[DEBUG] transaction_type_id:", data.transaction_type_id,
      "(type: " + typeof data.transaction_type_id + ")",
      "(valid UUID: " + /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.transaction_type_id) + ")");

    // Use the exact schema that matches the existing table structure
    const transactionData = {
      id: transactionId,
      // Required fields
      transaction_date: data.transaction_date || new Date().toISOString().split('T')[0],

      // Optional fields with fallbacks
      market_type: data.market_type || 'secondary',
      market_subcategory: data.market_subcategory || 'residential',
      // Only include transaction_type_id if it's a valid UUID
      ...(data.transaction_type_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.transaction_type_id) ?
        { transaction_type_id: data.transaction_type_id } : {}),
      property_address: data.property_address || 'Unknown Address',
      primary_client_name: data.primary_client_name || 'Unknown Client',
      transaction_value: typeof data.transaction_value === 'number' ? data.transaction_value : 0,
      status: 'pending',

      // Metadata
      created_at: new Date(),
      updated_at: new Date(),
      created_by: data.agent_id || null,
      updated_by: data.agent_id || null
    }

    // Log the transaction data before insertion
    console.log('[DEBUG] Inserting transaction with data:', transactionData)

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

    console.log('[DEBUG] Transaction stored successfully:', transaction)

    // Revalidate the transaction pages with force option
    console.log('[DEBUG] Revalidating transaction pages')
    revalidatePath('/admin-dashboard/transactions', 'page')
    revalidatePath("/agent-layout/transactions', 'page')

    // Also revalidate the root paths to ensure layout updates
    revalidatePath('/admin-dashboard', 'layout')
    revalidatePath('/agent', 'layout')

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
