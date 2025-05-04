"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { TransactionFormProvider, useTransactionForm } from "@/contexts/transaction-form-context"
import { useStepValidation } from "@/hooks/use-step-validation"
import { FormProgress } from "@/components/agent/form-progress"
import { FormNavigation } from "@/components/agent/form-navigation"
import { TransactionTypeStep } from "@/components/agent/transaction-steps/transaction-type-step"
import { PropertySelectionStep } from "@/components/agent/transaction-steps/property-selection-step"
import { ClientInformationStep } from "@/components/agent/transaction-steps/client-information-step"
import { CoBrokingStep } from "@/components/agent/transaction-steps/co-broking-step"
import { CommissionCalculationStep } from "@/components/agent/transaction-steps/commission-calculation-step"
import { DocumentUploadStep } from "@/components/agent/transaction-steps/document-upload-step"
import { ReviewStep } from "@/components/agent/transaction-steps/review-step"

interface TransactionFormProps {
  agentId: string
  transactionTypes: { id: string; name: string }[]
  action: any // Allow any action function type
  initialState?: any
}

function TransactionFormContent({
  transactionTypes,
  action
}: {
  transactionTypes: { id: string; name: string }[]
  action: any
}) {
  const router = useRouter()
  const {
    formData,
    currentStep,
    setErrors,
    setIsSubmitting
  } = useTransactionForm()

  // Get validation function for current step
  const validateStep = useStepValidation(currentStep, formData)

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate the current step
    const validation = validateStep()

    if (!validation.valid) {
      setErrors(validation.errors || {})
      return
    }

    // If we're on the final step, submit the form
    if (currentStep === 7) {
      setIsSubmitting(true)

      try {
        // Convert string values to appropriate types for submission
        const submissionData = {
          ...formData,
          // Convert string values to numbers where needed
          transaction_value: parseFloat(formData.transaction_value as any) || 0,
          commission_rate: parseFloat(formData.commission_rate as any) || 0,
          commission_split: parseInt(formData.commission_split as any) || 50,
          // Convert string values to booleans where needed
          is_company: Boolean(formData.is_company),
          co_broking_enabled: Boolean(formData.co_broking_enabled),
        }

        // Submit form data using the server action
        const result = await action(submissionData)

        // Handle success
        if (result?.success) {
          // Show success message
          console.log("Transaction created successfully:", result.message)

          // Redirect to transactions list
          router.push("/agent/transactions")
        } else {
          // Show error message
          console.error("Error creating transaction:", result?.message)
        }
      } catch (error) {
        console.error("Error submitting form:", error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <FormProgress />

          {currentStep === 1 && (
            <TransactionTypeStep transactionTypes={transactionTypes} />
          )}

          {currentStep === 2 && (
            <PropertySelectionStep />
          )}

          {currentStep === 3 && (
            <ClientInformationStep />
          )}

          {currentStep === 4 && (
            <CoBrokingStep />
          )}

          {currentStep === 5 && (
            <CommissionCalculationStep />
          )}

          {currentStep === 6 && (
            <DocumentUploadStep />
          )}

          {currentStep === 7 && (
            <ReviewStep />
          )}

          <FormNavigation />
        </CardContent>
      </Card>
    </form>
  )
}

export function TransactionFormNew({
  agentId,
  transactionTypes,
  action,
  initialState
}: TransactionFormProps) {
  return (
    <TransactionFormProvider agentId={agentId}>
      <TransactionFormContent
        transactionTypes={transactionTypes}
        action={action}
      />
    </TransactionFormProvider>
  )
}
