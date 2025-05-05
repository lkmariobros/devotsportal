"use client"

// Inline implementation of useTransactionForm
interface TransactionFormContextType {
  currentStep: number
  totalSteps: number
}

function useTransactionForm(): TransactionFormContextType {
  // Default implementation
  return {
    currentStep: 1,
    totalSteps: 7
  }
}

interface FormProgressProps {
  stepLabels?: string[]
}

export function FormProgress({
  stepLabels = [
    "Transaction Type",
    "Property",
    "Client",
    "Co-Broking",
    "Commission",
    "Documents",
    "Review"
  ]
}: FormProgressProps) {
  const { currentStep, totalSteps } = useTransactionForm()

  return (
    <div className="mb-8">
      <div className="hidden md:flex justify-between mb-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm ${
              i + 1 === currentStep
                ? 'bg-primary text-primary-foreground font-medium'
                : i + 1 < currentStep
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      <div className="hidden md:flex justify-between mt-2 text-xs">
        {stepLabels.map((label, i) => (
          <span
            key={i}
            className={`${
              i + 1 === currentStep
                ? 'text-primary font-medium'
                : i + 1 < currentStep
                ? 'text-primary/70'
                : 'text-muted-foreground'
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Mobile view - just show current step */}
      <div className="flex md:hidden justify-between mt-2 text-sm">
        <span className="text-primary font-medium">
          Step {currentStep}: {stepLabels[currentStep - 1]}
        </span>
        <span className="text-muted-foreground">
          {currentStep} of {totalSteps}
        </span>
      </div>
    </div>
  )
}
