import { createClient } from '@supabase/supabase-js'

// Hardcoded values for Vercel deployment
const SUPABASE_URL = 'https://drelzxbshewqkaznwhrn.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyZWx6eGJzaGV3cWthem53aHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMTg0MjgsImV4cCI6MjA2MDc5NDQyOH0.NfbfbAS4x68A39znICZK4w4G7tIgAA3BxYZkrhnVRTQ'

/**
 * Creates a Supabase client for client-side components with hardcoded values for Vercel deployment
 */
export function createClientSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
