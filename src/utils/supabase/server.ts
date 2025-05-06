import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export function createServerSupabaseClient() {
  try {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Create a client using environment variables
    return createClient<Database>(supabaseUrl, supabaseKey);
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

    // Primary check: Look for role in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile && profile.role === 'admin') {
      return true;
    }

    // Fallback check: Check if user email is in the admin list
    // This maintains compatibility with existing code
    const adminEmails = [
      'elson@devots.com.my',
      'josephkwantum@gmail.com'
      // Add any other admin emails here only if absolutely necessary
    ];

    return adminEmails.includes(user.email?.toLowerCase() || '');
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}