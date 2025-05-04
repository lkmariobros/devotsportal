import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { ENV } from '@/env';

export function createServerSupabaseClient() {
  try {
    // Create a direct client without relying on environment variables
    return createClient<Database>(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw error;
  }
}

// Helper function to check if a user is an admin
export async function isUserAdmin() {
  // During development, always return true
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("Auth error or no user:", error);
      return false;
    }

    // Check if user email is in the admin list
    const adminEmails = [
      'admin@example.com',
      'admin@devots.com',
      // Add your email here when you're ready
    ];

    return adminEmails.includes(user.email?.toLowerCase() || '');
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}