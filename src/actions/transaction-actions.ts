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
  agent_id: z.string().min(1, "Agent ID is required"),
  developer_id: z.string().optional().nullable(),
  project_id: z.string().optional().nullable(),

  // Property fields
  property_address: z.string().min(5, "Property address is required"),
  property_city: z.string().min(1, "City is required"),
  property_state: z.string().min(1, "State is required"),
  property_zip: z.string().min(1, "Postal code is required"),
  property_type: z.string().min(1, "Property type is required"),
  property_bedrooms: z.string().optional(),
  property_bathrooms: z.string().optional(),
  property_square_feet: z.string().optional(),

  // Primary client fields
  primary_client_name: z.string().min(2, "Client name is required"),
  primary_client_email: z.string().email("Invalid email").optional().or(z.literal('')),
  primary_client_phone: z.string().optional().or(z.literal('')),
  primary_client_type: z.enum(["buyer", "seller", "landlord", "tenant"]),
  primary_is_company: z.boolean().default(false),
  primary_company_name: z.string().optional().or(z.literal('')),
  primary_client_notes: z.string().optional().or(z.literal('')),

  // Secondary client fields
  include_secondary_party: z.boolean().default(false),
  secondary_client_name: z.string().optional().or(z.literal('')),
  secondary_client_email: z.string().email("Invalid email").optional().or(z.literal('')),
  secondary_client_phone: z.string().optional().or(z.literal('')),
  secondary_client_type: z.enum(["buyer", "seller", "landlord", "tenant"]),
  secondary_is_company: z.boolean().default(false),
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

    /* Original implementation commented out - keeping for reference
    // Create Supabase client using our custom function with hardcoded fallbacks
    const supabase = createServerActionSupabaseClient();
    console.log("[DEBUG] Supabase client created successfully");

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    console.log("[DEBUG] User authentication checked", user?.id || 'No user found');

    if (!user) {
      console.log("No authenticated user found, using mock user ID");
      // For development, use a mock user ID
      const mockUserId = "00000000-0000-0000-0000-000000000000";

      // Prepare transaction data
      const transactionData: any = {
        id: crypto.randomUUID(), // Generate a UUID for the transaction

        // Required fields
        transaction_date: data.transaction_date || new Date().toISOString().split('T')[0],

        // Essential fields only
        market_type: data.market_type || 'secondary',
        market_subcategory: data.market_subcategory || 'residential',
        // Don't include transaction_type_id yet - we'll handle it separately
        property_address: data.property_address || 'Mock Address',
        property_city: data.property_city || 'Mock City',
        property_state: data.property_state || 'Mock State',
        property_zip: data.property_zip || '00000',
        property_type: data.property_type || 'Condominium',
        primary_client_name: data.primary_client_name || 'Mock Client',
        primary_client_type: data.primary_client_type || 'buyer',
        transaction_value: typeof data.transaction_value === 'number' ? data.transaction_value : 500000,

        // Status and audit fields
        status: 'pending',
        created_by: mockUserId,
        updated_by: mockUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Handle UUID fields correctly
      // For transaction_type_id, we need to generate a UUID if it's not already one
      if (data.transaction_type_id) {
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.transaction_type_id)) {
          // It's already a valid UUID, use it as is
          transactionData.transaction_type_id = data.transaction_type_id;
        } else {
          // It's not a UUID (e.g., 'sale' or 'rental'), so generate a UUID
          transactionData.transaction_type_id = crypto.randomUUID();
        }
      }

      console.log("Inserting transaction with mock user ID");

      // Insert the transaction
      const { data: transaction, error } = await supabase
        .from('property_transactions')
        .insert([transactionData])
        .select();

      if (error) {
        console.error("Database error:", error);
        // Return mock success for development
        return {
          success: true,
          message: "Transaction received successfully (mock response despite DB error)",
          data: {
            id: "mock-id-" + Date.now(),
            ...data,
            created_at: new Date().toISOString()
          },
          error: error.message
        };
      }

      console.log("Transaction inserted successfully");
      return {
        success: true,
        data: transaction[0],
        message: "Transaction submitted successfully"
      };
    }

    // User is authenticated, proceed with normal flow
    console.log("User authenticated:", user.id);

    // Prepare transaction data
    const transactionData: any = {
      id: crypto.randomUUID(), // Generate a UUID for the transaction

      // Required fields
      transaction_date: data.transaction_date || new Date().toISOString().split('T')[0],

      // Essential fields only
      market_type: data.market_type || 'secondary',
      market_subcategory: data.market_subcategory || 'residential',
      // Don't include transaction_type_id yet - we'll handle it separately
      property_address: data.property_address || 'Mock Address',
      property_city: data.property_city || 'Mock City',
      property_state: data.property_state || 'Mock State',
      property_zip: data.property_zip || '00000',
      property_type: data.property_type || 'Condominium',
      primary_client_name: data.primary_client_name || 'Mock Client',
      primary_client_type: data.primary_client_type || 'buyer',
      transaction_value: typeof data.transaction_value === 'number' ? data.transaction_value : 500000,

      // Status and audit fields
      status: 'pending',
      created_by: user.id,
      updated_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Handle UUID fields correctly
    // For transaction_type_id, we need to generate a UUID if it's not already one
    if (data.transaction_type_id) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.transaction_type_id)) {
        // It's already a valid UUID, use it as is
        transactionData.transaction_type_id = data.transaction_type_id;
      } else {
        // It's not a UUID (e.g., 'sale' or 'rental'), so generate a UUID
        transactionData.transaction_type_id = crypto.randomUUID();
      }
    }

    console.log("[DEBUG] Inserting transaction with data:", JSON.stringify(transactionData, null, 2));

    // Insert the transaction
    const { data: transaction, error } = await supabase
      .from('property_transactions')
      .insert([transactionData])
      .select();

    if (error) {
      console.error("[DEBUG] Database error:", error);
      return { success: false, error: `Database error: ${error.message}` };
    }

    console.log("[DEBUG] Transaction inserted successfully:", transaction ? JSON.stringify(transaction[0], null, 2) : 'No data returned');

    // Revalidate the transactions list page
    revalidatePath("/agent-layout/transactions');

    return {
      success: true,
      data: transaction[0],
      message: "Transaction submitted successfully"
    };
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

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

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

    // Update transaction status
    const { data, error } = await supabase
      .from('property_transactions')
      .update({
        status,
        admin_notes: notes,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error("Error updating transaction status:", error)
      return { success: false, error: error.message }
    }

    // Revalidate the transactions list page
    revalidatePath("/admin-layout/transactions")
    revalidatePath(`/admin-dashboard/transactions/${id}`)

    return { success: true, data: data[0] }
  } catch (error) {
    console.error("Error in updateTransactionStatus:", error)
    return { success: false, error: "Failed to update transaction status" }
  }
}

