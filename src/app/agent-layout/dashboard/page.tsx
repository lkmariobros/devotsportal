import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/utils/supabase/server"
import { isUserAdmin } from "@/utils/supabase/server"

export default async function AgentDashboardPage() {
  // Check if user is admin
  const isAdmin = await isUserAdmin()

  if (isAdmin) {
    // Redirect admin users to admin dashboard
    redirect("/admin-layout/admin-dashboard")
  } else {
    // Redirect regular users to agent dashboard
    redirect("/agent-layout/agent/dashboard")
  }
}
