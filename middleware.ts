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

      // Check if user is an admin - this is where you'd implement your admin check
      // For now, we'll use a simple email check
      const adminEmails = [
        'admin@example.com',
        'admin@devots.com',
        // Add your email here when you're ready
      ]

      const isAdmin = adminEmails.includes(user.email?.toLowerCase() || '')

      // If user is not an admin, redirect to dashboard
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/agent-layout/dashboard', request.url))
      }
    }
  }

  return res
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}