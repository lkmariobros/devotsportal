import { createClient } from '@supabase/supabase-js'

// Create Supabase client for notification operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

type NotificationType = 'info' | 'success' | 'warning' | 'error'

interface CreateNotificationParams {
  userId: string
  title: string
  message: string
  type?: NotificationType
  link?: string
  forAdminsOnly?: boolean
}

export const NotificationService = {
  /**
   * Create a notification for a specific user
   */
  async createForUser({
    userId,
    title,
    message,
    type = 'info',
    link,
    forAdminsOnly = false
  }: CreateNotificationParams) {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          link,
          is_read: false,
          for_admins_only: forAdminsOnly
        })
        
      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Failed to create notification:', error)
      return { success: false, error }
    }
  },
  
  /**
   * Create notifications for multiple users
   */
  async createForUsers(userIds: string[], notification: Omit<CreateNotificationParams, 'userId'>) {
    try {
      const notificationsToInsert = userIds.map(userId => ({
        user_id: userId,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        link: notification.link,
        is_read: false,
        for_admins_only: notification.forAdminsOnly || false
      }))
      
      const { error } = await supabase
        .from('notifications')
        .insert(notificationsToInsert)
        
      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Failed to create notifications:', error)
      return { success: false, error }
    }
  },
  
  /**
   * Create a notification for all admin users
   */
  async createForAllAdmins(notification: Omit<CreateNotificationParams, 'userId'>) {
    try {
      // First, get all admin users
      const { data: adminUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        
      if (usersError) throw usersError
      
      if (!adminUsers || adminUsers.length === 0) {
        return { success: true, message: 'No admin users found' }
      }
      
      // Create notifications for all admin users
      const adminUserIds = adminUsers.map(user => user.id)
      return this.createForUsers(adminUserIds, {
        ...notification,
        forAdminsOnly: true
      })
    } catch (error) {
      console.error('Failed to create admin notifications:', error)
      return { success: false, error }
    }
  }
}