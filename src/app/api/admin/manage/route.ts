import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { isUserAdmin } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Check if current user is admin
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all admin users
    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, created_at, updated_at')
      .eq('role', 'admin');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ admins: data });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if current user is admin
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get request body
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Call the SQL function to set user as admin
    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase.rpc('set_user_as_admin', { 
      user_email: email.toLowerCase() 
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `User ${email} set as admin` });
  } catch (error) {
    console.error('Error setting admin user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
