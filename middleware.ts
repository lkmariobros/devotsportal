import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  // Create the response first so we can manipulate headers
  const res = NextResponse.next();

  // COMPLETELY NEW APPROACH: Check for portal_switch cookie
  // If present, this is a navigation from the portal switch API
  const portalSwitch = request.cookies.get('portal_switch');
  if (portalSwitch?.value === 'true') {
    console.log('Portal switch detected - BYPASSING ALL AUTH CHECKS');

    // Copy all cookies from the request to the response
    const allCookies = request.cookies.getAll();
    allCookies.forEach(cookie => {
      res.cookies.set(cookie.name, cookie.value, {
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite as any,
        maxAge: cookie.maxAge,
        path: cookie.path,
      });
    });

    // Clear the portal_switch cookie
    res.cookies.set('portal_switch', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return res;
  }

  // Continue with regular authentication checks for non-portal navigation
  const supabase = createMiddlewareClient({ req: request, res });
  await supabase.auth.getSession();

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