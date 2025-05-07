"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

// Detect if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

type PortalType = "admin" | "agent";

interface PortalContextType {
  currentPortal: PortalType;
  switchToAdminPortal: () => void;
  switchToAgentPortal: () => void;
  isLoading: boolean;
}

// Create context with default values that are safe for SSR
const PortalContext = createContext<PortalContextType>({
  currentPortal: "agent",
  switchToAdminPortal: () => {},
  switchToAgentPortal: () => {},
  isLoading: false,
});

export function PortalProvider({ children }: { children: React.ReactNode }) {
  // Only use hooks in browser environment
  const router = isBrowser ? useRouter() : null;
  const pathname = isBrowser ? usePathname() : '';
  const [isLoading, setIsLoading] = useState(false);

  // Determine initial portal based on URL (safely for SSR)
  const isAdminPath = pathname?.includes("/admin-layout") || pathname?.includes("/admin") || false;
  const [currentPortal, setCurrentPortal] = useState<PortalType>(
    isAdminPath ? "admin" : "agent"
  );

  // Update portal state when path changes (only in browser)
  useEffect(() => {
    if (!isBrowser || !pathname) return;

    const isAdminPath = pathname.includes("/admin-layout") || pathname.includes("/admin");
    setCurrentPortal(isAdminPath ? "admin" : "agent");
  }, [pathname]);

  // Function to switch to admin portal - direct navigation approach
  const switchToAdminPortal = () => {
    // Only run in browser
    if (!isBrowser) return;

    try {
      console.log('Direct navigation to admin portal');

      // Show a simple toast
      toast.loading("Switching to Admin Dashboard...");

      // DIRECT navigation - no conditions, no complex checks
      window.location.href = "/admin-layout/admin-dashboard";

      // Don't add any code after the navigation line - it won't execute
    } catch (error) {
      console.error('Error switching to admin portal:', error);
      toast.error("Failed to switch portals. Please try again.");
    }
  };

  // Function to switch to agent portal - direct navigation approach
  const switchToAgentPortal = () => {
    // Only run in browser
    if (!isBrowser) return;

    try {
      console.log('Direct navigation to agent portal');

      // Show a simple toast
      toast.loading("Switching to Agent Portal...");

      // DIRECT navigation - no conditions, no complex checks
      window.location.href = "/agent-layout/agent/dashboard";

      // Don't add any code after the navigation line - it won't execute
    } catch (error) {
      console.error('Error switching to agent portal:', error);
      toast.error("Failed to switch portals. Please try again.");
    }
  };

  return (
    <PortalContext.Provider
      value={{
        currentPortal,
        switchToAdminPortal,
        switchToAgentPortal,
        isLoading,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const context = useContext(PortalContext);
  return context;
}
