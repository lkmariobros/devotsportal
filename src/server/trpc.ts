import { initTRPC, TRPCError } from '@trpc/server'
import { createServerSupabaseClient } from '@/utils/supabase/server'
import superjson from 'superjson'
import { auditLogs } from '@/db/schema'

// Create context for each request
export const createTRPCContext = async () => {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    return {
      user,
      supabase,
    }
  } catch (error) {
    console.error('Error creating TRPC context:', error)

    // In development mode, create a mock user and supabase client
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock user in development mode')
      return {
        user: {
          id: 'mock-user-id',
          email: 'admin@example.com',
          role: 'admin'
        },
        supabase: {
          from: () => ({
            select: () => ({
              eq: () => ({
                single: () => ({ data: { role: 'admin' } })
              })
            })
          }),
          auth: {
            getUser: () => ({ data: { user: { id: 'mock-user-id', email: 'admin@example.com' } } })
          }
        },
      }
    }

    // In production, return null values
    return {
      user: null,
      supabase: null,
    }
  }
}

// Initialize tRPC
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
})

// Create a middleware to check if user is authenticated
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

// Create a middleware to check if user is admin
const isAdmin = t.middleware(async ({ ctx, next }) => {
  // In development mode, always allow admin access
  if (process.env.NODE_ENV === 'development') {
    return next({
      ctx: {
        user: ctx.user || { id: 'mock-user-id', email: 'admin@example.com', role: 'admin' },
      },
    })
  }

  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  try {
    // Check if user is admin (implement your admin check logic here)
    const { data: profile } = await ctx.supabase
      .from('profiles')
      .select('role')
      .eq('id', ctx.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' })
    }
  } catch (error) {
    console.error('Error checking admin status:', error)
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to verify admin status' })
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

// Create an audit middleware for admin actions
const withAudit = t.middleware(async ({ ctx, next, path, getRawInput }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  // Execute the procedure
  const result = await next({
    ctx: {
      user: ctx.user,
    },
  })

  // Skip audit logging in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('Skipping audit log in development mode for:', path)
    return result
  }

  // Log the action to audit logs
  try {
    const rawInput = getRawInput()
    await ctx.supabase
      .from('audit_logs')
      .insert({
        user_id: ctx.user.id,
        action: path,
        entity_type: path.split('.')[0],
        entity_id: (rawInput as any)?.id || (rawInput as any)?.commissionId || '',
        metadata: JSON.stringify(rawInput),
      })
  } catch (error) {
    // Log error but don't fail the procedure
    console.error('Failed to create audit log:', error)
  }

  return result
})

// Export procedures
export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthed)
export const adminProcedure = t.procedure.use(isAdmin)
export const adminProcedureWithAudit = t.procedure.use(isAdmin).use(withAudit)