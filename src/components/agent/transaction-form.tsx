"use client"

import { useState } from "react"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateField, DateInput } from "@/components/ui/datefield-rac"
import { parseDate, DateValue } from "@internationalized/date"
import { FormState } from "@/actions/transactions"
import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/reusable-ui/radio-group"
import { calculateCommission } from "@/utils/commission"
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckLine,
  RiUploadLine,
  RiFileUploadLine
} from "@remixicon/react"

// Form schemas for each step
const transactionTypeSchema = z.object({
  transaction_type_id: z.string().uuid({
    message: "Please select a transaction type"
  }),
  transaction_date: z.string({
    required_error: "Transaction date is required"
  }),
  closing_date: z.string().optional(),
})

const propertySchema = z.object({
  property_address: z.string().min(5, "Address must be at least 5 characters"),
  property_city: z.string().min(2, "City is required"),
  property_state: z.string().min(2, "State is required"),
  property_zip: z.string().min(5, "ZIP code is required"),
  property_type: z.string().min(1, "Property type is required"),
})

const clientSchema = z.object({
  client_name: z.string().min(2, "Client name is required"),
  client_email: z.string().email("Invalid email address").optional().or(z.literal('')),
  client_phone: z.string().optional().or(z.literal('')),
  client_type: z.enum(["buyer", "seller", "landlord", "tenant"]),
  // Make company_name optional but required if is_company is true
  is_company: z.boolean().optional().default(false),
  company_name: z.string().optional().or(z.literal(''))
}).superRefine((data, ctx) => {
  // If is_company is true, company_name is required
  if (data.is_company && (!data.company_name || data.company_name.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Company name is required when 'This client is a company' is checked",
      path: ['company_name']
    });
  }
})

const coBrokingSchema = z.object({
  co_broking_enabled: z.boolean(),
  commission_split: z.number().min(1).max(99).optional(),
}).refine(data => {
  // If co-broking is enabled, commission split is required
  return !data.co_broking_enabled || (data.co_broking_enabled && data.commission_split !== undefined);
}, {
  message: "Commission split is required when co-broking is enabled",
  path: ["commission_split"],
})

const commissionSchema = z.object({
  transaction_value: z.number().positive("Transaction value must be greater than 0"),
  commission_rate: z.number().positive("Commission rate must be greater than 0"),
  agent_tier: z.string().min(1, "Agent tier is required"),
})

// Initial form state
const initialState: FormState = {
  errors: {
    transaction_type_id: undefined,
    transaction_date: undefined,
    closing_date: undefined,
    property_address: undefined,
    property_city: undefined,
    property_state: undefined,
    property_zip: undefined,
    property_type: undefined,
    client_name: undefined,
    client_email: undefined,
    client_phone: undefined,
    client_type: undefined,
    is_company: undefined,
    company_name: undefined,
    co_broking_enabled: undefined,
    commission_split: undefined,
    transaction_value: undefined,
    commission_rate: undefined,
    agent_tier: undefined,
  },
  message: "",
}

interface TransactionFormProps {
  agentId: string
  transactionTypes: {
    id: string
    name: string
  }[]
}

