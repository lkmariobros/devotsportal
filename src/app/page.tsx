"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClientSupabaseClient } from "@/utils/supabase/simple-client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Helper function to check if user is admin
function isUserAdmin(email: string) {
  const adminEmails = [
    'elson@devots.com.my',
    'josephkwantum@gmail.com'
  ];
  return adminEmails.includes(email.toLowerCase());
}

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if user is already logged in on page load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClientSupabaseClient();
        const { data } = await supabase.auth.getSession();

        if (data.session) {
          console.log('User already has a session');
          const userEmail = data.session.user.email || '';
          const isAdmin = isUserAdmin(userEmail);
          const redirectPath = isAdmin ? '/admin-layout/admin-dashboard' : '/agent-layout/agent/dashboard';
          window.location.href = redirectPath;
        } else {
          console.log('No active session found');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!email || !password) {
        setErrorMessage('Please enter both email and password');
        setIsLoading(false);
        return;
      }

      // Create Supabase client with hardcoded credentials for Vercel deployment
      const supabase = createClientSupabaseClient();
      console.log('Supabase client created');

      // Sign in with email and password
      console.log('Attempting to sign in with:', { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('Sign in response:', { data: data ? 'exists' : 'null', error: error ? error.message : 'none' });

      if (error) {
        console.error('Login error:', error.message);
        setErrorMessage(error.message || 'Failed to sign in. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      // Check if user is admin
      const isAdmin = isUserAdmin(email.toLowerCase());
      console.log('User is admin:', isAdmin);

      // Navigate based on user role
      const redirectPath = isAdmin ? '/admin-layout/admin-dashboard' : '/agent-layout/agent/dashboard';
      console.log('Redirecting to:', redirectPath);

      // Use window.location for a hard redirect instead of router.push
      window.location.href = redirectPath;
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="max-w-5xl w-full flex flex-col items-center justify-center text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4">
            Welcome to Devots Portal
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your all-in-one platform for managing contacts and connections
          </p>

          <div className="max-w-md mx-auto w-full">
            <form className="space-y-5 bg-card p-6 rounded-lg border" onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="hi@yourcompany.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 text-sm text-white bg-destructive rounded-md">
                  {errorMessage}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account? <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/signup')}>Sign up</Button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center p-6 bg-card rounded-lg border">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Manage Contacts</h3>
            <p className="text-muted-foreground text-center">Organize and manage all your contacts in one place with powerful filtering and search.</p>
          </div>

          <div className="flex flex-col items-center p-6 bg-card rounded-lg border">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Interactions</h3>
            <p className="text-muted-foreground text-center">Log and track all your interactions with contacts to build stronger relationships.</p>
          </div>

          <div className="flex flex-col items-center p-6 bg-card rounded-lg border">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Analyze Data</h3>
            <p className="text-muted-foreground text-center">Get insights from your contact data with powerful analytics and reporting tools.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

