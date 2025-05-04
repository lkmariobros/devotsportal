"use client"

import { useTransactionForm } from "@/contexts/transaction-form-context"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useEffect } from "react"

// Client information form component for either primary or secondary party
function ClientInfoForm({
  prefix,
  isCompany,
  clientType,
  errors,
  updateField,
  formData,
  isSecondary = false,
  onPrimaryClientTypeChange
}: {
  prefix: 'primary' | 'secondary'
  isCompany: boolean
  clientType: string
  errors: Record<string, string[] | undefined>
  updateField: <K extends keyof any>(field: K, value: any) => void
  formData: any
  isSecondary?: boolean
  onPrimaryClientTypeChange?: (value: string) => void
}) {
  // Suggest fields based on client type
  const isBuyer = clientType === 'buyer'
  const isSeller = clientType === 'seller'
  const isLandlord = clientType === 'landlord'
  const isTenant = clientType === 'tenant'

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`${prefix}_is_company`}
          checked={isCompany}
          onCheckedChange={(checked) => updateField(`${prefix}_is_company`, Boolean(checked))}
        />
        <Label htmlFor={`${prefix}_is_company`}>This {isSecondary ? 'party' : 'client'} is a company</Label>
      </div>

      {isCompany && (
        <div className="grid gap-2">
          <Label htmlFor={`${prefix}_company_name`}>
            Company Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${prefix}_company_name`}
            value={formData[`${prefix}_company_name`]}
            onChange={(e) => updateField(`${prefix}_company_name`, e.target.value)}
            placeholder="Enter company name"
          />
          {errors?.[`${prefix}_company_name`] && (
            <p className="text-sm text-destructive">{errors[`${prefix}_company_name`][0]}</p>
          )}
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor={`${prefix}_client_name`}>
          {isCompany ? "Contact Person" : (isSecondary ? "Party Name" : "Client Name")} <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`${prefix}_client_name`}
          value={formData[`${prefix}_client_name`]}
          onChange={(e) => updateField(`${prefix}_client_name`, e.target.value)}
          placeholder={isCompany ? "Enter contact person name" : (isSecondary ? "Enter party name" : "Enter client name")}
        />
        {errors?.[`${prefix}_client_name`] && (
          <p className="text-sm text-destructive">{errors[`${prefix}_client_name`][0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`${prefix}_client_email`}>Email Address</Label>
          <Input
            id={`${prefix}_client_email`}
            type="email"
            value={formData[`${prefix}_client_email`]}
            onChange={(e) => updateField(`${prefix}_client_email`, e.target.value)}
            placeholder="Enter email address"
          />
          {errors?.[`${prefix}_client_email`] && (
            <p className="text-sm text-destructive">{errors[`${prefix}_client_email`][0]}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${prefix}_client_phone`}>Phone Number</Label>
          <Input
            id={`${prefix}_client_phone`}
            value={formData[`${prefix}_client_phone`]}
            onChange={(e) => updateField(`${prefix}_client_phone`, e.target.value)}
            placeholder="Enter phone number"
          />
          {errors?.[`${prefix}_client_phone`] && (
            <p className="text-sm text-destructive">{errors[`${prefix}_client_phone`][0]}</p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label>
          {isSecondary ? "Party Type" : "Client Type"} <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={formData[`${prefix}_client_type`]}
          onValueChange={(value) => {
            if (prefix === 'primary' && onPrimaryClientTypeChange) {
              // Use the special handler for primary client type
              onPrimaryClientTypeChange(value);
            } else {
              // Regular update for secondary client type
              updateField(`${prefix}_client_type`, value as any);
            }
          }}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="buyer" id={`${prefix}_buyer`} />
            <Label htmlFor={`${prefix}_buyer`} className="cursor-pointer">Buyer</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="seller" id={`${prefix}_seller`} />
            <Label htmlFor={`${prefix}_seller`} className="cursor-pointer">Seller</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="landlord" id={`${prefix}_landlord`} />
            <Label htmlFor={`${prefix}_landlord`} className="cursor-pointer">Landlord</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="tenant" id={`${prefix}_tenant`} />
            <Label htmlFor={`${prefix}_tenant`} className="cursor-pointer">Tenant</Label>
          </div>
        </RadioGroup>
        {errors?.[`${prefix}_client_type`] && (
          <p className="text-sm text-destructive">{errors[`${prefix}_client_type`][0]}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${prefix}_client_notes`}>Notes</Label>
        <Textarea
          id={`${prefix}_client_notes`}
          value={formData[`${prefix}_client_notes`]}
          onChange={(e) => updateField(`${prefix}_client_notes`, e.target.value)}
          placeholder="Add any additional notes about this client"
          className="min-h-[80px]"
        />
      </div>

      {/* Conditional fields based on client type */}
      {isBuyer && (
        <div className="p-3 border rounded-md bg-blue-50">
          <h4 className="font-medium text-sm">Buyer Information</h4>
          <p className="text-xs text-muted-foreground mt-1">
            For buyers, consider collecting pre-approval information and preferred move-in dates.
          </p>
        </div>
      )}

      {isSeller && (
        <div className="p-3 border rounded-md bg-amber-50">
          <h4 className="font-medium text-sm">Seller Information</h4>
          <p className="text-xs text-muted-foreground mt-1">
            For sellers, consider collecting information about property condition and preferred closing timeline.
          </p>
        </div>
      )}

      {isLandlord && (
        <div className="p-3 border rounded-md bg-green-50">
          <h4 className="font-medium text-sm">Landlord Information</h4>
          <p className="text-xs text-muted-foreground mt-1">
            For landlords, consider collecting information about rental terms and property management preferences.
          </p>
        </div>
      )}

      {isTenant && (
        <div className="p-3 border rounded-md bg-purple-50">
          <h4 className="font-medium text-sm">Tenant Information</h4>
          <p className="text-xs text-muted-foreground mt-1">
            For tenants, consider collecting information about rental requirements and move-in timeline.
          </p>
        </div>
      )}
    </div>
  )
}

export function ClientInformationStep() {
  const { formData, updateField, errors } = useTransactionForm()

  // Helper function to get complementary client type
  const getComplementaryClientType = (clientType: string) => {
    switch (clientType) {
      case 'buyer': return 'seller';
      case 'seller': return 'buyer';
      case 'landlord': return 'tenant';
      case 'tenant': return 'landlord';
      default: return 'seller';
    }
  };

  // Handle secondary party toggle
  const handleSecondaryPartyToggle = (checked: boolean) => {
    updateField('include_secondary_party', Boolean(checked));

    // If enabling secondary party, set the complementary type
    if (checked) {
      updateField('secondary_client_type', getComplementaryClientType(formData.primary_client_type));
    }
  };

  // Handle primary client type change
  const handlePrimaryClientTypeChange = (value: string) => {
    updateField('primary_client_type', value as any);

    // If secondary party is included, update its type to be complementary
    if (formData.include_secondary_party) {
      updateField('secondary_client_type', getComplementaryClientType(value));
    }
  };

  // Get transaction type for context
  const isRental = formData.market_type === 'rental';
  const isSale = formData.market_type === 'secondary' || formData.market_type === 'primary'

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Transaction Parties</h2>
          <p className="text-muted-foreground">
            Enter details for all parties involved in this {isRental ? 'rental' : 'sale'} transaction.
          </p>
        </div>

        <div className="hidden md:block w-1/3 bg-muted/50 p-4 rounded-lg">
          <h3 className="font-medium text-sm">Tips</h3>
          <ul className="text-sm text-muted-foreground mt-2 space-y-2">
            <li>• Include contact information for both parties</li>
            <li>• For company clients, add the primary contact person</li>
            <li>• Add notes about special requirements or preferences</li>
          </ul>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Transaction Type Context */}
        <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
          <div>
            <h3 className="font-medium">Transaction Context</h3>
            <p className="text-sm text-muted-foreground">This is a {isRental ? 'rental' : 'sale'} transaction</p>
          </div>
          <Badge variant="outline" className={isRental ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}>
            {isRental ? 'Rental' : 'Sale'}
          </Badge>
        </div>

        {/* Primary Client Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Your Client</CardTitle>
            <CardDescription>
              This is the party you are directly representing in this transaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientInfoForm
              prefix="primary"
              isCompany={formData.primary_is_company}
              clientType={formData.primary_client_type}
              errors={errors}
              updateField={updateField}
              formData={formData}
              onPrimaryClientTypeChange={handlePrimaryClientTypeChange}
            />
          </CardContent>
        </Card>

        {/* Secondary Party Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">Include Other Party</h3>
            <p className="text-sm text-muted-foreground">
              Add details for the {formData.primary_client_type === 'buyer' ? 'seller' :
                                  formData.primary_client_type === 'seller' ? 'buyer' :
                                  formData.primary_client_type === 'landlord' ? 'tenant' : 'landlord'} in this transaction
            </p>
          </div>
          <Checkbox
            id="include_secondary_party"
            checked={formData.include_secondary_party}
            onCheckedChange={(checked) => handleSecondaryPartyToggle(Boolean(checked))}
          />
        </div>

        {/* Secondary Party Card - Only show if include_secondary_party is true */}
        {formData.include_secondary_party && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Other Party</CardTitle>
              <CardDescription>
                This is the {formData.primary_client_type === 'buyer' ? 'seller' :
                            formData.primary_client_type === 'seller' ? 'buyer' :
                            formData.primary_client_type === 'landlord' ? 'tenant' : 'landlord'} in this transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientInfoForm
                prefix="secondary"
                isCompany={formData.secondary_is_company}
                clientType={formData.secondary_client_type}
                errors={errors}
                updateField={updateField}
                formData={formData}
                isSecondary={true}
                onPrimaryClientTypeChange={handlePrimaryClientTypeChange}
              />
            </CardContent>
          </Card>
        )}

        {/* Relationship Summary */}
        {formData.include_secondary_party && formData.primary_client_name && formData.secondary_client_name && (
          <div className="p-4 border rounded-lg bg-blue-50">
            <h3 className="font-medium">Transaction Relationship</h3>
            <p className="text-sm mt-2">
              In this transaction, <strong>{formData.primary_client_name}</strong> ({formData.primary_client_type}) is
              {isRental ? ' renting from ' : ' purchasing from '}
              <strong>{formData.secondary_client_name}</strong> ({formData.secondary_client_type}).
            </p>
            <p className="text-sm mt-1 text-muted-foreground">
              You are representing <strong>{formData.primary_client_name}</strong> in this transaction.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
