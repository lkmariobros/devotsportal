import { NextResponse } from 'next/server'
import { db } from '@/db'
import { profiles } from '@/db/schema'

export async function GET() {
  try {
    const result = await db.query.profiles.findMany()
    
    return NextResponse.json({ 
      status: 'success', 
      data: result
    })
  } catch (error) {
    console.error('Error fetching profiles:', error)
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to fetch profiles',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}