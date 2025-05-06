"use client";

import { AdminSidebar } from "@/components/ui/admin-sidebar";
import * as React from "react";

export function AdminSidebarWrapper(props: React.ComponentProps<typeof AdminSidebar>) {
  return <AdminSidebar {...props} />;
}