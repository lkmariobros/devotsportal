'use server'

import { isUserAdmin } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Example of a protected admin action
export async function adminOnlyAction(data: any) {
  // Check if user is admin
  const isAdmin = await isUserAdmin()
  
  if (!isAdmin) {
    return {
      error: 'Unauthorized. Admin access required.',
      success: false
    }
  }
  
  try {
    // Perform admin-only operation here
    console.log('Admin action performed with data:', data)
    
    // Revalidate the path to update the UI
    revalidatePath('/admin')
    
    return {
      success: true,
      message: 'Admin action completed successfully'
    }
  } catch (error) {
    console.error('Admin action failed:', error)
    return {
      error: 'Failed to complete admin action',
      success: false
    }
  }
}