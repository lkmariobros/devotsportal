"use server"

import { createServerSupabaseClient } from './supabase/server'

export async function refreshSchemaCache() {
  try {
    const supabase = createServerSupabaseClient()
    
    // First, try a simple query to force a schema refresh
    await supabase.from('property_transactions').select('id').limit(1)
    
    // Then try to insert a test transaction with explicit column names
    const { data, error } = await supabase
      .from('property_transactions')
      .insert([
        {
          id: crypto.randomUUID(),
          market_type: 'secondary',
          transaction_type_id: 'sale',
          property_address: '123 Test Street',
          primary_client_name: 'Test Client',
          transaction_value: 500000,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
    
    if (error) {
      console.error('Error inserting test transaction:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Error in refreshSchemaCache:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
