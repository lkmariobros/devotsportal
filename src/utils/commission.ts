import { z } from 'zod'

// Agent rank types
export type AgentRank = 'Advisor' | 'Sales Leader' | 'Team Leader' | 'Group Leader' | 'Supreme Leader'

// Commission breakdown interface
export interface CommissionBreakdown {
  totalCommission: number
  agencyShare: number
  agentShare: number
  ourAgencyCommission: number
  coAgencyCommission?: number
  agentTier: AgentRank
  agentCommissionPercentage: number
  transactionValue: number
  commissionRate: number
}

// Transaction form data interface
export interface TransactionFormData {
  transactionValue?: number
  commissionRate?: number
  agentTier?: string
  coBroking?: {
    enabled: boolean
    commissionSplit?: number
  }
}

// Convert string to AgentRank type
export function stringToAgentRank(rank: string): AgentRank {
  switch (rank) {
    case 'Advisor': return 'Advisor'
    case 'Sales Leader': return 'Sales Leader'
    case 'Team Leader': return 'Team Leader'
    case 'Group Leader': return 'Group Leader'
    case 'Supreme Leader': return 'Supreme Leader'
    default: return 'Advisor'
  }
}

// Get agent commission percentage based on rank
export function getAgentCommissionPercentage(rank: AgentRank): number {
  switch (rank) {
    case 'Advisor': return 70
    case 'Sales Leader': return 80
    case 'Team Leader': return 83
    case 'Group Leader': return 85
    case 'Supreme Leader': return 85
    default: return 70
  }
}

// Commission calculation function
export function calculateCommission(formData: TransactionFormData): CommissionBreakdown {
  const {
    transactionValue = 0,
    commissionRate = 0,
    agentTier = 'Advisor',
    coBroking
  } = formData
  
  // Convert string to AgentRank type if needed
  const agentRankTier = stringToAgentRank(agentTier as string)
  
  // Get agent tier percentage
  const agentCommissionPercentage = getAgentCommissionPercentage(agentRankTier)
  
  // Calculate basic commission values
  const totalCommission = (transactionValue * commissionRate) / 100
  
  // Handle co-broking split
  const agencySplitPercentage = coBroking?.enabled ? (coBroking.commissionSplit || 50) : 100
  const coAgencySplitPercentage = coBroking?.enabled ? (100 - agencySplitPercentage) : 0
  
  // Our agency's portion of the total commission
  const ourAgencyCommission = totalCommission * (agencySplitPercentage / 100)
  
  // Co-broker agency's portion
  const coAgencyCommission = coBroking?.enabled 
    ? totalCommission * (coAgencySplitPercentage / 100)
    : undefined
  
  // From our agency's portion, calculate agent and agency shares
  const agentShare = ourAgencyCommission * (agentCommissionPercentage / 100)
  const agencyShare = ourAgencyCommission * ((100 - agentCommissionPercentage) / 100)
  
  return {
    totalCommission,
    agencyShare,
    agentShare,
    ourAgencyCommission,
    coAgencyCommission,
    agentTier: agentRankTier,
    agentCommissionPercentage,
    transactionValue,
    commissionRate
  }
}