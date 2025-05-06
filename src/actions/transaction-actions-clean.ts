"use server"

import { createServerActionSupabaseClient } from '@/utils/supabase/server-action'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { submitTransaction as submitTransactionService } from '@/utils/transaction-service'

// Define the transaction submission schema
const transactionSubmissionSchema = z.object({
  // Market type fields
  market_type: z.string().min(1, "Market type is required"),
  market_subcategory: z.string().min(1, "Market subcategory is required"),
  transaction_type_id: z.string().min(1, "Transaction type is required"),
  transaction_date: z.string().min(1, "Transaction date is required"),
  closing_date: z.string().optional(),
  agent_id: z.string().optional(),
  developer_id: z.string().optional().nullable(),
  project_id: z.string().optional().nullable(),

  // Property fields
  property_address: z.string().min(5, "Property address is required"),
  property_city: z.string().min(1, "City is required"),
  property_state: z.string().min(1, "State is required"),
  property_zip: z.string().min(1, "Zip code is required"),
  property_type: z.string().min(1, "Property type is required"),

  // Client information
  primary_client_name: z.string().min(1, "Client name is required"),
  primary_client_email: z.string().email("Invalid email").optional().or(z.literal('')),
  primary_client_phone: z.string().optional().or(z.literal('')),
  primary_client_type: z.string().min(1, "Client type is required"),
  primary_is_company: z.boolean().optional(),
  primary_company_name: z.string().optional().or(z.literal('')),
  primary_client_notes: z.string().optional().or(z.literal('')),

  // Secondary client
  include_secondary_party: z.boolean().optional(),
  secondary_client_name: z.string().optional().or(z.literal('')),
  secondary_client_email: z.string().email("Invalid email").optional().or(z.literal('')),
  secondary_client_phone: z.string().optional().or(z.literal('')),
  secondary_client_type: z.string().optional().or(z.literal('')),
  secondary_is_company: z.boolean().optional(),
  secondary_company_name: z.string().optional().or(z.literal('')),
  secondary_client_notes: z.string().optional().or(z.literal('')),

  // Co-broking fields
  co_broking_enabled: z.boolean().default(false),
  co_agent_id: z.string().optional().or(z.literal('')),
  co_agent_name: z.string().optional().or(z.literal('')),
  co_agent_email: z.string().email("Invalid email").optional().or(z.literal('')),
  commission_split: z.number().optional(),

  // Commission fields
  transaction_value: z.number().positive("Transaction value must be greater than 0"),
  commission_rate: z.number().positive("Commission rate must be greater than 0"),
  agent_tier: z.string().min(1, "Agent tier is required"),

  // Document fields
  documents: z.array(z.any()).optional(),
})

// Type for the transaction submission data
export type TransactionSubmission = z.infer<typeof transactionSubmissionSchema>

/**
 * Submit a new transaction
 */
export async function submitTransaction(data: any) {
  try {
    console.log("[DEBUG] Received transaction data:", JSON.stringify(data, null, 2));

    // Use our transaction service instead of the original implementation
    // This properly handles UUID fields and other data types
    return await submitTransactionService(data);
  } catch (error) {
    console.error("Error in submitTransaction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit transaction",
      details: String(error)
    }
  }
}

/**
 * Get transaction types
 */
export async function getTransactionTypes() {
  try {
    // Create Supabase client
    const supabase = createServerActionSupabaseClient()

    // Get transaction types
    const { data, error } = await supabase
      .from('transaction_types')
      .select('*')
      .order('name')

    if (error) {
      console.error("Error fetching transaction types:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in getTransactionTypes:", error)
    return { success: false, error: "Failed to fetch transaction types" }
  }
}

/**
 * Get transactions
 */
export async function getTransactions() {
  try {
    // Create Supabase client
    const supabase = createServerActionSupabaseClient()

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Get transactions
    const { data, error } = await supabase
      .from('property_transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching transactions:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in getTransactions:", error)
    return { success: false, error: "Failed to fetch transactions" }
  }
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(id: string) {
  try {
    // Create Supabase client
    const supabase = createServerActionSupabaseClient()

    // Get transaction
    const { data, error } = await supabase
      .from('property_transactions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error("Error fetching transaction:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in getTransactionById:", error)
    return { success: false, error: "Failed to fetch transaction" }
  }
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(id: string, status: string, notes?: string) {
  try {
    // Create Supabase client
    const supabase = createServerActionSupabaseClient()

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Update transaction
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
      console.error("Error updating transaction status:", error)
      return { success: false, error: error.message }
    }

    // Revalidate paths
    revalidatePath("/agent/transactions")
    revalidatePath(`/agent/transactions/${id}`)
    revalidatePath("/admin/transactions")
    revalidatePath(`/admin/transactions/${id}`)

    // Also revalidate old paths for backward compatibility
    revalidatePath("/agent-layout/transactions")
    revalidatePath(`/agent-layout/transactions/${id}`)
    revalidatePath("/admin-layout/admin-dashboard/transactions")
    revalidatePath(`/admin-layout/admin-dashboard/transactions/${id}`)

    return { success: true, data: data[0] }
  } catch (error) {
    console.error("Error in updateTransactionStatus:", error)
    return { success: false, error: "Failed to update transaction status" }
  }
}
