import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"

interface AgentTierSelectProps {
  value?: string
  onChange?: (value: string) => void
  form?: any
  name?: string
}

export function AgentTierSelect({ value, onChange, form, name }: AgentTierSelectProps) {
  const tiers = [
    { value: 'Advisor', label: 'Advisor (70%)' },
    { value: 'Sales Leader', label: 'Sales Leader (80%)' },
    { value: 'Team Leader', label: 'Team Leader (83%)' },
    { value: 'Group Leader', label: 'Group Leader (85%)' },
    { value: 'Supreme Leader', label: 'Supreme Leader (85%)' },
  ]
  
  // If used with react-hook-form
  if (form && name) {
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Agent Tier</FormLabel>
            <FormControl>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value || 'Advisor'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select agent tier" />
                </SelectTrigger>
                <SelectContent>
                  {tiers.map((tier) => (
                    <SelectItem key={tier.value} value={tier.value}>
                      {tier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }
  
  // If used standalone
  return (
    <div className="space-y-2">
      <Label htmlFor="agent-tier">Agent Tier</Label>
      <Select 
        onValueChange={onChange} 
        defaultValue={value || 'Advisor'}
      >
        <SelectTrigger id="agent-tier">
          <SelectValue placeholder="Select agent tier" />
        </SelectTrigger>
        <SelectContent>
          {tiers.map((tier) => (
            <SelectItem key={tier.value} value={tier.value}>
              {tier.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}