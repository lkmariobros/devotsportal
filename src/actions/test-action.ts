"use server"

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Simple test action to verify server actions are working
 */
export async function testServerAction(data: any) {
  try {
    console.log("Test server action received data:", data);
    
    // Create Supabase client
    const supabase = createServerActionClient({ cookies })
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }
    
    // Return success
    return { 
      success: true, 
      message: "Test server action successful",
      user: { id: user.id, email: user.email },
      receivedData: data
    }
  } catch (error) {
    console.error("Error in test server action:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}
