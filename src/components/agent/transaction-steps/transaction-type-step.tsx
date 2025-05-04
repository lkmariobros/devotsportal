"use client"

import { useEffect } from "react"
import { useTransactionForm } from "@/contexts/transaction-form-context"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateField, DateInput } from "@/components/ui/datefield-rac"
import { parseDate, DateValue } from "@internationalized/date"
import { RiHome4Line, RiBuilding4Line, RiBuilding2Line } from "@remixicon/react"

interface TransactionTypeStepProps {
  transactionTypes: { id: string; name: string }[]
}

// Market type options
const marketTypes = [
  {
    id: 'secondary',
    name: 'Secondary Market',
    description: 'Resale of existing properties',
    icon: RiHome4Line,
    subcategories: [
      { id: 'residential', name: 'Residential' },
      { id: 'commercial', name: 'Commercial' }
    ]
  },
  {
    id: 'rental',
    name: 'Rental Market',
    description: 'Leasing of properties',
    icon: RiBuilding4Line,
    subcategories: [
      { id: 'residential', name: 'Residential' },
      { id: 'commercial', name: 'Commercial' }
    ]
  },
  {
    id: 'primary',
    name: 'Primary Market',
    description: 'Direct sales from developers',
    icon: RiBuilding2Line,
    subcategories: [
      { id: 'residential', name: 'Residential' },
      { id: 'commercial', name: 'Commercial' }
    ]
  }
];

