"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { submitTransactionFixed } from "@/utils/transaction-service-fixed"

export default function SimpleTransactionFormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setResult(null)

    try {
      // Get form data
      const formData = new FormData(e.currentTarget)
      const data = {
        // Market type
        market_type: formData.get('market_type') as string,
        market_subcategory: formData.get('market_subcategory') as string,
        transaction_type_id: formData.get('transaction_type') as string,

        // Property
        property_address: formData.get('property_address') as string,
        property_city: formData.get('property_city') as string,
        property_state: formData.get('property_state') as string,
        property_zip: formData.get('property_zip') as string,
        property_type: formData.get('property_type') as string,

        // Client
        primary_client_name: formData.get('client_name') as string,
        primary_client_email: formData.get('client_email') as string,
        primary_client_phone: formData.get('client_phone') as string,
        primary_client_type: formData.get('client_type') as string,

        // Transaction details
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_value: parseFloat(formData.get('transaction_value') as string),
        commission_rate: parseFloat(formData.get('commission_rate') as string),
      }

      // Submit the transaction
      const result = await submitTransactionFixed(data)
      setResult(result)
    } catch (error) {
      console.error('Error submitting transaction:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Simple Transaction Form</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Submit a Transaction</CardTitle>
          <CardDescription>
            A simplified form that correctly handles UUID fields
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Market Type */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Market & Transaction Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="market_type">Market Type</Label>
                  <Select name="market_type" defaultValue="secondary">
                    <SelectTrigger id="market_type">
                      <SelectValue placeholder="Select market type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="secondary">Secondary Market</SelectItem>
                      <SelectItem value="rental">Rental Market</SelectItem>
                      <SelectItem value="primary">Primary Market</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="market_subcategory">Category</Label>
                  <Select name="market_subcategory" defaultValue="residential">
                    <SelectTrigger id="market_subcategory">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transaction_type">Transaction Type</Label>
                  <Select name="transaction_type" defaultValue="sale">
                    <SelectTrigger id="transaction_type">
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="rental">Rental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Property Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Property Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property_address">Property Address</Label>
                  <Input id="property_address" name="property_address" placeholder="123 Main St" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_city">City</Label>
                  <Input id="property_city" name="property_city" placeholder="Kuala Lumpur" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_state">State</Label>
                  <Input id="property_state" name="property_state" placeholder="Selangor" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_zip">Postal Code</Label>
                  <Input id="property_zip" name="property_zip" placeholder="50000" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_type">Property Type</Label>
                  <Select name="property_type" defaultValue="condo">
                    <SelectTrigger id="property_type">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="condo">Condominium</SelectItem>
                      <SelectItem value="landed">Landed</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Client Name</Label>
                  <Input id="client_name" name="client_name" placeholder="John Doe" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_email">Email</Label>
                  <Input id="client_email" name="client_email" type="email" placeholder="john@example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_phone">Phone</Label>
                  <Input id="client_phone" name="client_phone" placeholder="+60 12 345 6789" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_type">Client Type</Label>
                  <Select name="client_type" defaultValue="buyer">
                    <SelectTrigger id="client_type">
                      <SelectValue placeholder="Select client type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="seller">Seller</SelectItem>
                      <SelectItem value="landlord">Landlord</SelectItem>
                      <SelectItem value="tenant">Tenant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Transaction Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transaction_value">Transaction Value (MYR)</Label>
                  <Input
                    id="transaction_value"
                    name="transaction_value"
                    type="number"
                    placeholder="500000"
                    defaultValue="500000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    name="commission_rate"
                    type="number"
                    placeholder="2.5"
                    defaultValue="2.5"
                    step="0.1"
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Transaction'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>{result.success ? 'Success!' : 'Error'}</CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div className="p-4 bg-green-50 text-green-800 rounded">
                <p>{result.message}</p>
                <div className="mt-4">
                  <h4 className="font-medium">Next Steps:</h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>
                      <a href="/debug-transactions-simple" className="text-blue-600 hover:underline">
                        View in Debug Transactions (Working)
                      </a>
                    </li>
                    <li>
                      <a href="/agent-transactions-fixed" className="text-blue-600 hover:underline">
                        View in Agent Transactions (Fixed)
                      </a>
                    </li>
                    <li>
                      <a href="/admin-transactions-fixed" className="text-blue-600 hover:underline">
                        View in Admin Transactions (Fixed)
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 text-red-800 rounded">
                <p>Error: {result.error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
