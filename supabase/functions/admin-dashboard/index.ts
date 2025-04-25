import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

interface DashboardSummaryResponse {
  agentCount: number
  transactionCount: number
  totalCommission: number
  recentTransactions: any[]
}

serve(async (req) => {
  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the user from the request
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      })
    }
    
    // Check if user is admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || profile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 403,
      })
    }
    
    // Get agent count
    const { count: agentCount } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'agent')
    
    // Get transaction count
    const { count: transactionCount } = await supabaseClient
      .from('property_transactions')
      .select('*', { count: 'exact', head: true })
    
    // Get total commission amount
    const { data: commissionData } = await supabaseClient
      .from('commissions')
      .select('amount')
      .is('status', 'paid')
    
    const totalCommission = commissionData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0
    
    const response: DashboardSummaryResponse = {
      agentCount: agentCount || 0,
      transactionCount: transactionCount || 0,
      totalCommission,
      recentTransactions: []
    }
    
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})