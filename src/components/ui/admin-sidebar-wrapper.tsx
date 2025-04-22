"use client";

import { AdminSidebar } from "@/components/ui/admin-sidebar";
import { useEffect } from "react";

export function AdminSidebarWrapper() {
  // Add debugging to check if wrapper is rendering properly
  useEffect(() => {
    console.log("AdminSidebarWrapper rendered");
  }, []);

  return (
    <AdminSidebar className="border-r border-border" />
  );
}