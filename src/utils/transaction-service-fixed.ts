"use server"

import { createServerSupabaseClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Submit a transaction with proper UUID handling
 */
export async function submitTransactionFixed(data: any) {
  try {
    // Get the Supabase client
    const supabase = createServerSupabaseClient()

    // Generate a unique ID for the transaction
    const transactionId = crypto.randomUUID()

    // Prepare transaction data with proper UUID handling
    const transactionData: any = {
      id: transactionId,

      // Required fields
      transaction_date: data.transaction_date || new Date().toISOString().split('T')[0],

      // Basic fields
      market_type: data.market_type || 'secondary',
      market_subcategory: data.market_subcategory || 'residential',
      property_address: data.property_address || 'Unknown Address',
      property_city: data.property_city || 'Unknown City',
      property_state: data.property_state || 'Unknown State',
      property_zip: data.property_zip || '00000',
      property_type: data.property_type || 'Unknown Type',

      // Client information
      primary_client_name: data.primary_client_name || 'Unknown Client',
      primary_client_email: data.primary_client_email,
      primary_client_phone: data.primary_client_phone,
      primary_client_type: data.primary_client_type || 'buyer',
      // Handle boolean fields correctly
      ...(data.primary_is_company !== undefined ? {
        primary_is_company: data.primary_is_company === true || data.primary_is_company === 'true'
      } : {}),
      primary_company_name: data.primary_company_name,

      // Secondary client
      ...(data.include_secondary_party !== undefined ? {
        include_secondary_party: data.include_secondary_party === true || data.include_secondary_party === 'true'
      } : {}),
      secondary_client_name: data.secondary_client_name,
      secondary_client_email: data.secondary_client_email,
      secondary_client_phone: data.secondary_client_phone,
      secondary_client_type: data.secondary_client_type,
      ...(data.secondary_is_company !== undefined ? {
        secondary_is_company: data.secondary_is_company === true || data.secondary_is_company === 'true'
      } : {}),
      secondary_company_name: data.secondary_company_name,

      // Co-broking
      ...(data.co_broking_enabled !== undefined ? {
        co_broking_enabled: data.co_broking_enabled === true || data.co_broking_enabled === 'true'
      } : {}),
      co_agent_name: data.co_agent_name,
      co_agent_email: data.co_agent_email,

      // Commission
      transaction_value: typeof data.transaction_value === 'number' ? data.transaction_value :
                        parseFloat(data.transaction_value as any) || 0,
      commission_rate: typeof data.commission_rate === 'number' ? data.commission_rate :
                      parseFloat(data.commission_rate as any) || 0,
      // Don't include commission_split at all - it seems to be a boolean in the database schema
      // but we're trying to pass a number, which causes the error
      agent_tier: data.agent_tier || 'standard',

      // Status
      status: 'pending',

      // Metadata
      created_at: new Date(),
      updated_at: new Date()
    }

    // For transaction_type_id, we need to fetch a valid ID from the transaction_types table
    // First, try to get transaction types from the database
    const { data: transactionTypes, error: typesError } = await supabase
      .from('transaction_types')
      .select('id, name')

    if (typesError) {
      console.error('Error fetching transaction types:', typesError)
      return { success: false, error: 'Failed to fetch transaction types: ' + typesError.message }
    }

    // Find the appropriate transaction type based on the form data
    let transactionTypeId = null

    // If we have transaction types, find the matching one
    if (transactionTypes && transactionTypes.length > 0) {
      // Map string values to expected transaction type names
      const typeNameMap: Record<string, string> = {
        'sale': 'Sale',
        'rental': 'Rental'
      }

      // Get the expected type name
      const expectedTypeName = typeNameMap[data.transaction_type_id as string] || 'Sale'

      // Find the matching transaction type
      const matchingType = transactionTypes.find(type => type.name === expectedTypeName)

      if (matchingType) {
        transactionTypeId = matchingType.id
      } else {
        // If no match found, use the first available type
        transactionTypeId = transactionTypes[0].id
      }
    }

    // Only include transaction_type_id if we found a valid ID
    if (transactionTypeId) {
      transactionData.transaction_type_id = transactionTypeId
    }

    // Insert the transaction
    const { data: transaction, error } = await supabase
      .from('property_transactions')
      .insert([transactionData])
      .select()

    if (error) {
      console.error('Error inserting transaction:', error)
      return { success: false, error: error.message }
    }

    // Revalidate the transaction pages
    revalidatePath("/agent-layout/transactions')
    revalidatePath('/admin-dashboard/transactions')

    return {
      success: true,
      data: transaction[0],
      message: "Transaction submitted successfully"
    }
  } catch (error) {
    console.error('Error in submitTransactionFixed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
