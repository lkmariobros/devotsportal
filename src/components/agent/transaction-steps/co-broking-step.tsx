"use client"

import { useTransactionForm } from "@/contexts/transaction-form-context"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

export function CoBrokingStep() {
  const { formData, updateField, errors } = useTransactionForm()
  
  // Only show co-agent fields if co-broking is enabled
  const showCoAgentFields = formData.co_broking_enabled
  
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Co-Broking Setup</h2>
          <p className="text-muted-foreground">
            Set up co-broking details if you're working with another agent.
          </p>
        </div>
        
        <div className="hidden md:block w-1/3 bg-muted/50 p-4 rounded-lg">
          <h3 className="font-medium text-sm">Tips</h3>
          <ul className="text-sm text-muted-foreground mt-2 space-y-2">
            <li>• Co-broking affects how commissions are split</li>
            <li>• Make sure to verify the co-agent's information</li>
            <li>• The commission split percentage is your share of the total commission</li>
          </ul>
        </div>
      </div>
      
      <div className="grid gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="co_broking_enabled"
            checked={formData.co_broking_enabled}
            onCheckedChange={(checked) => updateField('co_broking_enabled', Boolean(checked))}
          />
          <Label htmlFor="co_broking_enabled">This transaction involves co-broking</Label>
        </div>
        
        {showCoAgentFields && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="co_agent_name">
                Co-Agent Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="co_agent_name"
                value={formData.co_agent_name}
                onChange={(e) => updateField('co_agent_name', e.target.value)}
                placeholder="Enter co-agent name"
              />
              {errors?.co_agent_name && (
                <p className="text-sm text-destructive">{errors.co_agent_name[0]}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="co_agent_email">Co-Agent Email</Label>
                <Input
                  id="co_agent_email"
                  type="email"
                  value={formData.co_agent_email}
                  onChange={(e) => updateField('co_agent_email', e.target.value)}
                  placeholder="Enter co-agent email"
                />
                {errors?.co_agent_email && (
                  <p className="text-sm text-destructive">{errors.co_agent_email[0]}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="co_agent_id">Co-Agent ID (Optional)</Label>
                <Input
                  id="co_agent_id"
                  value={formData.co_agent_id}
                  onChange={(e) => updateField('co_agent_id', e.target.value)}
                  placeholder="Enter co-agent ID if known"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="commission_split">
                  Commission Split (Your Share) <span className="text-destructive">*</span>
                </Label>
                <span className="text-sm font-medium">{formData.commission_split}%</span>
              </div>
              
              <Slider
                id="commission_split"
                min={1}
                max={99}
                step={1}
                value={[typeof formData.commission_split === 'number' ? formData.commission_split : 50]}
                onValueChange={(value) => updateField('commission_split', value[0])}
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1%</span>
                <span>50%</span>
                <span>99%</span>
              </div>
              
              {errors?.commission_split && (
                <p className="text-sm text-destructive">{errors.commission_split[0]}</p>
              )}
            </div>
            
            <div className="p-3 border rounded-md bg-blue-50">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-sm">Your Share</h4>
                  <p className="text-xs text-muted-foreground">
                    {formData.commission_split}% of the total commission
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Co-Agent's Share</h4>
                  <p className="text-xs text-muted-foreground">
                    {100 - (typeof formData.commission_split === 'number' ? formData.commission_split : 50)}% of the total commission
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        
        {!showCoAgentFields && (
          <div className="p-4 border rounded-md bg-muted/30">
            <p className="text-sm text-muted-foreground">
              If this transaction involves working with another agent, check the box above to enter co-broking details.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
