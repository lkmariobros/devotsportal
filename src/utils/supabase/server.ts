import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
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