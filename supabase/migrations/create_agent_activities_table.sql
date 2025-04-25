-- Create agent_activities table
CREATE TABLE IF NOT EXISTS public.agent_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Add indexes for better query performance
  CONSTRAINT valid_action_type CHECK (
    action_type IN ('transaction_created', 'transaction_updated', 'document_uploaded', 'profile_updated')
  ),
  CONSTRAINT valid_entity_type CHECK (
    entity_type IN ('transaction', 'document', 'profile')
  )
);

-- Add RLS policies
ALTER TABLE public.agent_activities ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all activities
CREATE POLICY "Admins can view all activities" 
  ON public.agent_activities
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Allow agents to view only their own activities
CREATE POLICY "Agents can view their own activities" 
  ON public.agent_activities
  FOR SELECT 
  TO authenticated
  USING (agent_id = auth.uid());

-- Create function to record agent activity
CREATE OR REPLACE FUNCTION public.record_agent_activity(
  p_agent_id UUID,
  p_action_type TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO public.agent_activities (
    agent_id, action_type, entity_type, entity_id
  ) VALUES (
    p_agent_id, p_action_type, p_entity_type, p_entity_id
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;