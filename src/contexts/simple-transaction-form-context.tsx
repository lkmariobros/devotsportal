"use client"

import React, { createContext, useContext, useState } from "react"

// Define the form data type
export interface TransactionFormData {
  step: number
  transactionType: string
  marketType: string
  propertyType: string
  propertyAddress: string
  propertyCity: string
  propertyState: string
  propertyZip: string
  clientName: string
  clientEmail: string
  clientPhone: string
  cobroking: boolean
  cobrokingAgentName: string
  cobrokingAgentCompany: string
  transactionValue: number
  commissionRate: number
  commissionAmount: number
  documents: any[]
}

// Default form data
const defaultFormData: TransactionFormData = {
  step: 1,
  transactionType: "",
  marketType: "",
  propertyType: "",
  propertyAddress: "",
  propertyCity: "",
  propertyState: "",
  propertyZip: "",
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  cobroking: false,
  cobrokingAgentName: "",
  cobrokingAgentCompany: "",
  transactionValue: 0,
  commissionRate: 0,
  commissionAmount: 0,
  documents: []
}

// Create the context
interface TransactionFormContextType {
  formData: TransactionFormData
  setFormData: React.Dispatch<React.SetStateAction<TransactionFormData>>
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  updateFormField: <K extends keyof TransactionFormData>(
    field: K,
    value: TransactionFormData[K]
  ) => void
  resetForm: () => void
  isStepComplete: (step: number) => boolean
}

const TransactionFormContext = createContext<TransactionFormContextType | undefined>(undefined)

// Create the provider
export function TransactionFormProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<TransactionFormData>(defaultFormData)

  const nextStep = () => {
    setFormData(prev => ({ ...prev, step: Math.min(prev.step + 1, 7) }))
  }

  const prevStep = () => {
    setFormData(prev => ({ ...prev, step: Math.max(prev.step - 1, 1) }))
  }

  const goToStep = (step: number) => {
    setFormData(prev => ({ ...prev, step: Math.min(Math.max(step, 1), 7) }))
  }

  const updateFormField = <K extends keyof TransactionFormData>(
    field: K,
    value: TransactionFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData(defaultFormData)
  }

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1: // Transaction Type
        return !!formData.transactionType && !!formData.marketType
      case 2: // Property Selection
        return !!formData.propertyType && !!formData.propertyAddress
      case 3: // Client Information
        return !!formData.clientName && !!formData.clientEmail
      case 4: // Co-Broking Setup
        return true // Always complete as it's optional
      case 5: // Commission Calculation
        return formData.transactionValue > 0 && formData.commissionRate > 0
      case 6: // Document Upload
        return true // Always complete as it's optional
      case 7: // Review
        return true // Always complete as it's just a review
      default:
        return false
    }
  }

  return (
    <TransactionFormContext.Provider
      value={{
        formData,
        setFormData,
        nextStep,
        prevStep,
        goToStep,
        updateFormField,
        resetForm,
        isStepComplete
      }}
    >
      {children}
    </TransactionFormContext.Provider>
  )
}

// Create a hook to use the context
export function useTransactionForm() {
  const context = useContext(TransactionFormContext)
  if (context === undefined) {
    throw new Error("useTransactionForm must be used within a TransactionFormProvider")
  }
  return context
}
