"use client";

import { AdminSidebarWrapper } from "@/components/ui/admin-sidebar-wrapper";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import UserDropdown from "@/components/ui/user-dropdown";
import FeedbackDialog from "@/components/ui/feedback-dialog";
import { RiScanLine } from "@remixicon/react";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Add debugging to check if layout is rendering properly
  useEffect(() => {
    console.log("AdminLayout rendered");
  }, []);

  // In a production environment, we would add authentication checks here
  // to ensure only admin users can access this layout

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full grid-cols-[auto_1fr]">
        <AdminSidebarWrapper />
        <main className="flex-1 overflow-auto w-full">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6 lg:px-8">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger className="-ms-4" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/admin-dashboard">
                      <RiScanLine size={22} aria-hidden="true" />
                      <span className="sr-only">Admin Dashboard</span>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Admin</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex gap-3 ml-auto">
              <FeedbackDialog />
              <UserDropdown />
            </div>
          </header>
          <div className="p-6 w-full">
            {children}
            <Toaster />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}