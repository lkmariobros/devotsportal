-- Create function for transaction approval with transaction boundaries
CREATE OR REPLACE FUNCTION public.approve_transaction(
  p_transaction_id UUID,
  p_reviewer_id UUID,
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_transaction JSONB;
  v_result JSONB;
  v_agent_id UUID;
  v_co_agent_id UUID;
  v_commission_amount DECIMAL;
  v_co_agent_commission_amount DECIMAL;
  v_payment_schedule_id UUID;
  v_commission_split BOOLEAN;
  v_co_agent_commission_percentage DECIMAL;
BEGIN
  -- Start transaction
  BEGIN
    -- Get transaction with FOR UPDATE lock to prevent concurrent modifications
    SELECT to_jsonb(t) INTO v_transaction 
    FROM property_transactions t 
    WHERE id = p_transaction_id FOR UPDATE;
    
    IF v_transaction IS NULL THEN
      RAISE EXCEPTION 'Transaction not found';
    END IF;
    
    -- Check if transaction is in a valid state for approval
    IF (v_transaction->>'status') != 'Pending' THEN
      RAISE EXCEPTION 'Transaction cannot be approved because it is not in Pending status';
    END IF;
    
    -- Extract values from transaction
    v_agent_id := (v_transaction->>'agent_id')::UUID;
    v_commission_amount := (v_transaction->>'commission_amount')::DECIMAL;
    v_payment_schedule_id := (v_transaction->>'payment_schedule_id')::UUID;
    v_commission_split := (v_transaction->>'commission_split')::BOOLEAN;
    v_co_agent_id := (v_transaction->>'co_agent_id')::UUID;
    v_co_agent_commission_percentage := (v_transaction->>'co_agent_commission_percentage')::DECIMAL;
    
    -- Update transaction status
    UPDATE property_transactions 
    SET 
      status = 'Approved', 
      updated_at = NOW(),
      version = version + 1
    WHERE id = p_transaction_id;
    
    -- Create approval record
    INSERT INTO commission_approvals (
      transaction_id, 
      status, 
      reviewer_id, 
      reviewed_at, 
      notes
    ) VALUES (
      p_transaction_id, 
      'Approved', 
      p_reviewer_id, 
      NOW(), 
      p_notes
    );
    
    -- Generate commission record for primary agent
    INSERT INTO commissions (
      transaction_id, 
      agent_id, 
      amount, 
      payment_schedule_id, 
      status
    ) VALUES (
      p_transaction_id, 
      v_agent_id, 
      v_commission_amount, 
      v_payment_schedule_id, 
      'Pending'
    );
    
    -- If co-broking is enabled, create commission for co-agent
    IF v_commission_split = TRUE AND v_co_agent_id IS NOT NULL AND v_co_agent_commission_percentage > 0 THEN
      -- Calculate co-agent commission
      v_co_agent_commission_amount := v_commission_amount * (v_co_agent_commission_percentage / 100);
      
      -- Create co-agent commission record
      INSERT INTO commissions (
        transaction_id, 
        agent_id, 
        amount, 
        payment_schedule_id, 
        status
      ) VALUES (
        p_transaction_id, 
        v_co_agent_id, 
        v_co_agent_commission_amount, 
        v_payment_schedule_id, 
        'Pending'
      );
    END IF;
    
    -- Create notification for agent
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      entity_type,
      entity_id,
      is_read
    ) VALUES (
      v_agent_id,
      'Transaction Approved',
      'Your transaction has been approved',
      'transaction_approved',
      'transaction',
      p_transaction_id,
      FALSE
    );
    
    -- Return success with transaction data
    v_result := jsonb_build_object(
      'success', TRUE,
      'transaction_id', p_transaction_id,
      'new_version', (SELECT version FROM property_transactions WHERE id = p_transaction_id)
    );
    
    RETURN v_result;
  EXCEPTION WHEN OTHERS THEN
    -- Roll back on any error
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for transaction approval with optimistic concurrency control
CREATE OR REPLACE FUNCTION public.approve_transaction_with_version(
  p_transaction_id UUID,
  p_expected_version INTEGER,
  p_reviewer_id UUID,
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_current_version INTEGER;
  v_transaction JSONB;
  v_result JSONB;
BEGIN
  -- Get current version with lock
  SELECT version INTO v_current_version 
  FROM property_transactions 
  WHERE id = p_transaction_id FOR UPDATE;
  
  -- Check if transaction exists
  IF v_current_version IS NULL THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;
  
  -- Check version
  IF v_current_version != p_expected_version THEN
    RAISE EXCEPTION 'Version mismatch: expected %, found %', 
      p_expected_version, v_current_version;
  END IF;
  
  -- Call the main approval function
  v_result := public.approve_transaction(
    p_transaction_id,
    p_reviewer_id,
    p_notes
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for transaction rejection with transaction boundaries
CREATE OR REPLACE FUNCTION public.reject_transaction(
  p_transaction_id UUID,
  p_reviewer_id UUID,
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_transaction JSONB;
  v_result JSONB;
  v_agent_id UUID;
BEGIN
  -- Start transaction
  BEGIN
    -- Get transaction with FOR UPDATE lock
    SELECT to_jsonb(t) INTO v_transaction 
    FROM property_transactions t 
    WHERE id = p_transaction_id FOR UPDATE;
    
    IF v_transaction IS NULL THEN
      RAISE EXCEPTION 'Transaction not found';
    END IF;
    
    -- Check if transaction is in a valid state for rejection
    IF (v_transaction->>'status') != 'Pending' THEN
      RAISE EXCEPTION 'Transaction cannot be rejected because it is not in Pending status';
    END IF;
    
    -- Extract agent ID for notification
    v_agent_id := (v_transaction->>'agent_id')::UUID;
    
    -- Update transaction status
    UPDATE property_transactions 
    SET 
      status = 'Rejected', 
      updated_at = NOW(),
      version = version + 1
    WHERE id = p_transaction_id;
    
    -- Create rejection record
    INSERT INTO commission_approvals (
      transaction_id, 
      status, 
      reviewer_id, 
      reviewed_at, 
      notes
    ) VALUES (
      p_transaction_id, 
      'Rejected', 
      p_reviewer_id, 
      NOW(), 
      p_notes
    );
    
    -- Create notification for agent
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      entity_type,
      entity_id,
      is_read
    ) VALUES (
      v_agent_id,
      'Transaction Rejected',
      'Your transaction has been rejected' || CASE WHEN p_notes IS NOT NULL THEN ': ' || p_notes ELSE '' END,
      'transaction_rejected',
      'transaction',
      p_transaction_id,
      FALSE
    );
    
    -- Return success with transaction data
    v_result := jsonb_build_object(
      'success', TRUE,
      'transaction_id', p_transaction_id,
      'new_version', (SELECT version FROM property_transactions WHERE id = p_transaction_id)
    );
    
    RETURN v_result;
  EXCEPTION WHEN OTHERS THEN
    -- Roll back on any error
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for transaction rejection with optimistic concurrency control
CREATE OR REPLACE FUNCTION public.reject_transaction_with_version(
  p_transaction_id UUID,
  p_expected_version INTEGER,
  p_reviewer_id UUID,
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_current_version INTEGER;
  v_result JSONB;
BEGIN
  -- Get current version with lock
  SELECT version INTO v_current_version 
  FROM property_transactions 
  WHERE id = p_transaction_id FOR UPDATE;
  
  -- Check if transaction exists
  IF v_current_version IS NULL THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;
  
  -- Check version
  IF v_current_version != p_expected_version THEN
    RAISE EXCEPTION 'Version mismatch: expected %, found %', 
      p_expected_version, v_current_version;
  END IF;
  
  -- Call the main rejection function
  v_result := public.reject_transaction(
    p_transaction_id,
    p_reviewer_id,
    p_notes
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for batch transaction approval
CREATE OR REPLACE FUNCTION public.batch_approve_transactions(
  p_transaction_ids UUID[],
  p_reviewer_id UUID,
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_transaction_id UUID;
  v_successful UUID[] := '{}';
  v_failed JSONB[] := '{}';
  v_result JSONB;
  v_approval_result JSONB;
BEGIN
  -- Process each transaction
  FOREACH v_transaction_id IN ARRAY p_transaction_ids
  LOOP
    BEGIN
      -- Attempt to approve the transaction
      v_approval_result := public.approve_transaction(
        v_transaction_id,
        p_reviewer_id,
        p_notes
      );
      
      -- Add to successful array
      v_successful := array_append(v_successful, v_transaction_id);
    EXCEPTION WHEN OTHERS THEN
      -- Add to failed array with error message
      v_failed := array_append(
        v_failed, 
        jsonb_build_object(
          'transaction_id', v_transaction_id,
          'error', SQLERRM
        )
      );
      
      -- Continue with next transaction
      CONTINUE;
    END;
  END LOOP;
  
  -- Return results
  v_result := jsonb_build_object(
    'successful', v_successful,
    'failed', v_failed,
    'total_count', array_length(p_transaction_ids, 1),
    'success_count', array_length(v_successful, 1),
    'failure_count', array_length(v_failed, 1)
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
