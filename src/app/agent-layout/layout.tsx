import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/utils/supabase/server"
import { AgentSidebar } from "@/components/ui/agent-sidebar"
import { RealTimeProvider } from "@/providers/realtime-provider"
import { TRPCProvider } from "@/providers/trpc-provider"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import UserDropdown from "@/components/ui/user-dropdown"
import { Toaster } from "@/components/ui/sonner"

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // In development mode, bypass authentication
  if (process.env.NODE_ENV === 'development') {
    // Skip authentication checks
    console.log('Development mode: Bypassing authentication checks');
  } else {
    try {
      const supabase = createServerSupabaseClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        console.error('Authentication error:', error);
        redirect("/")
      }

      // For admin users, we'll allow access to agent portal
      // This is necessary for the portal-switching functionality
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // Check if user is an admin (they can access both portals)
      const adminEmails = [
        'elson@devots.com.my',
        'josephkwantum@gmail.com'
      ];

      const isAdmin = adminEmails.includes(user.email?.toLowerCase() || '');

      // If not admin and not agent, redirect to unauthorized
      if (!isAdmin && (!profile || profile.role !== 'agent')) {
        console.error('User is not authorized to access agent portal');
        redirect("/unauthorized")
      }
    } catch (error) {
      console.error('Error in agent layout authentication:', error);
      // In case of error, we'll continue in development mode
      if (process.env.NODE_ENV !== 'development') {
        redirect("/")
      }
    }
  }

  return (
    <SidebarProvider>
      <TRPCProvider>
        <RealTimeProvider>
          <div className="grid min-h-screen w-full grid-cols-[auto_1fr]">
            <AgentSidebar />
            <main className="flex-1 overflow-auto w-full">
              <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6 lg:px-8">
                <div className="flex flex-1 items-center gap-2 px-3">
                  <SidebarTrigger className="-ms-4" />
                  <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                  />
                  <h1 className="text-lg font-semibold">Agent Portal</h1>
                </div>
                <div className="flex gap-3 ml-auto">
                  <UserDropdown />
                </div>
              </header>
              <div className="p-6 w-full">
                {children}
                <Toaster />
              </div>
            </main>
          </div>
        </RealTimeProvider>
      </TRPCProvider>
    </SidebarProvider>
  )
}