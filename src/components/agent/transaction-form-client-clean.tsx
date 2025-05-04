"use client"

import { useState } from "react"
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
import { submitTransaction } from "@/actions/transaction-actions-clean"
import { minimalServerAction } from "@/actions/minimal-action"
import { toast } from "sonner"

interface TransactionFormProps {
  agentId: string
  transactionTypes: { id: string; name: string }[]
}

function TransactionFormContent({
  transactionTypes
}: {
  transactionTypes: { id: string; name: string }[]
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
          // Market type fields
          market_type: formData.market_type,
          market_subcategory: formData.market_subcategory,
          // Convert string values to numbers where needed
          transaction_value: parseFloat(formData.transaction_value as any) || 0,
          commission_rate: parseFloat(formData.commission_rate as any) || 0,
          // Don't include commission_split as it's causing type issues
          // Convert string values to booleans where needed
          primary_is_company: Boolean(formData.primary_is_company),
          secondary_is_company: Boolean(formData.secondary_is_company),
          include_secondary_party: Boolean(formData.include_secondary_party),
          co_broking_enabled: Boolean(formData.co_broking_enabled),
          // Developer fields (for primary market)
          developer_id: formData.developer_id || null,
          project_id: formData.project_id || null,
        }

        console.log("Submitting transaction data:", JSON.stringify(submissionData, null, 2));

        // First, try the minimal server action to test basic functionality
        console.log("Trying minimal server action...");
        let minimalResult: Record<string, unknown>;
        try {
          minimalResult = await minimalServerAction({ test: true, timestamp: new Date().toISOString() });
          console.log("Minimal server action result:", minimalResult);
        } catch (minimalError) {
          console.error("Minimal server action failed:", minimalError);
          toast.error("Server communication test failed. Please check your connection.");
          setIsSubmitting(false);
          return;
        }

        // Now try the actual submission with our fixed implementation
        console.log("Submitting transaction with fixed action...");
        let result: Record<string, unknown>;

        try {
          // Use our fixed transaction action
          result = await submitTransaction(submissionData);
          console.log("Transaction submission result:", result);
        } catch (submissionError) {
          console.error("Transaction submission failed:", submissionError instanceof Error ? submissionError.message : submissionError);
          toast.error("Transaction submission failed. Please try again later.");
          setIsSubmitting(false);
          return;
        }
        console.log("Server action response:", result);

        if (result && result.success) {
          // Show success message
          toast.success("Transaction submitted successfully");

          // Redirect to transactions list
          router.push("/agent/transactions");
        } else {
          // Show error message with more details
          const errorMessage = result && 'error' in result && result.error ?
            String(result.error) : "Failed to submit transaction";
          toast.error(errorMessage);

          // If there are validation errors, set them in the form
          if (result && 'validationErrors' in result && result.validationErrors) {
            setErrors(result.validationErrors as Record<string, string[]>);
          }
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("An unexpected error occurred. Please try again later.");
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  return (
    <>
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
    </>
  )
}

export function TransactionFormClient({
  agentId,
  transactionTypes,
}: TransactionFormProps) {
  return (
    <TransactionFormProvider agentId={agentId}>
      <TransactionFormContent
        transactionTypes={transactionTypes}
      />
    </TransactionFormProvider>
  )
}
