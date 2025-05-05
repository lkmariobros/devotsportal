import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { SUPABASE_URL, SUPABASE_ANON_KEY, NODE_ENV } from '../../env-config.js'

/**
 * Creates a Supabase client for client-side components with robust error handling
 * and development mode fallbacks.
 */
export function createClientSupabaseClient() {
  // Check if environment variables are available
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
    // Return a dummy client or throw an error in production
    if (NODE_ENV === 'production') {
      throw new Error('Supabase configuration is missing');
    }
  }

  // Create a client using environment variables
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}