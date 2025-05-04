"use client"

import { z } from "zod"
import { TransactionFormData } from "@/contexts/transaction-form-context"

// Step 1: Market Type & Transaction Type schema
export const transactionTypeSchema = z.object({
  market_type: z.string().min(1, "Market type is required"),
  market_subcategory: z.string().min(1, "Category is required"),
  transaction_type_id: z.string().min(1, "Transaction type is required"),
  transaction_date: z.string().min(1, "Transaction date is required"),
  closing_date: z.string().optional(),
  agent_id: z.string().min(1, "Agent ID is required"),
  developer_id: z.string().optional(),
  project_id: z.string().optional(),
})

// Step 2: Property Selection schema
export const propertySchema = z.object({
  property_address: z.string().min(5, "Address must be at least 5 characters"),
  property_city: z.string().min(2, "City is required"),
  property_state: z.string().min(2, "State is required"),
  property_zip: z.string().min(5, "ZIP code is required"),
  property_type: z.string().min(1, "Property type is required"),
  property_bedrooms: z.string().optional(),
  property_bathrooms: z.string().optional(),
  property_square_feet: z.string().optional(),
})

// Step 3: Client Information schema
export const clientSchema = z.object({
  // Primary party validation
  primary_client_name: z.string().min(2, "Client name is required"),
  primary_client_email: z.string().email("Invalid email address").optional().or(z.literal('')),
  primary_client_phone: z.string().optional().or(z.literal('')),
  primary_client_type: z.enum(["buyer", "seller", "landlord", "tenant"]),
  primary_is_company: z.boolean().optional().default(false),
  primary_company_name: z.string().optional().or(z.literal('')),
  primary_client_notes: z.string().optional().or(z.literal('')),

  // Secondary party validation
  include_secondary_party: z.boolean().optional().default(false),
  secondary_client_name: z.string().optional().or(z.literal('')),
  secondary_client_email: z.string().email("Invalid email address").optional().or(z.literal('')),
  secondary_client_phone: z.string().optional().or(z.literal('')),
  secondary_client_type: z.enum(["buyer", "seller", "landlord", "tenant"]),
  secondary_is_company: z.boolean().optional().default(false),
  secondary_company_name: z.string().optional().or(z.literal('')),
  secondary_client_notes: z.string().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  // If primary_is_company is true, primary_company_name is required
  if (data.primary_is_company && (!data.primary_company_name || data.primary_company_name.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Company name is required when 'This client is a company' is checked",
      path: ['primary_company_name']
    });
  }

  // If include_secondary_party is true, secondary_client_name is required
  if (data.include_secondary_party && (!data.secondary_client_name || data.secondary_client_name.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Secondary party name is required when including another party",
      path: ['secondary_client_name']
    });
  }

  // If secondary_is_company is true and include_secondary_party is true, secondary_company_name is required
  if (data.include_secondary_party && data.secondary_is_company &&
      (!data.secondary_company_name || data.secondary_company_name.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Company name is required when 'This client is a company' is checked",
      path: ['secondary_company_name']
    });
  }
})

// Step 4: Co-Broking Setup schema
export const coBrokingSchema = z.object({
  co_broking_enabled: z.boolean(),
  co_agent_id: z.string().optional(),
  co_agent_name: z.string().optional(),
  co_agent_email: z.string().email("Invalid email address").optional().or(z.literal('')),
  commission_split: z.number().min(1, "Split must be at least 1%").max(99, "Split must be at most 99%").optional(),
}).superRefine((data, ctx) => {
  // If co_broking_enabled is true, co_agent_name is required
  if (data.co_broking_enabled) {
    if (!data.co_agent_name || data.co_agent_name.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Co-agent name is required when co-broking is enabled",
        path: ['co_agent_name']
      });
    }

    if (!data.commission_split) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Commission split is required when co-broking is enabled",
        path: ['commission_split']
      });
    }
  }
})

// Step 5: Commission Calculation schema
export const commissionSchema = z.object({
  transaction_value: z.number().positive("Transaction value must be greater than 0"),
  commission_rate: z.number().positive("Commission rate must be greater than 0"),
  agent_tier: z.string().min(1, "Agent tier is required"),
})

// Step 6: Document Upload schema
export const documentsSchema = z.object({
  documents: z.array(z.any()).optional(),
})

// Hook for step validation
export function useStepValidation(step: number, formData: TransactionFormData) {
  return (): { valid: boolean; errors?: Record<string, string[]> } => {
    try {
      switch (step) {
        case 1:
          transactionTypeSchema.parse(formData)
          break
        case 2:
          propertySchema.parse(formData)
          break
        case 3:
          clientSchema.parse(formData)
          break
        case 4:
          coBrokingSchema.parse(formData)
          break
        case 5:
          commissionSchema.parse(formData)
          break
        case 6:
          documentsSchema.parse(formData)
          break
        case 7:
          // Review step - no validation needed
          break
        default:
          return { valid: false, errors: { _form: ["Invalid step"] } }
      }

      return { valid: true }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.flatten().fieldErrors as Record<string, string[]>,
        }
      }

      return {
        valid: false,
        errors: { _form: ["An unexpected error occurred"] },
      }
    }
  }
}