// Market type card component
function MarketTypeCard({
  marketType,
  selected,
  onSelect
}: {
  marketType: typeof marketTypes[0],
  selected: boolean,
  onSelect: () => void
}) {
  const Icon = marketType.icon;

  return (
    <Card
      className={`cursor-pointer transition-all ${selected ? 'ring-2 ring-primary' : 'hover:bg-accent'}`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${selected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium">{marketType.name}</h3>
            <p className="text-sm text-muted-foreground">{marketType.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Subcategory card component
function SubcategoryCard({
  subcategory,
  selected,
  onSelect
}: {
  subcategory: { id: string, name: string },
  selected: boolean,
  onSelect: () => void
}) {
  return (
    <Card
      className={`cursor-pointer transition-all ${selected ? 'ring-2 ring-primary' : 'hover:bg-accent'}`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{subcategory.name}</h3>
          {selected && <Badge variant="outline" className="bg-primary/10 text-primary">Selected</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}

export function TransactionTypeStep({ transactionTypes }: TransactionTypeStepProps) {
  const { formData, updateField, errors } = useTransactionForm()

  const handleDateChange = (field: 'transaction_date' | 'closing_date', value: DateValue | null) => {
    if (value) {
      const dateString = value.toString()
      updateField(field, dateString)
    }
  }

  // Auto-select transaction type when there's only one option available
  useEffect(() => {
    if (formData.market_type && formData.market_subcategory) {
      // Instead of using transaction_type_id (which is a UUID in the database),
      // we'll use a string identifier for the transaction type
      let transactionType = '';

      if (formData.market_type === 'secondary') {
        transactionType = 'sale';
      } else if (formData.market_type === 'rental') {
        transactionType = 'rental';
      } else if (formData.market_type === 'primary') {
        transactionType = 'sale';
      }

      // Update the transaction type
      if (transactionType && formData.transaction_type_id !== transactionType) {
        updateField('transaction_type_id', transactionType);
      }
    }
  }, [formData.market_type, formData.market_subcategory, formData.transaction_type_id, updateField]);

  // Create simplified transaction types that don't use UUIDs
  const simplifiedTransactionTypes = [
    { id: 'sale', name: 'Sale' },
    { id: 'rental', name: 'Rental' }
  ];

  // Filter transaction types based on market type and subcategory
  const filteredTransactionTypes = simplifiedTransactionTypes.filter(type => {
    // If no market type is selected, show no types
    if (!formData.market_type) return false;

    // Filter based on market type
    if (formData.market_type === 'secondary') {
      // Secondary market only has Sale transactions
      return type.id === 'sale';
    } else if (formData.market_type === 'rental') {
      // Rental market only has Rental transactions
      return type.id === 'rental';
    } else if (formData.market_type === 'primary') {
      // Primary market only has Sale transactions (from developers)
      return type.id === 'sale';
    }

    return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Transaction Details</h2>
          <p className="text-muted-foreground">
            Select the market type, category, and transaction details.
          </p>
        </div>

        <div className="hidden md:block w-1/3 bg-muted/50 p-4 rounded-lg">
          <h3 className="font-medium text-sm">Tips</h3>
          <ul className="text-sm text-muted-foreground mt-2 space-y-2">
            <li>• Different market types have different commission structures</li>
            <li>• The transaction date is when the agreement was signed</li>
            <li>• The closing date is the expected completion date</li>
          </ul>
        </div>
      </div>

      {/* Market Type Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Select Market Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {marketTypes.map(marketType => (
            <MarketTypeCard
              key={marketType.id}
              marketType={marketType}
              selected={formData.market_type === marketType.id}
              onSelect={() => {
                updateField('market_type', marketType.id);
                // Reset subcategory when market type changes
                updateField('market_subcategory', '');
              }}
            />
          ))}
        </div>
        {errors?.market_type && (
          <p className="text-sm text-destructive">{errors.market_type[0]}</p>
        )}
      </div>

      {/* Subcategory Selection - only show if market type is selected */}
      {formData.market_type && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Select Category</h3>
          <div className="grid grid-cols-2 gap-4">
            {marketTypes
              .find(m => m.id === formData.market_type)
              ?.subcategories.map(subcategory => (
                <SubcategoryCard
                  key={subcategory.id}
                  subcategory={subcategory}
                  selected={formData.market_subcategory === subcategory.id}
                  onSelect={() => updateField('market_subcategory', subcategory.id)}
                />
              ))}
          </div>
          {errors?.market_subcategory && (
            <p className="text-sm text-destructive">{errors.market_subcategory[0]}</p>
          )}
        </div>
      )}

      {/* Only show transaction type selection if market type and subcategory are selected */}
      {formData.market_type && formData.market_subcategory && (
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="transaction_type_id">
              Transaction Type <span className="text-destructive">*</span>
            </Label>
            {filteredTransactionTypes.length === 1 ? (
              // If there's only one transaction type available, show it as selected
              <div>
                <div className="flex items-center justify-between p-3 border rounded-md bg-primary/5">
                  <span>{filteredTransactionTypes[0].name}</span>
                  <Badge variant="outline" className="bg-primary/10 text-primary">Selected</Badge>
                </div>
                <input
                  type="hidden"
                  value={filteredTransactionTypes[0].id}
                  onChange={() => updateField('transaction_type_id', filteredTransactionTypes[0].id)}
                />
                {/* Auto-select the transaction type if not already selected */}
              </div>
            ) : (
              // If there are multiple options, show the select
              <Select
                value={formData.transaction_type_id}
                onValueChange={(value) => updateField('transaction_type_id', value)}
              >
                <SelectTrigger id="transaction_type_id">
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTransactionTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors?.transaction_type_id && (
              <p className="text-sm text-destructive">{errors.transaction_type_id[0]}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="transaction_date">
              Transaction Date <span className="text-destructive">*</span>
            </Label>
            <DateField
              value={
                formData.transaction_date
                  ? parseDate(formData.transaction_date)
                  : undefined
              }
              onChange={(value) => handleDateChange('transaction_date', value)}
            >
              <DateInput id="transaction_date" />
            </DateField>
            {errors?.transaction_date && (
              <p className="text-sm text-destructive">{errors.transaction_date[0]}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="closing_date">Closing Date (Optional)</Label>
            <DateField
              value={
                formData.closing_date
                  ? parseDate(formData.closing_date)
                  : undefined
              }
              onChange={(value) => handleDateChange('closing_date', value)}
            >
              <DateInput id="closing_date" />
            </DateField>
            {errors?.closing_date && (
              <p className="text-sm text-destructive">{errors.closing_date[0]}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
