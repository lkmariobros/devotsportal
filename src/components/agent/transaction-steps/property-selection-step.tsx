"use client"

import { useState } from "react"
import { useTransactionForm } from "@/contexts/transaction-form-context"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RiInformationLine } from "@remixicon/react"

export function PropertySelectionStep() {
  const { formData, updateField, errors } = useTransactionForm()
  const [showAddressHelp, setShowAddressHelp] = useState(false)

  const propertyTypes = [
    { value: "condo", label: "Condominium" },
    { value: "landed", label: "Landed" },
    { value: "commercial", label: "Commercial" },
    { value: "land", label: "Land" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Property Selection</h2>
          <p className="text-muted-foreground">
            Enter the property details for this transaction.
          </p>
        </div>

        <div className="hidden md:block w-1/3 bg-muted/50 p-4 rounded-lg">
          <h3 className="font-medium text-sm">Tips</h3>
          <ul className="text-sm text-muted-foreground mt-2 space-y-2">
            <li>• Enter the complete property address including unit/apartment numbers</li>
            <li>• Property type affects commission calculations and required documents</li>
            <li>• Bedrooms, bathrooms, and square footage help with property valuation</li>
          </ul>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="property_address">
              Property Address <span className="text-destructive">*</span>
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddressHelp(!showAddressHelp)}
              className="h-6 px-2"
            >
              <RiInformationLine className="h-4 w-4 mr-1" />
              {showAddressHelp ? 'Hide Help' : 'Show Help'}
            </Button>
          </div>

          <Input
            id="property_address"
            value={formData.property_address}
            onChange={(e) => updateField('property_address', e.target.value)}
            placeholder="Enter the full property address"
          />

          {showAddressHelp && (
            <div className="bg-muted p-3 rounded text-sm">
              <p className="font-medium">Address Format Examples:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>• No. 12, Jalan Bukit Bintang, 55100 Kuala Lumpur</li>
                <li>• Unit A-15-3, Menara XYZ, Jalan Ampang</li>
                <li>• Lot 7, Taman Desa Jaya, Petaling Jaya</li>
              </ul>
            </div>
          )}

          {errors?.property_address && (
            <p className="text-sm text-destructive">{errors.property_address[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="property_city">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="property_city"
              value={formData.property_city}
              onChange={(e) => updateField('property_city', e.target.value)}
              placeholder="City"
            />
            {errors?.property_city && (
              <p className="text-sm text-destructive">{errors.property_city[0]}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="property_state">
              State <span className="text-destructive">*</span>
            </Label>
            <Input
              id="property_state"
              value={formData.property_state}
              onChange={(e) => updateField('property_state', e.target.value)}
              placeholder="State"
            />
            {errors?.property_state && (
              <p className="text-sm text-destructive">{errors.property_state[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="property_zip">
              Postal Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="property_zip"
              value={formData.property_zip}
              onChange={(e) => updateField('property_zip', e.target.value)}
              placeholder="Postal Code"
            />
            {errors?.property_zip && (
              <p className="text-sm text-destructive">{errors.property_zip[0]}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="property_type">
              Property Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.property_type}
              onValueChange={(value) => updateField('property_type', value)}
            >
              <SelectTrigger id="property_type">
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.property_type && (
              <p className="text-sm text-destructive">{errors.property_type[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="property_bedrooms">Bedrooms (Optional)</Label>
            <Input
              id="property_bedrooms"
              type="number"
              min="0"
              value={formData.property_bedrooms}
              onChange={(e) => updateField('property_bedrooms', e.target.value)}
              placeholder="Number of bedrooms"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="property_bathrooms">Bathrooms (Optional)</Label>
            <Input
              id="property_bathrooms"
              type="number"
              min="0"
              step="0.5"
              value={formData.property_bathrooms}
              onChange={(e) => updateField('property_bathrooms', e.target.value)}
              placeholder="Number of bathrooms"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="property_square_feet">Square Feet (Optional)</Label>
            <Input
              id="property_square_feet"
              type="number"
              min="0"
              value={formData.property_square_feet}
              onChange={(e) => updateField('property_square_feet', e.target.value)}
              placeholder="Square footage"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
