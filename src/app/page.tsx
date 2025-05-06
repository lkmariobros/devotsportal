import { LoginDialog } from "@/components/auth/login-dialog";
import { SignUpDialog } from "@/components/auth/signup-dialog";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { isUserAdmin } from "@/utils/supabase/server";

async function getUser() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function Home() {
  // Check if user is logged in
  const user = await getUser();

  // If user is logged in, check role and redirect accordingly
  if (user) {
    // Check if user is admin
    const isAdmin = await isUserAdmin();

    if (isAdmin) {
      // Redirect admin users to admin dashboard
      redirect('/admin-layout/admin-dashboard');
    } else {
      // Redirect regular users to agent dashboard
      redirect('/agent-layout/agent/dashboard');
    }
  }
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

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LoginDialog />
            <SignUpDialog />
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

