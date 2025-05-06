"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { usePathname } from "next/navigation";

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        // For development purposes, you can set this to true to bypass Supabase auth
        if (process.env.NODE_ENV === 'development') {
          console.log("Bypassing auth for development");
          setIsAdmin(true);
          setUserEmail("dev@example.com");
          setIsLoading(false);
          return;
        }

        // Production code
        const supabase = createClientComponentClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          console.error("Auth error or no user:", error);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        setUserEmail(user.email || null);

        // Primary check: Look for role in profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile && profile.role === 'admin') {
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }

        // Fallback check: Check if user email is in the admin list
        const adminEmails = [
          'elson@devots.com.my',
          'josephkwantum@gmail.com'
          // This list should match the server-side list
        ];

        const isUserAdmin = adminEmails.includes(user.email?.toLowerCase() || '');

        setIsAdmin(isUserAdmin);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, []);

  // Check if the current path is in the admin section
  const isAdminPath = pathname?.startsWith('/admin') || false;

  // During development, allow path-based access
  // In production, this would be: return isAdmin;
  return isAdmin || isAdminPath;
}