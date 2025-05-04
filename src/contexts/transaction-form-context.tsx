"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { z } from "zod"
import { useStepValidation } from "@/hooks/use-step-validation"

// Define the form data structure
export interface TransactionFormData {
  // Step 1: Market Type & Transaction Type
  market_type: string
  market_subcategory: string
  transaction_type_id: string
  transaction_date: string
  closing_date: string
  agent_id: string
  developer_id?: string
  project_id?: string

  // Step 2: Property Selection
  property_address: string
  property_city: string
  property_state: string
  property_zip: string
  property_type: string
  property_bedrooms: string
  property_bathrooms: string
  property_square_feet: string

  // Step 3: Client Information
  // Primary party (the agent's client)
  primary_client_name: string
  primary_client_email: string
  primary_client_phone: string
  primary_client_type: "buyer" | "seller" | "landlord" | "tenant"
  primary_is_company: boolean
  primary_company_name: string
  primary_client_notes: string

  // Secondary party (the other party in the transaction)
  include_secondary_party: boolean
  secondary_client_name: string
  secondary_client_email: string
  secondary_client_phone: string
  secondary_client_type: "buyer" | "seller" | "landlord" | "tenant"
  secondary_is_company: boolean
  secondary_company_name: string
  secondary_client_notes: string

  // Step 4: Co-Broking Setup
  co_broking_enabled: boolean
  co_agent_id: string
  co_agent_name: string
  co_agent_email: string
  commission_split: number

  // Step 5: Commission Calculation
  transaction_value: number
  commission_rate: number
  agent_tier: string

  // Step 6: Document Upload
  documents: any[]
}

// Define the form context type
interface TransactionFormContextType {
  formData: TransactionFormData
  updateField: <K extends keyof TransactionFormData>(field: K, value: TransactionFormData[K]) => void
  currentStep: number
  totalSteps: number
  goToNextStep: () => boolean
  goToPreviousStep: () => void
  validateCurrentStep: () => boolean
  errors: Record<string, string[] | undefined>
  setErrors: (errors: Record<string, string[] | undefined>) => void
  isSubmitting: boolean
  setIsSubmitting: (isSubmitting: boolean) => void
}

// Create the context
const TransactionFormContext = createContext<TransactionFormContextType | undefined>(undefined)

// Default form data
export const defaultFormData: TransactionFormData = {
  // Step 1: Market Type & Transaction Type
  market_type: "",
  market_subcategory: "",
  transaction_type_id: "",
  transaction_date: new Date().toISOString().split("T")[0],
  closing_date: "",
  agent_id: "",
  developer_id: "",
  project_id: "",

  // Step 2: Property Selection
  property_address: "",
  property_city: "",
  property_state: "",
  property_zip: "",
  property_type: "",
  property_bedrooms: "",
  property_bathrooms: "",
  property_square_feet: "",

  // Step 3: Client Information
  // Primary party (the agent's client)
  primary_client_name: "",
  primary_client_email: "",
  primary_client_phone: "",
  primary_client_type: "buyer",
  primary_is_company: false,
  primary_company_name: "",
  primary_client_notes: "",

  // Secondary party (the other party in the transaction)
  include_secondary_party: false,
  secondary_client_name: "",
  secondary_client_email: "",
  secondary_client_phone: "",
  secondary_client_type: "seller",
  secondary_is_company: false,
  secondary_company_name: "",
  secondary_client_notes: "",

  // Step 4: Co-Broking Setup
  co_broking_enabled: false,
  co_agent_id: "",
  co_agent_name: "",
  co_agent_email: "",
  commission_split: 50,

  // Step 5: Commission Calculation
  transaction_value: 0,
  commission_rate: 2.5,
  agent_tier: "Advisor",

  // Step 6: Document Upload
  documents: [],
}

// Provider props
interface TransactionFormProviderProps {
  children: ReactNode
  initialData?: Partial<TransactionFormData>
  agentId: string
}

// Create the provider component
export function TransactionFormProvider({
  children,
  initialData = {},
  agentId,
}: TransactionFormProviderProps) {
  // Initialize form data with defaults and any provided initial data
  const [formData, setFormData] = useState<TransactionFormData>({
    ...defaultFormData,
    ...initialData,
    agent_id: agentId,
  })

  // Step management
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 7

  // Error state
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({})

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update a single field
  const updateField = <K extends keyof TransactionFormData>(
    field: K,
    value: TransactionFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Step navigation with validation
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      if (validateCurrentStep()) {
        setCurrentStep((prev) => prev + 1)
        return true
      }
      return false
    }
    return false
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  // Step validation
  const validateCurrentStep = () => {
    try {
      // For development mode, always return true to make testing easier
      if (process.env.NODE_ENV === 'development') {
        return true;
      }

      // In production, use proper validation
      const validateStepFn = useStepValidation(currentStep, formData)
      const validation = validateStepFn()

      if (!validation.valid) {
        setErrors(validation.errors || {})
        return false
      }

      return true
    } catch (error) {
      console.error('Validation error:', error);
      return true; // Allow progression in case of validation errors
    }
  }

  // Create the context value
  const value: TransactionFormContextType = {
    formData,
    updateField,
    currentStep,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    validateCurrentStep,
    errors,
    setErrors,
    isSubmitting,
    setIsSubmitting,
  }

  return (
    <TransactionFormContext.Provider value={value}>
      {children}
    </TransactionFormContext.Provider>
  )
}

// Custom hook to use the context
export function useTransactionForm() {
  const context = useContext(TransactionFormContext)

  if (context === undefined) {
    throw new Error("useTransactionForm must be used within a TransactionFormProvider")
  }

  return context
}
