import { NextResponse } from 'next/server'
import { db } from '@/db'

export async function GET() {
  try {
    console.log('Testing database connection...')
    console.log('Connection string:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')) // Log redacted connection string
    
    // Simple query to test connection
    const result = await db.query.profiles.findMany({
      limit: 1
    })
    
    return NextResponse.json({ 
      status: 'connected', 
      message: 'Database connection successful',
      sample: result
    })
  } catch (error) {
    console.error('Database connection error:', error)
    
    // More detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      toString: String(error)
    }
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to connect to database',
        error: errorDetails
      },
      { status: 500 }
    )
  }
}