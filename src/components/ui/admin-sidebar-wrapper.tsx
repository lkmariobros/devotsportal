"use client";

import { AdminSidebar } from "@/components/ui/admin-sidebar";
import { SidebarProvider } from "@/components/reusable-ui/sidebar";
import * as React from "react";

export function AdminSidebarWrapper(props: React.ComponentProps<typeof AdminSidebar>) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AdminSidebar {...props} />
    </SidebarProvider>
  );
}