import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data = await request.json()
    console.log('API route received data:', data)

    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      )
    }
    
    // Prepare transaction data
    const transactionData = {
      // Essential fields
      market_type: data.market_type,
      market_subcategory: data.market_subcategory,
      transaction_type_id: data.transaction_type_id,
      transaction_date: data.transaction_date,
      property_address: data.property_address,
      property_city: data.property_city,
      property_state: data.property_state,
      property_zip: data.property_zip,
      property_type: data.property_type,
      primary_client_name: data.primary_client_name,
      primary_client_type: data.primary_client_type,
      transaction_value: typeof data.transaction_value === 'number' ? data.transaction_value : 0,
      
      // Status and audit fields
      status: 'pending',
      created_by: user.id,
      updated_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    // Insert the transaction
    const { data: transaction, error } = await supabase
      .from('property_transactions')
      .insert([transactionData])
      .select()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }
    
    console.log('Transaction inserted successfully:', transaction)
    
    // Return success response
    return NextResponse.json({
      success: true,
      data: transaction[0],
      message: 'Transaction submitted successfully'
    })
  } catch (error) {
    console.error('Error in transaction API route:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to submit transaction',
        details: String(error)
      },
      { status: 500 }
    )
  }
}
