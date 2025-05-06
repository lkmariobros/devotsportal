import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  // During development, we'll bypass admin checks
  // In production, this would check admin status
  if (process.env.NODE_ENV === 'production') {
    // Check if the request is for an admin route
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/admin-layout')

    if (isAdminRoute) {
      // Get the user from Supabase auth
      const { data: { user } } = await supabase.auth.getUser()

      // If no user is found, redirect to login
      if (!user) {
        const redirectUrl = new URL('/', request.url)
        redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Check if user is an admin
      // First check the profile role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      let isAdmin = profile && profile.role === 'admin'

      // If not admin by role, check the email list as fallback
      if (!isAdmin) {
        const adminEmails = [
          'elson@devots.com.my',
          'josephkwantum@gmail.com'
          // This list should match the server-side list
        ]

        isAdmin = adminEmails.includes(user.email?.toLowerCase() || '')
      }

      // If user is not an admin, redirect to agent dashboard
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/agent-layout/agent/dashboard', request.url))
      }
    }
  }

  return res
}

// Import the matcher configuration from middleware.config.ts
import { config } from './middleware.config';

// Export the config for Next.js to use
export { config };