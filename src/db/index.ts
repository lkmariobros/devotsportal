import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// For server-side only
const connectionString = process.env.DATABASE_URL || ''

// Log connection attempt (without password)
console.log('Attempting to connect to database with:', 
  connectionString.replace(/:[^:@]+@/, ':****@'))

const client = postgres(connectionString, { 
  ssl: 'require',
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10
})

export const db = drizzle(client, { schema })