import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { ENV } from '../../env.js';

export function createServerActionSupabaseClient() {
  try {
    // Create a direct client without relying on environment variables
    return createClient<Database>(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw error;
  }
}
