import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const formData = await request.formData();
    const portal = formData.get('portal') as string;
    const redirectUrl = formData.get('redirectUrl') as string;

    console.log('Portal switch request:', { portal, redirectUrl });

    if (!portal || (portal !== 'admin' && portal !== 'agent')) {
      return NextResponse.json(
        { error: 'Invalid portal preference' },
        { status: 400 }
      );
    }

    if (!redirectUrl) {
      return NextResponse.json(
        { error: 'Missing redirect URL' },
        { status: 400 }
      );
    }

    // Get the current user session
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      // If no user is found, redirect to login
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Check if user is allowed to access the requested portal
    if (portal === 'admin') {
      // Check if user is an admin
      const adminEmails = [
        'elson@devots.com.my',
        'josephkwantum@gmail.com'
      ];

      const isAdmin = adminEmails.includes(user.email?.toLowerCase() || '');

      if (!isAdmin) {
        // If user is not an admin, redirect to agent dashboard
        return NextResponse.redirect(new URL('/agent-layout/agent/dashboard', request.url));
      }
    }

    // Create a response that redirects to the specified URL
    const response = NextResponse.redirect(new URL(redirectUrl, request.url));

    // Set cookies for portal preference and user role
    response.cookies.set('portal_preference', portal, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    response.cookies.set('user_role', portal === 'admin' ? 'admin' : 'agent', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Set a special cookie to indicate that this is a portal switch
    response.cookies.set('portal_switch', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60, // 1 minute (just long enough for the navigation)
      path: '/',
    });

    console.log('Redirecting to:', redirectUrl);
    return response;
  } catch (error) {
    console.error('Error handling portal switch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
