import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

/**
 * Creates a Supabase client for client-side components with robust error handling
 * and development mode fallbacks.
 */
export function createClientSupabaseClient() {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if environment variables are available
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
    // Return a dummy client or throw an error in production
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Supabase configuration is missing');
    }
  }

  // Create a client using environment variables
  return createClient<Database>(supabaseUrl || '', supabaseKey || '')
}