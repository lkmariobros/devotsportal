import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../env-config.js';

export function createServerActionSupabaseClient() {
  try {
    // Create a direct client without relying on environment variables
    return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw error;
  }
}
