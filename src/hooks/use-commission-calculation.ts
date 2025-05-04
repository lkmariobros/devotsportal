"use client"

import { useState, useEffect } from "react"
import { TransactionFormData } from "@/contexts/transaction-form-context"

interface CommissionResult {
  totalCommission: number
  agentShare: number
  agencyShare: number
  coAgentShare?: number
  ourAgencyCommission: number
  coAgencyCommission?: number
  effectiveRate: number
}

export function useCommissionCalculation(formData: TransactionFormData) {
  const [commission, setCommission] = useState<CommissionResult>({
    totalCommission: 0,
    agentShare: 0,
    agencyShare: 0,
    ourAgencyCommission: 0,
    effectiveRate: 0,
  })

  useEffect(() => {
    // Extract values from form data
    const transactionValue = typeof formData.transaction_value === 'string' 
      ? parseFloat(formData.transaction_value) || 0 
      : formData.transaction_value || 0
    
    const commissionRate = typeof formData.commission_rate === 'string'
      ? parseFloat(formData.commission_rate) || 0
      : formData.commission_rate || 0
    
    const agentTier = formData.agent_tier || 'Advisor'
    const coBrokingEnabled = formData.co_broking_enabled || false
    const commissionSplit = typeof formData.commission_split === 'string'
      ? parseInt(formData.commission_split) || 50
      : formData.commission_split || 50
    
    // Calculate total commission
    const totalCommission = (transactionValue * commissionRate) / 100
    
    // Calculate effective rate (actual percentage of transaction value)
    const effectiveRate = transactionValue > 0 
      ? (totalCommission / transactionValue) * 100
      : 0
    
    // Calculate agency and agent shares based on tier
    let agentPercentage = 70 // Default for Advisor
    
    switch (agentTier) {
      case 'Sales Leader':
        agentPercentage = 80
        break
      case 'Team Leader':
        agentPercentage = 83
        break
      case 'Group Leader':
        agentPercentage = 85
        break
      case 'Supreme Leader':
        agentPercentage = 85
        break
      default:
        agentPercentage = 70 // Advisor
    }
    
    // Handle co-broking
    let ourAgencyCommission = totalCommission
    let coAgencyCommission: number | undefined
    let coAgentShare: number | undefined
    
    if (coBrokingEnabled) {
      // Split the commission between agencies
      ourAgencyCommission = totalCommission * (commissionSplit / 100)
      coAgencyCommission = totalCommission - ourAgencyCommission
    }
    
    // Calculate agent's share of our agency's commission
    const agentShare = ourAgencyCommission * (agentPercentage / 100)
    const agencyShare = ourAgencyCommission - agentShare
    
    // Update state
    setCommission({
      totalCommission,
      agentShare,
      agencyShare,
      coAgentShare,
      ourAgencyCommission,
      coAgencyCommission,
      effectiveRate,
    })
  }, [
    formData.transaction_value,
    formData.commission_rate,
    formData.agent_tier,
    formData.co_broking_enabled,
    formData.commission_split,
  ])

  return commission
}
