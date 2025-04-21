'use server'

import { db } from '@/db'

export async function testDatabaseConnection() {
  try {
    // Simple query to test connection
    const result = await db.query.profiles.findMany({
      limit: 1
    })
    return { 
      success: true, 
      message: 'Database connection successful',
      data: result
    }
  } catch (error) {
    console.error('Database connection error:', error)
    return { 
      success: false, 
      message: 'Failed to connect to database',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}