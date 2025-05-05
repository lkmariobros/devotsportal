"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
// Inline implementation of useTransactionForm
interface TransactionFormContextType {
  currentStep: number
  totalSteps: number
  goToNextStep: () => void
  goToPreviousStep: () => void
  isSubmitting: boolean
}

function useTransactionForm(): TransactionFormContextType {
  // Default implementation
  return {
    currentStep: 1,
    totalSteps: 7,
    goToNextStep: () => {},
    goToPreviousStep: () => {},
    isSubmitting: false
  }
}
import { RiArrowLeftLine, RiArrowRightLine, RiCheckLine } from "@remixicon/react"

interface FormNavigationProps {
  onSubmit?: () => void
}

export function FormNavigation({ onSubmit }: FormNavigationProps) {
  const router = useRouter()
  const {
    currentStep,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    isSubmitting
  } = useTransactionForm()

  const handleNext = () => {
    goToNextStep()
  }

  const handlePrevious = () => {
    goToPreviousStep()
  }

  const handleCancel = () => {
    // Navigate back to the agent dashboard
    router.push("/agent")
  }

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit()
    }
  }

  return (
    <div className="flex justify-between mt-8">
      {currentStep > 1 ? (
        <Button type="button" variant="outline" onClick={handlePrevious}>
          <RiArrowLeftLine className="mr-2 h-4 w-4" />
          Previous
        </Button>
      ) : (
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      )}

      {currentStep < totalSteps ? (
        <Button type="button" onClick={handleNext}>
          Next
          <RiArrowRightLine className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          <RiCheckLine className="mr-2 h-4 w-4" />
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      )}
    </div>
  )
}
