import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  // Get the portal preference and user role from cookies
  const portalPreference = request.cookies.get('portal_preference')?.value || 'agent'
  const userRole = request.cookies.get('user_role')?.value

  // Log the portal preference for debugging
  console.log('Portal preference from cookie:', portalPreference)
  console.log('User role from cookie:', userRole)

  // Check if the request is for a protected route
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/admin-layout')
  const isAgentRoute = request.nextUrl.pathname.startsWith('/agent') || request.nextUrl.pathname.startsWith('/agent-layout')

  // If it's a protected route, check authentication
  if (isAdminRoute || isAgentRoute) {
    // Get the user from Supabase auth
    const { data: { user } } = await supabase.auth.getUser()

    // If no user is found, redirect to login
    if (!user) {
      const redirectUrl = new URL('/', request.url)
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // For admin routes, check if user is an admin
    if (isAdminRoute) {
      // Check if user is an admin
      const adminEmails = [
        'elson@devots.com.my',
        'josephkwantum@gmail.com'
        // This list should match the server-side list
      ]

      const isAdmin = adminEmails.includes(user.email?.toLowerCase() || '')

      // If user is not an admin, redirect to agent dashboard
      if (!isAdmin) {
        console.log('Non-admin user attempting to access admin route, redirecting to agent dashboard')

        // Set portal preference cookie before redirecting
        const redirectResponse = NextResponse.redirect(new URL('/agent-layout/agent/dashboard', request.url))
        redirectResponse.cookies.set('portal_preference', 'agent', {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
        })

        return redirectResponse
      }
    }

    // For agent routes, we allow both agents and admins (admins can view agent portal)
    // No additional checks needed here as we've already verified the user is authenticated
  }

  return res
}

// Import the matcher configuration from middleware.config.ts
import { config } from './middleware.config';

// Export the config for Next.js to use
export { config };