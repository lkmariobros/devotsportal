"use client"

import { useTransactionForm } from "@/contexts/transaction-form-context"
import { useCommissionCalculation } from "@/hooks/use-commission-calculation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { RiEditLine } from "@remixicon/react"

export function ReviewStep() {
  const { formData, currentStep, totalSteps, goToPreviousStep } = useTransactionForm()
  const commission = useCommissionCalculation(formData)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified'

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Get property type display name
  const getPropertyTypeName = (type: string) => {
    const propertyTypes: Record<string, string> = {
      'condo': 'Condominium',
      'landed': 'Landed',
      'commercial': 'Commercial',
      'land': 'Land'
    }
    return propertyTypes[type] || type
  }

  // Get market type display name
  const getMarketTypeName = (type: string) => {
    const marketTypes: Record<string, string> = {
      'primary': 'Primary Market',
      'secondary': 'Secondary Market',
      'rental': 'Rental Market'
    }
    return marketTypes[type] || type
  }

  // Get subcategory display name
  const getSubcategoryName = (type: string) => {
    const subcategories: Record<string, string> = {
      'residential': 'Residential',
      'commercial': 'Commercial'
    }
    return subcategories[type] || type
  }

  // Get client type display name
  const getClientTypeName = (type: string) => {
    const clientTypes: Record<string, string> = {
      'buyer': 'Buyer',
      'seller': 'Seller',
      'landlord': 'Landlord',
      'tenant': 'Tenant'
    }
    return clientTypes[type] || type
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review & Submit</h2>
        <p className="text-muted-foreground">
          Review all information before submitting the transaction.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Market & Transaction Type */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-base">Market & Transaction Type</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => goToPreviousStep()}
              className="h-8 px-2"
            >
              <RiEditLine className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Market Type</dt>
                <dd className="font-medium">
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {getMarketTypeName(formData.market_type)}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Category</dt>
                <dd className="font-medium">{getSubcategoryName(formData.market_subcategory)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Transaction Type</dt>
                <dd className="font-medium">{formData.transaction_type_id || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Transaction Date</dt>
                <dd className="font-medium">{formatDate(formData.transaction_date)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Closing Date</dt>
                <dd className="font-medium">{formatDate(formData.closing_date)}</dd>
              </div>

              {/* Show developer fields for primary market */}
              {formData.market_type === 'primary' && formData.developer_id && (
                <div>
                  <dt className="text-muted-foreground">Developer</dt>
                  <dd className="font-medium">{formData.developer_id}</dd>
                </div>
              )}

              {formData.market_type === 'primary' && formData.project_id && (
                <div>
                  <dt className="text-muted-foreground">Project</dt>
                  <dd className="font-medium">{formData.project_id}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Property Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-base">Property Information</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => goToPreviousStep()}
              className="h-8 px-2"
            >
              <RiEditLine className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{formData.property_address}</h3>
                <p>{formData.property_city}, {formData.property_state} {formData.property_zip}</p>
              </div>

              <dl className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Property Type</dt>
                  <dd className="font-medium">{getPropertyTypeName(formData.property_type)}</dd>
                </div>
                {formData.property_bedrooms && (
                  <div>
                    <dt className="text-muted-foreground">Bedrooms</dt>
                    <dd className="font-medium">{formData.property_bedrooms}</dd>
                  </div>
                )}
                {formData.property_bathrooms && (
                  <div>
                    <dt className="text-muted-foreground">Bathrooms</dt>
                    <dd className="font-medium">{formData.property_bathrooms}</dd>
                  </div>
                )}
                {formData.property_square_feet && (
                  <div>
                    <dt className="text-muted-foreground">Square Feet</dt>
                    <dd className="font-medium">{formData.property_square_feet}</dd>
                  </div>
                )}
              </dl>
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-base">Transaction Parties</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => goToPreviousStep()}
              className="h-8 px-2"
            >
              <RiEditLine className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-6">
              {/* Primary Client */}
              <div>
                <h3 className="font-medium text-primary">Your Client</h3>
                <div className="mt-2 p-3 border rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{formData.primary_client_name}</h4>
                      {formData.primary_is_company && (
                        <p className="text-sm text-muted-foreground">Company: {formData.primary_company_name}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      {getClientTypeName(formData.primary_client_type)}
                    </Badge>
                  </div>

                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm mt-3">
                    <div>
                      <dt className="text-muted-foreground">Email</dt>
                      <dd className="font-medium">{formData.primary_client_email || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Phone</dt>
                      <dd className="font-medium">{formData.primary_client_phone || 'Not provided'}</dd>
                    </div>
                    {formData.primary_client_notes && (
                      <div className="col-span-2">
                        <dt className="text-muted-foreground">Notes</dt>
                        <dd className="font-medium">{formData.primary_client_notes}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {/* Secondary Party - Only show if included */}
              {formData.include_secondary_party && (
                <div>
                  <h3 className="font-medium text-muted-foreground">Other Party</h3>
                  <div className="mt-2 p-3 border rounded-md bg-muted/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{formData.secondary_client_name}</h4>
                        {formData.secondary_is_company && (
                          <p className="text-sm text-muted-foreground">Company: {formData.secondary_company_name}</p>
                        )}
                      </div>
                      <Badge variant="outline">
                        {getClientTypeName(formData.secondary_client_type)}
                      </Badge>
                    </div>

                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm mt-3">
                      <div>
                        <dt className="text-muted-foreground">Email</dt>
                        <dd className="font-medium">{formData.secondary_client_email || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Phone</dt>
                        <dd className="font-medium">{formData.secondary_client_phone || 'Not provided'}</dd>
                      </div>
                      {formData.secondary_client_notes && (
                        <div className="col-span-2">
                          <dt className="text-muted-foreground">Notes</dt>
                          <dd className="font-medium">{formData.secondary_client_notes}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              )}

              {/* Relationship Summary */}
              {formData.include_secondary_party && (
                <div className="p-3 border rounded-md bg-blue-50">
                  <h4 className="font-medium">Transaction Relationship</h4>
                  <p className="text-sm mt-1">
                    You are representing <strong>{formData.primary_client_name}</strong> ({getClientTypeName(formData.primary_client_type)})
                    in this transaction with <strong>{formData.secondary_client_name}</strong> ({getClientTypeName(formData.secondary_client_type)}).
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Co-Broking Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-base">Co-Broking Information</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => goToPreviousStep()}
              className="h-8 px-2"
            >
              <RiEditLine className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {formData.co_broking_enabled ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{formData.co_agent_name}</h3>
                  <p className="text-sm text-muted-foreground">{formData.co_agent_email}</p>
                </div>

                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Commission Split</dt>
                    <dd className="font-medium">{formData.commission_split}% / {100 - (typeof formData.commission_split === 'number' ? formData.commission_split : 50)}%</dd>
                  </div>
                  {formData.co_agent_id && (
                    <div>
                      <dt className="text-muted-foreground">Co-Agent ID</dt>
                      <dd className="font-medium">{formData.co_agent_id}</dd>
                    </div>
                  )}
                </dl>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No co-broking for this transaction.</p>
            )}
          </CardContent>
        </Card>

        {/* Commission Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-base">Commission Information</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => goToPreviousStep()}
              className="h-8 px-2"
            >
              <RiEditLine className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Transaction Value</dt>
                  <dd className="font-medium">{formatCurrency(formData.transaction_value)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Commission Rate</dt>
                  <dd className="font-medium">{formData.commission_rate}%</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Agent Tier</dt>
                  <dd className="font-medium">{formData.agent_tier}</dd>
                </div>
              </dl>

              <Separator />

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Total Commission</dt>
                  <dd className="font-medium">{formatCurrency(commission.totalCommission)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Your Share</dt>
                  <dd className="font-medium text-green-600">{formatCurrency(commission.agentShare)}</dd>
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>

        {/* Document Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-base">Document Information</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => goToPreviousStep()}
              className="h-8 px-2"
            >
              <RiEditLine className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {formData.documents.length > 0 ? (
              <div>
                <p className="mb-2">{formData.documents.length} document(s) uploaded:</p>
                <ul className="text-sm space-y-1">
                  {formData.documents.map((file, index) => (
                    <li key={index} className="font-medium">• {file.name}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No documents uploaded.</p>
            )}
          </CardContent>
        </Card>

        <div className="p-4 border rounded-lg bg-yellow-50">
          <h3 className="font-medium">Important Notice</h3>
          <p className="text-sm mt-1">
            By submitting this transaction, you confirm that all information provided is accurate and complete.
            The transaction will be submitted for review and approval.
          </p>
        </div>
      </div>
    </div>
  )
}
