'use server'

import { z } from 'zod'
import { createServerSupabaseClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Transaction form schema
const transactionSchema = z.object({
  // Step 1: Transaction Type & Date
  transaction_type_id: z.string().uuid({
    message: "Please select a transaction type"
  }),
  transaction_date: z.string({
    required_error: "Transaction date is required"
  }),
  closing_date: z.string().optional(),
  agent_id: z.string(),

  // Step 2: Property Selection
  property_address: z.string().min(5, "Address must be at least 5 characters"),
  property_city: z.string().min(2, "City is required"),
  property_state: z.string().min(2, "State is required"),
  property_zip: z.string().min(5, "ZIP code is required"),
  property_type: z.string().min(1, "Property type is required"),
  property_bedrooms: z.string().optional(),
  property_bathrooms: z.string().optional(),
  property_square_feet: z.string().optional(),

  // Step 3: Client Information
  client_name: z.string().min(2, "Client name is required"),
  client_email: z.string().email("Invalid email address").optional().or(z.literal('')),
  client_phone: z.string().optional().or(z.literal('')),
  client_type: z.enum(["buyer", "seller", "landlord", "tenant"]),
  is_company: z.boolean().optional().default(false),
  company_name: z.string().optional().or(z.literal('')),

  // Step 4: Co-Broking Setup
  co_broking_enabled: z.boolean(),
  co_agent_id: z.string().optional().or(z.literal('')),
  co_agent_name: z.string().optional().or(z.literal('')),
  co_agent_email: z.string().optional().or(z.literal('')),
  commission_split: z.number().min(1).max(99).optional(),

  // Step 5: Commission Calculation
  transaction_value: z.number().positive("Transaction value must be greater than 0"),
  commission_rate: z.number().positive("Commission rate must be greater than 0"),
  agent_tier: z.string().min(1, "Agent tier is required"),
})

export type FormState = {
  errors?: {
    // Step 1: Transaction Type & Date
    transaction_type_id?: string[]
    transaction_date?: string[]
    closing_date?: string[]

    // Step 2: Property Selection
    property_address?: string[]
    property_city?: string[]
    property_state?: string[]
    property_zip?: string[]
    property_type?: string[]
    property_bedrooms?: string[]
    property_bathrooms?: string[]
    property_square_feet?: string[]

    // Step 3: Client Information
    client_name?: string[]
    client_email?: string[]
    client_phone?: string[]
    client_type?: string[]
    is_company?: string[]
    company_name?: string[]

    // Step 4: Co-Broking Setup
    co_broking_enabled?: string[]
    co_agent_id?: string[]
    co_agent_name?: string[]
    co_agent_email?: string[]
    commission_split?: string[]

    // Step 5: Commission Calculation
    transaction_value?: string[]
    commission_rate?: string[]
    agent_tier?: string[]

    // Allow for additional fields
    [key: string]: string[] | undefined
  }
  message?: string
}

export async function createTransaction(
  prevState: FormState,
  formData: any
): Promise<FormState> {
  // For development mode, bypass validation and database operations
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: Bypassing transaction creation');
    console.log('Form data:', formData);

    // Simulate successful transaction creation
    return {
      message: "Transaction created successfully (Development Mode)"
    };
  }

  // Validate form data
  const validatedFields = transactionSchema.safeParse(formData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing fields. Failed to create transaction."
    }
  }

  const supabase = createServerSupabaseClient()

  try {
    // Insert transaction into database
    const { data, error } = await supabase
      .from('property_transactions')
      .insert({
        // Step 1: Transaction Type & Date
        transaction_type_id: validatedFields.data.transaction_type_id,
        transaction_date: validatedFields.data.transaction_date,
        closing_date: validatedFields.data.closing_date,
        agent_id: validatedFields.data.agent_id,

        // Step 2: Property Selection
        property_address: validatedFields.data.property_address,
        property_city: validatedFields.data.property_city,
        property_state: validatedFields.data.property_state,
        property_zip: validatedFields.data.property_zip,
        property_type: validatedFields.data.property_type,
        property_bedrooms: validatedFields.data.property_bedrooms,
        property_bathrooms: validatedFields.data.property_bathrooms,
        property_square_feet: validatedFields.data.property_square_feet,

        // Step 3: Client Information
        client_name: validatedFields.data.client_name,
        client_email: validatedFields.data.client_email,
        client_phone: validatedFields.data.client_phone,
        client_type: validatedFields.data.client_type,
        is_company: validatedFields.data.is_company,
        company_name: validatedFields.data.company_name,

        // Step 4: Co-Broking Setup
        co_broking_enabled: validatedFields.data.co_broking_enabled,
        co_agent_id: validatedFields.data.co_agent_id,
        co_agent_name: validatedFields.data.co_agent_name,
        co_agent_email: validatedFields.data.co_agent_email,
        commission_split: validatedFields.data.commission_split,

        // Step 5: Commission Calculation
        transaction_value: validatedFields.data.transaction_value,
        commission_rate: validatedFields.data.commission_rate,
        agent_tier: validatedFields.data.agent_tier,

        // Status and timestamps
        status: 'Pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return {
        message: `Database error: ${error.message}`,
      }
    }

    // Revalidate the transactions page
    revalidatePath("/agent-layout/transactions')

    // Redirect to the transaction details page
    redirect(`/agent/transactions/${data.id}`)
  } catch (error) {
    return {
      message: "Failed to create transaction."
    }
  }
}