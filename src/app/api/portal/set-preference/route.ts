import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { portal } = body;

    if (!portal || (portal !== 'admin' && portal !== 'agent')) {
      return NextResponse.json(
        { error: 'Invalid portal preference' },
        { status: 400 }
      );
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
        return NextResponse.json(
          { error: 'Unauthorized to access admin portal' },
          { status: 403 }
        );
      }
    }

    // Set the portal preference in a secure cookie
    const cookieStore = cookies();
    cookieStore.set('portal_preference', portal, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting portal preference:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
