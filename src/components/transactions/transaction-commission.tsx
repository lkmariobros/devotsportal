import { formatCurrency, formatDate } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { stringToAgentRank, getAgentCommissionPercentage } from "@/utils/commission"

interface TransactionCommissionProps {
  transaction: any
}

export function TransactionCommission({ transaction }: TransactionCommissionProps) {
  const hasCoAgent = transaction.commission_split && transaction.co_agent_id
  const primaryAgentName = transaction.profiles?.first_name + ' ' + transaction.profiles?.last_name
  const coAgentName = hasCoAgent 
    ? transaction.profiles?.co_agent_id?.first_name + ' ' + transaction.profiles?.co_agent_id?.last_name 
    : null
  
  // Get agent tier and commission percentage
  const agentTier = transaction.agent_tier || 'Advisor'
  const agentRankTier = stringToAgentRank(agentTier)
  const agentCommissionPercentage = getAgentCommissionPercentage(agentRankTier)
  
  // Calculate commission amounts
  const totalCommission = transaction.commission_amount || 0
  const coAgentPercentage = transaction.co_agent_commission_percentage || 0
  const coAgentAmount = hasCoAgent ? (totalCommission * (coAgentPercentage / 100)) : 0
  const primaryAgentAmount = totalCommission - coAgentAmount
  
  // Calculate agent and agency shares
  const agentShare = primaryAgentAmount * (agentCommissionPercentage / 100)
  const agencyShare = primaryAgentAmount - agentShare
  
  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4 space-y-4">
          <div>
            <h3 className="font-medium">Commission Details</h3>
            <p className="text-muted-foreground text-sm">
              Based on transaction value and commission rate
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <p className="text-muted-foreground">Transaction Value:</p>
            <p>{formatCurrency(transaction.transaction_value)}</p>
            
            <p className="text-muted-foreground">Commission Rate:</p>
            <p>{transaction.commission_rate}%</p>
            
            <p className="text-muted-foreground">Total Commission:</p>
            <p className="font-medium">{formatCurrency(totalCommission)}</p>
            
            <p className="text-muted-foreground">Agent Tier:</p>
            <p>{agentRankTier}</p>
            
            <p className="text-muted-foreground">Agent Commission %:</p>
            <p>{agentCommissionPercentage}%</p>
          </div>
        </Card>
        
        <Card className="p-4 space-y-4">
          <div>
            <h3 className="font-medium">Commission Distribution</h3>
            <p className="text-muted-foreground text-sm">
              {hasCoAgent ? 'Split between primary and co-agent' : 'Full amount to primary agent'}
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <p>{primaryAgentName} (Primary Agent)</p>
                <p className="font-medium">{formatCurrency(primaryAgentAmount)}</p>
              </div>
              {hasCoAgent && (
                <div className="text-sm text-muted-foreground">
                  {transaction.commission_split ? 
                    `${100 - coAgentPercentage}% of total commission` : 
                    '100% of total commission'}
                </div>
              )}
            </div>
            
            {hasCoAgent && (
              <div>
                <div className="flex justify-between items-center">
                  <p>{coAgentName} (Co-Agent)</p>
                  <p className="font-medium">{formatCurrency(coAgentAmount)}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {coAgentPercentage}% of total commission
                </div>
              </div>
            )}
            
            <Separator />
            
            <div>
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">Agent Share ({agentCommissionPercentage}%)</p>
                <p>{formatCurrency(agentShare)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">Agency Share ({100 - agentCommissionPercentage}%)</p>
                <p>{formatCurrency(agencyShare)}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {transaction.payment_schedule_id && (
        <div>
          <h3 className="font-medium mb-4">Payment Schedule</h3>
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Schedule Type</p>
                <p>{transaction.commission_payment_schedules?.name || 'Standard'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Payment Status</p>
                <Badge variant="outline">Pending</Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Next Payment</p>
                <p>{formatDate(transaction.closing_date || transaction.transaction_date)}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}