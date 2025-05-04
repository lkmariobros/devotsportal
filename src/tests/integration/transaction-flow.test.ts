import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

// Mock data
const testAgentId = '00000000-0000-0000-0000-000000000001'
const testAdminId = '00000000-0000-0000-0000-000000000002'
const testPropertyId = '00000000-0000-0000-0000-000000000003'
const testTransactionTypeId = '00000000-0000-0000-0000-000000000004'

// Test transaction data
const testTransactionData = {
  transaction_type_id: testTransactionTypeId,
  transaction_date: new Date().toISOString().split('T')[0],
  closing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  agent_id: testAgentId,
  property_id: testPropertyId,
  property_address: '123 Test St',
  property_city: 'Test City',
  property_state: 'TS',
  property_zip: '12345',
  property_type: 'single_family',
  client_name: 'Test Client',
  client_email: 'test@example.com',
  client_type: 'buyer',
  transaction_value: 500000,
  commission_rate: 2.5,
  agent_tier: 'Advisor',
  status: 'Pending',
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Skip tests if environment variables are not set
const shouldRunTests = supabaseUrl && supabaseKey

// Helper functions
async function createTestTransaction() {
  const { data, error } = await supabase
    .from('property_transactions')
    .insert({
      ...testTransactionData,
      id: uuidv4(),
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

async function getTransaction(id: string) {
  const { data, error } = await supabase
    .from('property_transactions')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

async function approveTransaction(id: string, reviewerId: string, notes?: string) {
  const { data, error } = await supabase.rpc(
    'approve_transaction',
    {
      p_transaction_id: id,
      p_reviewer_id: reviewerId,
      p_notes: notes || null,
    }
  )
  
  if (error) throw error
  return data
}

async function rejectTransaction(id: string, reviewerId: string, notes?: string) {
  const { data, error } = await supabase.rpc(
    'reject_transaction',
    {
      p_transaction_id: id,
      p_reviewer_id: reviewerId,
      p_notes: notes || null,
    }
  )
  
  if (error) throw error
  return data
}

async function getCommissionForTransaction(transactionId: string) {
  const { data, error } = await supabase
    .from('commissions')
    .select('*')
    .eq('transaction_id', transactionId)
  
  if (error) throw error
  return data
}

// Test suite
describe('Transaction Flow Integration Tests', () => {
  // Skip all tests if environment variables are not set
  if (!shouldRunTests) {
    it.skip('Skipping tests because environment variables are not set', () => {})
    return
  }
  
  let testTransactionId: string
  
  beforeEach(async () => {
    // Create a test transaction
    const transaction = await createTestTransaction()
    testTransactionId = transaction.id
  })
  
  afterEach(async () => {
    // Clean up test data
    if (testTransactionId) {
      // Delete commissions
      await supabase
        .from('commissions')
        .delete()
        .eq('transaction_id', testTransactionId)
      
      // Delete approvals
      await supabase
        .from('commission_approvals')
        .delete()
        .eq('transaction_id', testTransactionId)
      
      // Delete transaction
      await supabase
        .from('property_transactions')
        .delete()
        .eq('id', testTransactionId)
    }
  })
  
  it('should successfully approve a transaction', async () => {
    // Approve the transaction
    await approveTransaction(testTransactionId, testAdminId, 'Test approval')
    
    // Verify transaction status
    const transaction = await getTransaction(testTransactionId)
    expect(transaction.status).toBe('Approved')
    
    // Verify commission record was created
    const commissions = await getCommissionForTransaction(testTransactionId)
    expect(commissions.length).toBeGreaterThan(0)
    expect(commissions[0].transaction_id).toBe(testTransactionId)
  })
  
  it('should successfully reject a transaction', async () => {
    // Reject the transaction
    await rejectTransaction(testTransactionId, testAdminId, 'Test rejection')
    
    // Verify transaction status
    const transaction = await getTransaction(testTransactionId)
    expect(transaction.status).toBe('Rejected')
    
    // Verify no commission records were created
    const commissions = await getCommissionForTransaction(testTransactionId)
    expect(commissions.length).toBe(0)
  })
  
  it('should handle optimistic concurrency control', async () => {
    // Get the current version
    const transaction = await getTransaction(testTransactionId)
    const currentVersion = transaction.version
    
    // Approve with correct version
    await supabase.rpc(
      'approve_transaction_with_version',
      {
        p_transaction_id: testTransactionId,
        p_expected_version: currentVersion,
        p_reviewer_id: testAdminId,
        p_notes: 'Test approval with version',
      }
    )
    
    // Verify transaction was approved
    const updatedTransaction = await getTransaction(testTransactionId)
    expect(updatedTransaction.status).toBe('Approved')
    expect(updatedTransaction.version).toBe(currentVersion + 1)
    
    // Try to approve again with old version (should fail)
    try {
      await supabase.rpc(
        'approve_transaction_with_version',
        {
          p_transaction_id: testTransactionId,
          p_expected_version: currentVersion, // Old version
          p_reviewer_id: testAdminId,
          p_notes: 'This should fail',
        }
      )
      // If we get here, the test failed
      expect(true).toBe(false) // Force failure
    } catch (error) {
      // Expect an error about version mismatch
      expect((error as Error).message).toContain('version mismatch')
    }
  })
  
  it('should handle batch approval', async () => {
    // Create a second test transaction
    const transaction2 = await createTestTransaction()
    
    // Batch approve both transactions
    const result = await supabase.rpc(
      'batch_approve_transactions',
      {
        p_transaction_ids: [testTransactionId, transaction2.id],
        p_reviewer_id: testAdminId,
        p_notes: 'Batch approval test',
      }
    )
    
    // Verify both transactions were approved
    const transaction1 = await getTransaction(testTransactionId)
    const transaction2Updated = await getTransaction(transaction2.id)
    
    expect(transaction1.status).toBe('Approved')
    expect(transaction2Updated.status).toBe('Approved')
    
    // Clean up second transaction
    await supabase
      .from('commissions')
      .delete()
      .eq('transaction_id', transaction2.id)
    
    await supabase
      .from('commission_approvals')
      .delete()
      .eq('transaction_id', transaction2.id)
    
    await supabase
      .from('property_transactions')
      .delete()
      .eq('id', transaction2.id)
  })
})
