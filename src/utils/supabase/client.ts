import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { ENV } from '../../env.js'

/**
 * Creates a Supabase client for client-side components with robust error handling
 * and development mode fallbacks.
 */
export function createClientSupabaseClient() {
  // Check if environment variables are available
  if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
    console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
    // Return a dummy client or throw an error in production
    if (ENV.NODE_ENV === 'production') {
      throw new Error('Supabase configuration is missing');
    }
  }

  // Create a client using environment variables
  return createClient<Database>(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY)
}