import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration(filePath: string) {
  try {
    console.log(`Running migration: ${path.basename(filePath)}`)
    
    // Read the SQL file
    const sql = fs.readFileSync(filePath, 'utf8')
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error(`Error running migration ${path.basename(filePath)}:`, error)
      return false
    }
    
    console.log(`Migration ${path.basename(filePath)} completed successfully`)
    return true
  } catch (error) {
    console.error(`Error running migration ${path.basename(filePath)}:`, error)
    return false
  }
}

async function runMigrations() {
  // Get all migration files
  const migrationsDir = path.join(__dirname, '../db/migrations')
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort() // Sort to ensure migrations run in order
  
  console.log(`Found ${migrationFiles.length} migration files`)
  
  // Run each migration
  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file)
    const success = await runMigration(filePath)
    
    if (!success) {
      console.error(`Migration ${file} failed. Stopping.`)
      process.exit(1)
    }
  }
  
  console.log('All migrations completed successfully')
}

// Run the migrations
runMigrations().catch(error => {
  console.error('Error running migrations:', error)
  process.exit(1)
})
