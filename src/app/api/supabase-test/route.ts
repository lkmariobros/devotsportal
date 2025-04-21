import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    
    console.log('Testing Supabase connection...')
    console.log('Supabase URL:', supabaseUrl)
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (error) throw error
    
    return NextResponse.json({ 
      status: 'connected', 
      message: 'Supabase connection successful',
      sample: data
    })
  } catch (error) {
    console.error('Supabase connection error:', error)
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to connect to Supabase',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}