export function TransactionForm({ agentId, transactionTypes }: TransactionFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  // Set default values for development mode
  const defaultFormData = process.env.NODE_ENV === 'development' ? {
    // Step 1: Transaction Type & Date
    transaction_type_id: "123e4567-e89b-12d3-a456-426614174000", // Mock ID for development
    transaction_date: new Date().toISOString().split("T")[0],
    closing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
    agent_id: agentId,

    // Step 2: Property Selection
    property_address: "123 Development St",
    property_city: "Test City",
    property_state: "Test State",
    property_zip: "12345",
    property_type: "single_family",
    property_bedrooms: "3",
    property_bathrooms: "2",
    property_square_feet: "1500",

    // Step 3: Client Information
    client_name: "Test Client",
    client_email: "test@example.com",
    client_phone: "555-123-4567",
    client_type: "buyer", // buyer, seller, landlord, tenant
    is_company: false,
    company_name: "",

    // Step 4: Co-Broking Setup
    co_broking_enabled: false,
    co_agent_id: "",
    co_agent_name: "",
    co_agent_email: "",
    commission_split: 50, // default 50/50 split

    // Step 5: Commission Calculation
    transaction_value: 500000,
    commission_rate: 2.5, // default commission rate
    agent_tier: "Advisor", // default tier

    // Step 6: Document Upload
    documents: [] as File[],
  } : {
    // Step 1: Transaction Type & Date
    transaction_type_id: "",
    transaction_date: new Date().toISOString().split("T")[0],
    closing_date: "",
    agent_id: agentId,

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
    client_name: "",
    client_email: "",
    client_phone: "",
    client_type: "buyer", // buyer, seller, landlord, tenant
    is_company: false,
    company_name: "",

    // Step 4: Co-Broking Setup
    co_broking_enabled: false,
    co_agent_id: "",
    co_agent_name: "",
    co_agent_email: "",
    commission_split: 50, // default 50/50 split

    // Step 5: Commission Calculation
    transaction_value: 0,
    commission_rate: 2.5, // default commission rate
    agent_tier: "Advisor", // default tier

    // Step 6: Document Upload
    documents: [] as File[],
  };

  const [formData, setFormData] = useState(defaultFormData)
  const [state, setState] = useState(initialState)

  const totalSteps = 7

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleDateChange = (field: string, value: DateValue | null) => {
    setFormData({
      ...formData,
      [field]: value ? value.toString() : "",
    })
  }

  const validateStep = () => {
    // For development mode, bypass validation
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Bypassing validation for step', currentStep);
      return true;
    }

    try {
      switch (currentStep) {
        case 1: // Transaction Type & Date
          transactionTypeSchema.parse(formData)
          break
        case 2: // Property Selection
          propertySchema.parse(formData)
          break
        case 3: // Client Information
          console.log('Validating client information:', {
            client_name: formData.client_name,
            client_email: formData.client_email,
            client_phone: formData.client_phone,
            client_type: formData.client_type,
            is_company: formData.is_company,
            company_name: formData.company_name
          })
          clientSchema.parse(formData)
          break
        case 4: // Co-Broking Setup
          coBrokingSchema.parse(formData)
          break
        case 5: // Commission Calculation
          commissionSchema.parse(formData)
          break
        case 6: // Document Upload
          // No validation needed for document upload
          break
        case 7: // Review
          // No validation needed for review
          break
        default:
          return true
      }
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.flatten())

        // Set form errors for better user feedback
        const formErrors = error.flatten().fieldErrors;

        // Create a custom state object with the errors
        const newState: { errors: Record<string, string[]>; message: string } = {
          errors: {},
          message: "Please fix the validation errors before proceeding."
        };

        // Add each field error to the state
        Object.keys(formErrors).forEach(field => {
          const fieldKey = field as keyof typeof formErrors;
          const fieldErrors = formErrors[fieldKey];

          if (fieldErrors && fieldErrors.length > 0) {
            newState.errors[field] = fieldErrors;
          }
        });

        // Update the form state with the errors
        // This would normally use setState, but we're using a mock for simplicity
        console.log("Form validation errors:", newState);
      } else {
        console.error("Unknown validation error:", error);
      }
      return false;
    }
  }

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep()) {
      return
    }

    // For development mode, just show success message
    if (process.env.NODE_ENV === 'development') {
      console.log('Form submitted successfully (Development Mode):', formData)
      setState({
        ...state,
        message: "Transaction created successfully (Development Mode)"
      })
      return
    }

    // In production, we would call the server action here
    try {
      // This would be replaced with the actual server action call
      console.log('Submitting form data:', formData)

      // Simulate successful submission
      setState({
        ...state,
        message: "Transaction created successfully"
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      setState({
        ...state,
        message: "Error creating transaction. Please try again."
      })
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 mx-1 rounded-full ${
                  index + 1 <= currentStep
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Transaction Type & Date</h2>
              <p className="text-muted-foreground">
                Select the type of transaction and relevant dates.
              </p>

              <div className="space-y-4 mt-6">
                <div>
                  <label htmlFor="transaction_type" className="block text-sm font-medium mb-1">
                    Transaction Type
                  </label>
                  <Select
                    value={formData.transaction_type_id}
                    onValueChange={(value) => handleInputChange("transaction_type_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      {transactionTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {state?.errors?.transaction_type_id && (
                    <p className="text-sm text-red-500 mt-1">
                      {state.errors.transaction_type_id}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="transaction_date" className="block text-sm font-medium mb-1">
                    Transaction Date
                  </label>
                  <DateField
                    value={formData.transaction_date ? parseDate(formData.transaction_date) : null}
                    onChange={(date) => handleDateChange("transaction_date", date)}
                  >
                    <DateInput />
                  </DateField>
                  {state?.errors?.transaction_date && (
                    <p className="text-sm text-red-500 mt-1">
                      {state.errors.transaction_date}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="closing_date" className="block text-sm font-medium mb-1">
                    Expected Closing Date (Optional)
                  </label>
                  <DateField
                    value={formData.closing_date ? parseDate(formData.closing_date) : null}
                    onChange={(date) => handleDateChange("closing_date", date)}
                  >
                    <DateInput />
                  </DateField>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Property Selection</h2>
              <p className="text-muted-foreground">
                Enter the property details for this transaction.
              </p>

              <div className="space-y-4 mt-6">
                <div>
                  <label htmlFor="property_address" className="block text-sm font-medium mb-1">
                    Property Address
                  </label>
                  <Input
                    id="property_address"
                    value={formData.property_address}
                    onChange={(e) => handleInputChange("property_address", e.target.value)}
                    placeholder="123 Main St"
                    className="w-full"
                  />
                  {state?.errors?.property_address && (
                    <p className="text-sm text-red-500 mt-1">
                      {state.errors.property_address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="property_city" className="block text-sm font-medium mb-1">
                      City
                    </label>
                    <Input
                      id="property_city"
                      value={formData.property_city}
                      onChange={(e) => handleInputChange("property_city", e.target.value)}
                      placeholder="City"
                    />
                    {state?.errors?.property_city && (
                      <p className="text-sm text-red-500 mt-1">
                        {state.errors.property_city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="property_state" className="block text-sm font-medium mb-1">
                      State
                    </label>
                    <Input
                      id="property_state"
                      value={formData.property_state}
                      onChange={(e) => handleInputChange("property_state", e.target.value)}
                      placeholder="State"
                    />
                    {state?.errors?.property_state && (
                      <p className="text-sm text-red-500 mt-1">
                        {state.errors.property_state}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="property_zip" className="block text-sm font-medium mb-1">
                      ZIP Code
                    </label>
                    <Input
                      id="property_zip"
                      value={formData.property_zip}
                      onChange={(e) => handleInputChange("property_zip", e.target.value)}
                      placeholder="ZIP Code"
                    />
                    {state?.errors?.property_zip && (
                      <p className="text-sm text-red-500 mt-1">
                        {state.errors.property_zip}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="property_type" className="block text-sm font-medium mb-1">
                    Property Type
                  </label>
                  <Select
                    value={formData.property_type}
                    onValueChange={(value) => handleInputChange("property_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_family">Single Family Home</SelectItem>
                      <SelectItem value="condo">Condominium</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="multi_family">Multi-Family</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                  {state?.errors?.property_type && (
                    <p className="text-sm text-red-500 mt-1">
                      {state.errors.property_type}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="property_bedrooms" className="block text-sm font-medium mb-1">
                      Bedrooms (Optional)
                    </label>
                    <Input
                      id="property_bedrooms"
                      type="number"
                      value={formData.property_bedrooms}
                      onChange={(e) => handleInputChange("property_bedrooms", e.target.value)}
                      placeholder="Number of bedrooms"
                    />
                  </div>

                  <div>
                    <label htmlFor="property_bathrooms" className="block text-sm font-medium mb-1">
                      Bathrooms (Optional)
                    </label>
                    <Input
                      id="property_bathrooms"
                      type="number"
                      step="0.5"
                      value={formData.property_bathrooms}
                      onChange={(e) => handleInputChange("property_bathrooms", e.target.value)}
                      placeholder="Number of bathrooms"
                    />
                  </div>

                  <div>
                    <label htmlFor="property_square_feet" className="block text-sm font-medium mb-1">
                      Square Feet (Optional)
                    </label>
                    <Input
                      id="property_square_feet"
                      type="number"
                      value={formData.property_square_feet}
                      onChange={(e) => handleInputChange("property_square_feet", e.target.value)}
                      placeholder="Square footage"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Client Information</h2>
              <p className="text-muted-foreground">
                Enter the client details for this transaction.
              </p>

              <div className="space-y-4 mt-6">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="is_company">
                    <Checkbox
                      id="is_company"
                      checked={formData.is_company}
                      onCheckedChange={(checked) => {
                        handleInputChange("is_company", checked === true)
                      }}
                    />
                    <span className="ml-2">This client is a company</span>
                  </Label>
                </div>

                {formData.is_company && (
                  <div>
                    <label htmlFor="company_name" className="block text-sm font-medium mb-1">
                      Company Name
                    </label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange("company_name", e.target.value)}
                      placeholder="Company Name"
                      className="w-full"
                    />
                    {state?.errors?.company_name && (
                      <p className="text-sm text-red-500 mt-1">
                        {state.errors.company_name}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="client_name" className="block text-sm font-medium mb-1">
                    {formData.is_company ? "Contact Person" : "Client Name"}
                  </label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => handleInputChange("client_name", e.target.value)}
                    placeholder={formData.is_company ? "Contact Person" : "Client Name"}
                    className="w-full"
                  />
                  {state?.errors?.client_name && (
                    <p className="text-sm text-red-500 mt-1">
                      {state.errors.client_name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="client_email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <Input
                      id="client_email"
                      type="email"
                      value={formData.client_email}
                      onChange={(e) => handleInputChange("client_email", e.target.value)}
                      placeholder="Email Address"
                    />
                    {state?.errors?.client_email && (
                      <p className="text-sm text-red-500 mt-1">
                        {state.errors.client_email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="client_phone" className="block text-sm font-medium mb-1">
                      Phone Number
                    </label>
                    <Input
                      id="client_phone"
                      value={formData.client_phone}
                      onChange={(e) => handleInputChange("client_phone", e.target.value)}
                      placeholder="Phone Number"
                    />
                    {state?.errors?.client_phone && (
                      <p className="text-sm text-red-500 mt-1">
                        {state.errors.client_phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Client Type
                  </label>
                  <RadioGroup
                    value={formData.client_type}
                    onValueChange={(value: string) => handleInputChange("client_type", value)}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="buyer" id="buyer" />
                      <Label htmlFor="buyer">Buyer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="seller" id="seller" />
                      <Label htmlFor="seller">Seller</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="landlord" id="landlord" />
                      <Label htmlFor="landlord">Landlord</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tenant" id="tenant" />
                      <Label htmlFor="tenant">Tenant</Label>
                    </div>
                  </RadioGroup>
                  {state?.errors?.client_type && (
                    <p className="text-sm text-red-500 mt-1">
                      {state.errors.client_type}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Co-Broking Setup</h2>
              <p className="text-muted-foreground">
                Set up co-broking details if this transaction involves another agent.
              </p>

              <div className="space-y-4 mt-6">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="co_broking_enabled">
                    <Checkbox
                      id="co_broking_enabled"
                      checked={formData.co_broking_enabled}
                      onCheckedChange={(checked) => {
                        handleInputChange("co_broking_enabled", checked === true)
                      }}
                    />
                    <span className="ml-2">This transaction involves co-broking</span>
                  </Label>
                </div>

                {formData.co_broking_enabled && (
                  <div className="space-y-4 border p-4 rounded-md">
                    <div>
                      <label htmlFor="co_agent_name" className="block text-sm font-medium mb-1">
                        Co-Agent Name
                      </label>
                      <Input
                        id="co_agent_name"
                        value={formData.co_agent_name}
                        onChange={(e) => handleInputChange("co_agent_name", e.target.value)}
                        placeholder="Co-Agent Name"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="co_agent_email" className="block text-sm font-medium mb-1">
                        Co-Agent Email
                      </label>
                      <Input
                        id="co_agent_email"
                        type="email"
                        value={formData.co_agent_email}
                        onChange={(e) => handleInputChange("co_agent_email", e.target.value)}
                        placeholder="Co-Agent Email"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="commission_split" className="block text-sm font-medium mb-1">
                        Commission Split (% for your agency)
                      </label>
                      <div className="flex items-center">
                        <Input
                          id="commission_split"
                          type="number"
                          min="1"
                          max="99"
                          value={formData.commission_split}
                          onChange={(e) => handleInputChange("commission_split", parseInt(e.target.value) || 50)}
                          className="w-20"
                        />
                        <span className="ml-2">%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Co-broker will receive {100 - (formData.commission_split as number)}%
                      </p>
                      {state?.errors?.commission_split && (
                        <p className="text-sm text-red-500 mt-1">
                          {state.errors.commission_split}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Commission Calculation</h2>
              <p className="text-muted-foreground">
                Enter transaction value and commission details.
              </p>

              <div className="space-y-4 mt-6">
                <div>
                  <label htmlFor="transaction_value" className="block text-sm font-medium mb-1">
                    Transaction Value
                  </label>
                  <div className="flex items-center">
                    <span className="mr-2">RM</span>
                    <Input
                      id="transaction_value"
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.transaction_value || ''}
                      onChange={(e) => handleInputChange("transaction_value", parseFloat(e.target.value) || 0)}
                      className="w-full"
                    />
                  </div>
                  {state?.errors?.transaction_value && (
                    <p className="text-sm text-red-500 mt-1">
                      {state.errors.transaction_value}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="commission_rate" className="block text-sm font-medium mb-1">
                    Commission Rate (%)
                  </label>
                  <div className="flex items-center">
                    <Input
                      id="commission_rate"
                      type="number"
                      min="0.1"
                      step="0.1"
                      max="10"
                      value={formData.commission_rate || ''}
                      onChange={(e) => handleInputChange("commission_rate", parseFloat(e.target.value) || 0)}
                      className="w-20"
                    />
                    <span className="ml-2">%</span>
                  </div>
                  {state?.errors?.commission_rate && (
                    <p className="text-sm text-red-500 mt-1">
                      {state.errors.commission_rate}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="agent_tier" className="block text-sm font-medium mb-1">
                    Agent Tier
                  </label>
                  <Select
                    value={formData.agent_tier}
                    onValueChange={(value: string) => handleInputChange("agent_tier", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Advisor">Advisor (70%)</SelectItem>
                      <SelectItem value="Sales Leader">Sales Leader (80%)</SelectItem>
                      <SelectItem value="Team Leader">Team Leader (83%)</SelectItem>
                      <SelectItem value="Group Leader">Group Leader (85%)</SelectItem>
                      <SelectItem value="Supreme Leader">Supreme Leader (85%)</SelectItem>
                    </SelectContent>
                  </Select>
                  {state?.errors?.agent_tier && (
                    <p className="text-sm text-red-500 mt-1">
                      {state.errors.agent_tier}
                    </p>
                  )}
                </div>

                {/* Commission Breakdown */}
                {formData.transaction_value > 0 && formData.commission_rate > 0 && (
                  <div className="mt-6 border p-4 rounded-md bg-muted/50">
                    <h3 className="text-lg font-medium mb-3">Commission Breakdown</h3>
                    {(() => {
                      // Calculate commission
                      const commission = calculateCommission({
                        transactionValue: formData.transaction_value as number,
                        commissionRate: formData.commission_rate as number,
                        agentTier: formData.agent_tier,
                        coBroking: {
                          enabled: formData.co_broking_enabled,
                          commissionSplit: formData.commission_split as number
                        }
                      })

                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Transaction Value:</span>
                            <span>RM{formData.transaction_value.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Commission Rate:</span>
                            <span>{formData.commission_rate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Commission:</span>
                            <span>RM{commission.totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>

                          {formData.co_broking_enabled && (
                            <>
                              <div className="flex justify-between">
                                <span>Our Agency's Portion ({formData.commission_split}%):</span>
                                <span>RM{commission.ourAgencyCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Co-Broker's Portion ({100 - (formData.commission_split as number)}%):</span>
                                <span>RM{(commission.coAgencyCommission || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            </>
                          )}

                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between">
                              <span>Agent Tier:</span>
                              <span>{commission.agentTier} ({commission.agentCommissionPercentage}%)</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Your Commission:</span>
                              <span className="font-bold">RM{commission.agentShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Agency's Share:</span>
                              <span>RM{commission.agencyShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Document Upload</h2>
              <p className="text-muted-foreground">
                Upload relevant documents for this transaction.
              </p>

              <div className="space-y-4 mt-6">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <RiFileUploadLine className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-2 text-sm font-semibold">Upload Documents</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Drag and drop files here, or click to select files
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Supported formats: PDF, JPG, PNG (Max 10MB each)
                  </p>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      // This would normally handle file uploads
                      // For now, we'll just store the file names
                      if (e.target.files) {
                        const fileList = Array.from(e.target.files)
                        setFormData({
                          ...formData,
                          documents: fileList
                        })
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      document.getElementById('file-upload')?.click()
                    }}
                  >
                    <RiUploadLine className="mr-2 h-4 w-4" />
                    Select Files
                  </Button>
                </div>

                {formData.documents.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Selected Files</h3>
                    <ul className="space-y-2">
                      {formData.documents.map((file, index) => (
                        <li key={index} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center">
                            <span className="text-sm">{file.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newDocuments = [...formData.documents]
                              newDocuments.splice(index, 1)
                              setFormData({
                                ...formData,
                                documents: newDocuments
                              })
                            }}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Review & Submit</h2>
              <p className="text-muted-foreground">
                Review your transaction details before submitting.
              </p>

              <div className="space-y-6 mt-6">
                {/* Transaction Type & Date */}
                <div className="border p-4 rounded-md">
                  <h3 className="text-md font-medium mb-3">Transaction Type & Date</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Transaction Type:</p>
                      <p className="font-medium">
                        {transactionTypes.find(t => t.id === formData.transaction_type_id)?.name || 'Not selected'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Transaction Date:</p>
                      <p className="font-medium">
                        {formData.transaction_date ? new Date(formData.transaction_date).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                    {formData.closing_date && (
                      <div>
                        <p className="text-sm text-muted-foreground">Expected Closing Date:</p>
                        <p className="font-medium">
                          {new Date(formData.closing_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Property Details */}
                <div className="border p-4 rounded-md">
                  <h3 className="text-md font-medium mb-3">Property Details</h3>
                  <div className="space-y-2">
                    <p className="font-medium">{formData.property_address}</p>
                    <p>{formData.property_city}, {formData.property_state} {formData.property_zip}</p>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Property Type:</p>
                        <p className="font-medium">
                          {{
                            'single_family': 'Single Family Home',
                            'condo': 'Condominium',
                            'townhouse': 'Townhouse',
                            'multi_family': 'Multi-Family',
                            'land': 'Land',
                            'commercial': 'Commercial'
                          }[formData.property_type] || formData.property_type}
                        </p>
                      </div>
                      {formData.property_bedrooms && (
                        <div>
                          <p className="text-sm text-muted-foreground">Bedrooms:</p>
                          <p className="font-medium">{formData.property_bedrooms}</p>
                        </div>
                      )}
                      {formData.property_bathrooms && (
                        <div>
                          <p className="text-sm text-muted-foreground">Bathrooms:</p>
                          <p className="font-medium">{formData.property_bathrooms}</p>
                        </div>
                      )}
                      {formData.property_square_feet && (
                        <div>
                          <p className="text-sm text-muted-foreground">Square Feet:</p>
                          <p className="font-medium">{formData.property_square_feet}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Client Information */}
                <div className="border p-4 rounded-md">
                  <h3 className="text-md font-medium mb-3">Client Information</h3>
                  <div className="space-y-2">
                    {formData.is_company && (
                      <div>
                        <p className="text-sm text-muted-foreground">Company:</p>
                        <p className="font-medium">{formData.company_name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {formData.is_company ? 'Contact Person:' : 'Client Name:'}
                      </p>
                      <p className="font-medium">{formData.client_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Email:</p>
                        <p className="font-medium">{formData.client_email || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone:</p>
                        <p className="font-medium">{formData.client_phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Client Type:</p>
                      <p className="font-medium capitalize">{formData.client_type}</p>
                    </div>
                  </div>
                </div>

                {/* Co-Broking Information */}
                {formData.co_broking_enabled && (
                  <div className="border p-4 rounded-md">
                    <h3 className="text-md font-medium mb-3">Co-Broking Information</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Co-Agent Name:</p>
                        <p className="font-medium">{formData.co_agent_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Co-Agent Email:</p>
                        <p className="font-medium">{formData.co_agent_email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Commission Split:</p>
                        <p className="font-medium">{formData.commission_split}% / {100 - (formData.commission_split as number)}%</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Commission Information */}
                <div className="border p-4 rounded-md">
                  <h3 className="text-md font-medium mb-3">Commission Information</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Transaction Value:</p>
                        <p className="font-medium">${formData.transaction_value.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Commission Rate:</p>
                        <p className="font-medium">{formData.commission_rate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Agent Tier:</p>
                        <p className="font-medium">{formData.agent_tier}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="border p-4 rounded-md">
                  <h3 className="text-md font-medium mb-3">Documents</h3>
                  {formData.documents.length > 0 ? (
                    <ul className="space-y-1">
                      {formData.documents.map((file, index) => (
                        <li key={index} className="text-sm">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No documents uploaded</p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="mt-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms">
                      I confirm that all information provided is accurate and complete
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {state?.message && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mt-6">
              {state.message}
            </div>
          )}

          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={handlePrevious}>
                <RiArrowLeftLine className="mr-2 h-4 w-4" />
                Previous
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => router.push("/agent")}>
                Cancel
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button type="button" onClick={handleNext}>
                Next
                <RiArrowRightLine className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit">
                <RiCheckLine className="mr-2 h-4 w-4" />
                Submit
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}