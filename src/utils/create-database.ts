"use server"

import { createServerSupabaseClient } from './supabase/server'

export async function checkTransactionsTable() {
  try {
    const supabase = createServerSupabaseClient()

    // Try to select from the table to see if it exists
    const { data, error } = await supabase
      .from('property_transactions')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Error checking transactions table:', error)
      return {
        success: false,
        error: error.message,
        tableExists: false
      }
    }

    return {
      success: true,
      tableExists: true,
      data
    }
  } catch (error) {
    console.error('Error in checkTransactionsTable:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tableExists: false
    }
  }
}

export async function insertTestTransaction() {
  try {
    const supabase = createServerSupabaseClient()

    // Generate a UUID for the transaction
    const id = crypto.randomUUID()

    // Insert directly with the exact schema structure
    const { data, error } = await supabase
      .from('property_transactions')
      .insert([
        {
          id,
          // Required fields
          transaction_date: new Date().toISOString().split('T')[0],

          // Optional fields
          market_type: 'secondary',
          market_subcategory: 'residential',
          // Don't include transaction_type_id since it's a UUID and we don't have a valid one
          property_address: '123 Test Street',
          primary_client_name: 'Test Client',
          transaction_value: 500000,
          status: 'pending',

          // Metadata
          created_at: new Date(),
          updated_at: new Date()
        }
      ])
      .select()

    if (error) {
      console.error('Error inserting test transaction:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in insertTestTransaction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
