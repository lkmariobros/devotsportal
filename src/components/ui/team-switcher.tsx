"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { usePortal } from "@/providers/portal-context";

// Detect if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { RiExpandUpDownLine } from "@remixicon/react";

interface TeamSwitcherProps {
  teams: {
    name: string;
    logo: string;
  }[];
  isAdmin?: boolean;
}

export function TeamSwitcher({ teams, isAdmin = false }: TeamSwitcherProps) {
  const [activeTeam, setActiveTeam] = React.useState(teams[0] ?? null);
  const [isNavigating, setIsNavigating] = React.useState(false);
  const pathname = isBrowser ? usePathname() : '';
  const router = isBrowser ? useRouter() : null;

  // Safely use the portal context (might be undefined during SSR/SSG)
  let portalContext;
  try {
    portalContext = usePortal();
  } catch (error) {
    // During SSR/SSG, provide fallback values
    portalContext = {
      currentPortal: 'agent',
      switchToAdminPortal: () => {},
      switchToAgentPortal: () => {},
      isLoading: false
    };
  }

  const { isLoading, currentPortal } = portalContext;

  // Determine if we're currently in the admin dashboard
  const isInAdminDashboard = pathname?.includes("/admin-layout") || pathname?.includes("/admin") || false;

  // Store toast ID in a ref to ensure it persists across renders
  const toastIdRef = React.useRef<string | number | null>(null);

  // Clear any existing toasts when component unmounts
  React.useEffect(() => {
    return () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, []);

  if (!teams.length) return null;

  // For non-admin users, just show the current team without dropdown
  if (!isAdmin) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="gap-3 [&>svg]:size-auto">
            <div className="flex aspect-square size-8 items-center justify-center rounded-md overflow-hidden bg-sidebar-primary text-sidebar-primary-foreground">
              {activeTeam && (
                <Image
                  src={activeTeam.logo}
                  width={36}
                  height={36}
                  alt={activeTeam.name}
                />
              )}
            </div>
            <div className="grid flex-1 text-left text-base leading-tight">
              <span className="truncate font-medium">
                {activeTeam?.name ?? "Team Portal"}
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Direct navigation handlers
  const handleAdminSwitch = () => {
    console.log('Admin portal switch clicked');
    // Direct navigation as fallback
    if (isBrowser) {
      window.location.href = "/admin-layout/admin-dashboard";
    }
  };

  const handleAgentPortalSwitch = (e) => {
    e.preventDefault(); // Prevent default button behavior
    console.log('Agent portal switch clicked');

    // Use this exact URL with the query parameter to preserve session
    window.location.href = "/agent-layout/agent/dashboard?maintain_session=true";
  };

  // Admin view with dropdown functionality
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground gap-3 [&>svg]:size-auto"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-md overflow-hidden bg-sidebar-primary text-sidebar-primary-foreground">
                {activeTeam && (
                  <Image
                    src={activeTeam.logo}
                    width={36}
                    height={36}
                    alt={activeTeam.name}
                  />
                )}
              </div>
              <div className="grid flex-1 text-left text-base leading-tight">
                <span className="truncate font-medium">
                  {isInAdminDashboard ? "Admin Dashboard" : activeTeam?.name ?? "Team Portal"}
                </span>
              </div>
              <RiExpandUpDownLine
                className="ms-auto text-muted-foreground/60"
                size={20}
                aria-hidden="true"
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-md"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="uppercase text-muted-foreground/60 text-xs">
              Portal Options
            </DropdownMenuLabel>

            {isInAdminDashboard ? (
              // If in admin dashboard, show option to go to agent portal
              <DropdownMenuItem
                onClick={handleAgentPortalSwitch}
                className="gap-2 p-2"
                disabled={isLoading}
              >
                <div className="flex size-6 items-center justify-center rounded-md overflow-hidden bg-primary text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                Agent Portal
                <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
              </DropdownMenuItem>
            ) : (
              // If in agent portal, show option to go to admin dashboard
              <DropdownMenuItem
                onClick={handleAdminSwitch}
                className="gap-2 p-2"
                disabled={isLoading}
              >
                <div className="flex size-6 items-center justify-center rounded-md overflow-hidden bg-primary text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                Admin Dashboard
                <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}



