"use client";

import { RiScanLine } from "@remixicon/react";
import { useEffect } from "react";
import Link from "next/link";

// Simple UI components to avoid import issues
function SimpleSidebarProvider({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>;
}

function SimpleSidebarTrigger({ className = '' }: { className?: string }) {
  return <button className={`inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent ${className}`}>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <line x1="4" x2="20" y1="12" y2="12"/>
      <line x1="4" x2="20" y1="6" y2="6"/>
      <line x1="4" x2="20" y1="18" y2="18"/>
    </svg>
  </button>;
}

function SimpleSeparator({ orientation = 'horizontal', className = '' }: { orientation?: 'horizontal' | 'vertical', className?: string }) {
  return orientation === 'vertical'
    ? <div className={`h-full w-[1px] bg-border ${className}`}></div>
    : <div className={`h-[1px] w-full bg-border ${className}`}></div>;
}

function SimpleBreadcrumb({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <nav className={`flex ${className}`} aria-label="breadcrumb">{children}</nav>;
}

function SimpleBreadcrumbList({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <ol className={`flex flex-wrap items-center gap-1.5 ${className}`}>{children}</ol>;
}

function SimpleBreadcrumbItem({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <li className={`inline-flex items-center gap-1.5 ${className}`}>{children}</li>;
}

function SimpleBreadcrumbLink({ children, href, className = '' }: { children: React.ReactNode, href: string, className?: string }) {
  return <Link href={href} className={`flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground ${className}`}>{children}</Link>;
}

function SimpleBreadcrumbPage({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <span className={`flex items-center gap-1 text-sm font-medium ${className}`}>{children}</span>;
}

function SimpleBreadcrumbSeparator({ children, className = '' }: { children?: React.ReactNode, className?: string }) {
  return <li className={`text-muted-foreground ${className}`}>{children || <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="9 18 15 12 9 6"/></svg>}</li>;
}

function SimpleToaster() {
  return <div id="toast-container"></div>;
}

function SimpleUserDropdown() {
  return <div className="relative">
    <button className="flex items-center gap-2 rounded-md p-1 text-sm font-medium hover:bg-accent">
      <div className="relative h-8 w-8 rounded-full bg-muted">
        <span className="absolute inset-0 flex items-center justify-center font-semibold">U</span>
      </div>
    </button>
  </div>;
}

function SimpleFeedbackDialog() {
  return <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
    Feedback
  </button>;
}

function SimpleAdminSidebar() {
  return <div className="hidden border-r border-border lg:block">
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/admin-dashboard" className="flex items-center gap-2 font-semibold">
          <img src="https://res.cloudinary.com/dlzlfasou/image/upload/v1741345507/logo-01_kp2j8x.png" alt="Admin Portal" className="h-6 w-auto" />
          <span>Admin Portal</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          <Link href="/admin-dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent">
            <RiScanLine className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin-dashboard/transactions" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>Transactions</span>
          </Link>
          <Link href="/agents" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Agents</span>
          </Link>
        </nav>
      </div>
    </div>
  </div>;
}

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
    <SimpleSidebarProvider>
      <div className="grid min-h-screen w-full grid-cols-[auto_1fr]">
        <SimpleAdminSidebar />
        <main className="flex-1 overflow-auto w-full">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6 lg:px-8">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SimpleSidebarTrigger className="-ms-4" />
              <SimpleSeparator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <SimpleBreadcrumb>
                <SimpleBreadcrumbList>
                  <SimpleBreadcrumbItem className="hidden md:block">
                    <SimpleBreadcrumbLink href="/admin-dashboard">
                      <RiScanLine size={22} aria-hidden="true" />
                      <span className="sr-only">Admin Dashboard</span>
                    </SimpleBreadcrumbLink>
                  </SimpleBreadcrumbItem>
                  <SimpleBreadcrumbSeparator className="hidden md:block" />
                  <SimpleBreadcrumbItem>
                    <SimpleBreadcrumbPage>Admin</SimpleBreadcrumbPage>
                  </SimpleBreadcrumbItem>
                </SimpleBreadcrumbList>
              </SimpleBreadcrumb>
            </div>
            <div className="flex gap-3 ml-auto">
              <SimpleFeedbackDialog />
              <SimpleUserDropdown />
            </div>
          </header>
          <div className="p-6 w-full">
            {children}
            <SimpleToaster />
          </div>
        </main>
      </div>
    </SimpleSidebarProvider>
  );
}