"use client"

import { useTransactionForm } from "@/contexts/transaction-form-context"
import { useCommissionCalculation } from "@/hooks/use-commission-calculation"
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
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function CommissionCalculationStep() {
  const { formData, updateField, errors } = useTransactionForm()
  const commission = useCommissionCalculation(formData)
  
  // Agent tier options
  const agentTiers = [
    { value: "Advisor", label: "Advisor (70%)" },
    { value: "Sales Leader", label: "Sales Leader (80%)" },
    { value: "Team Leader", label: "Team Leader (83%)" },
    { value: "Group Leader", label: "Group Leader (85%)" },
    { value: "Supreme Leader", label: "Supreme Leader (85%)" },
  ]
  
  // Get suggested commission rate based on property type
  const getSuggestedRate = () => {
    switch (formData.property_type) {
      case "single_family":
        return 2.5
      case "condo":
        return 2.5
      case "townhouse":
        return 2.5
      case "multi_family":
        return 3.0
      case "land":
        return 4.0
      case "commercial":
        return 5.0
      default:
        return 2.5
    }
  }
  
  const handleSuggestRate = () => {
    updateField('commission_rate', getSuggestedRate())
  }
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Commission Calculation</h2>
          <p className="text-muted-foreground">
            Enter the transaction value and commission details.
          </p>
        </div>
        
        <div className="hidden md:block w-1/3 bg-muted/50 p-4 rounded-lg">
          <h3 className="font-medium text-sm">Tips</h3>
          <ul className="text-sm text-muted-foreground mt-2 space-y-2">
            <li>• The transaction value is the total property value</li>
            <li>• Commission rate is typically 2-3% for residential properties</li>
            <li>• Your agent tier determines your share of the commission</li>
          </ul>
        </div>
      </div>
      
      <div className="grid gap-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="transaction_value">
              Transaction Value (MYR) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                RM
              </span>
              <Input
                id="transaction_value"
                type="number"
                min="0"
                step="1000"
                value={formData.transaction_value}
                onChange={(e) => updateField('transaction_value', parseFloat(e.target.value) || 0)}
                className="pl-10"
                placeholder="Enter transaction value"
              />
            </div>
            {errors?.transaction_value && (
              <p className="text-sm text-destructive">{errors.transaction_value[0]}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="commission_rate">
              Commission Rate (%) <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="commission_rate"
                  type="number"
                  min="0.1"
                  step="0.1"
                  max="10"
                  value={formData.commission_rate}
                  onChange={(e) => updateField('commission_rate', parseFloat(e.target.value) || 0)}
                  placeholder="Enter commission rate"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleSuggestRate}
              >
                Suggest Rate
              </Button>
            </div>
            {errors?.commission_rate && (
              <p className="text-sm text-destructive">{errors.commission_rate[0]}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Suggested rate for {formData.property_type ? formData.property_type.replace('_', ' ') : 'this property type'}: {getSuggestedRate()}%
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="agent_tier">
              Agent Tier <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.agent_tier}
              onValueChange={(value) => updateField('agent_tier', value)}
            >
              <SelectTrigger id="agent_tier">
                <SelectValue placeholder="Select agent tier" />
              </SelectTrigger>
              <SelectContent>
                {agentTiers.map((tier) => (
                  <SelectItem key={tier.value} value={tier.value}>
                    {tier.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.agent_tier && (
              <p className="text-sm text-destructive">{errors.agent_tier[0]}</p>
            )}
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Commission Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Transaction Value</span>
                <span className="font-medium">{formatCurrency(commission.totalCommission / (formData.commission_rate / 100))}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Commission Rate</span>
                <span className="font-medium">{formData.commission_rate}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Commission</span>
                <span className="font-medium">{formatCurrency(commission.totalCommission)}</span>
              </div>
              
              <Separator />
              
              {formData.co_broking_enabled ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Our Agency's Share ({formData.commission_split}%)</span>
                    <span className="font-medium">{formatCurrency(commission.ourAgencyCommission)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Co-Agency's Share ({100 - (typeof formData.commission_split === 'number' ? formData.commission_split : 50)}%)</span>
                    <span className="font-medium">{formatCurrency(commission.coAgencyCommission || 0)}</span>
                  </div>
                  
                  <Separator />
                </>
              ) : null}
              
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-muted-foreground">Your Share</span>
                  <p className="text-xs text-muted-foreground">Based on your {formData.agent_tier} tier</p>
                </div>
                <span className="text-xl font-bold text-green-600">{formatCurrency(commission.agentShare)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Agency's Share</span>
                <span className="font-medium">{formatCurrency(commission.agencyShare)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
