import { z } from 'zod'
import { router, protectedProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const notificationsRouter = router({
  // Get user's notifications
  getMyNotifications: protectedProcedure
    .input(z.object({ 
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      onlyUnread: z.boolean().default(false)
    }))
    .query(async ({ ctx, input }) => {
      const { limit, offset, onlyUnread } = input
      const { supabase, user } = ctx
      
      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        
      if (onlyUnread) {
        query = query.eq('is_read', false)
      }
      
      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }
      
      return {
        notifications: data || [],
        total: count || 0
      }
    }),
    
  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { notificationId } = input
      const { supabase, user } = ctx
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .match({ 
          id: notificationId,
          user_id: user.id
        })
        
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to mark notification as read: ${error.message}`
        })
      }
        
      return { success: true }
    }),
    
  // Mark all notifications as read
  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const { supabase, user } = ctx
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .match({ 
          user_id: user.id,
          is_read: false
        })
        
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to mark all notifications as read: ${error.message}`
        })
      }
        
      return { success: true }
    }),
    
  // Get admin notifications
  getAdminNotifications: adminProcedure
    .input(z.object({ 
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ ctx, input }) => {
      const { limit, offset } = input
      const { supabase } = ctx
      
      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('for_admins_only', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
        
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }
      
      return {
        notifications: data || [],
        total: count || 0
      }
    }),

  // Create notification (admin only)
  createNotification: adminProcedure
    .input(z.object({
      userId: z.string().uuid(),
      title: z.string().min(1),
      message: z.string().min(1),
      type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
      link: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, title, message, type, link } = input
      const { supabase } = ctx
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          link,
          is_read: false,
          for_admins_only: false
        })
        
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create notification: ${error.message}`
        })
      }
        
      return { success: true }
    })
})