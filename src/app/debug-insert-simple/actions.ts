"use server"

import { createServerSupabaseClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

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
          property_address: '123 Debug Street (Server)',
          primary_client_name: 'Debug Client (Server)',
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
    
    // Revalidate the transaction pages
    revalidatePath('/agent/transactions')
    revalidatePath('/admin-dashboard/transactions')
    revalidatePath('/debug-insert-simple')
    
    return { success: true, data }
  } catch (error) {
    console.error('Error in insertTestTransaction:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
