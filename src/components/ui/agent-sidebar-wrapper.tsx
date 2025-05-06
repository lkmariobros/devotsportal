"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AgentSidebar } from "@/components/ui/agent-sidebar"

// Export a wrapped version that includes the SidebarProvider
export function AgentSidebarWrapper(props: React.ComponentProps<typeof AgentSidebar>) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AgentSidebar {...props} />
    </SidebarProvider>
  )
}
