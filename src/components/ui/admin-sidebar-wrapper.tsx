"use client";

import { useIsAdmin } from "@/hooks/useIsAdmin";
import { AppSidebar } from "./app-sidebar";

export function AdminSidebarWrapper() {
    const isAdmin = useIsAdmin();
    
    return <AppSidebar isAdmin={isAdmin} />;
  }