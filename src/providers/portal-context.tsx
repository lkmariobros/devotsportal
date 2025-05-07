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

  // Function to switch to admin portal (with SSR safety)
  const switchToAdminPortal = async () => {
    // No-op during SSR/SSG
    if (!isBrowser || currentPortal === "admin" || isLoading) return;

    setIsLoading(true);

    // Show loading toast
    const loadingToast = toast.loading("Switching to Admin Dashboard...");

    try {
      console.log('Setting admin portal preference via API');

      // Make a server request to set the portal preference in a secure cookie
      const response = await fetch("/api/portal/set-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ portal: "admin" }),
      });

      const responseData = await response.json();
      console.log('Portal preference API response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to set portal preference");
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show success toast
      toast.success("Welcome to Admin Dashboard", {
        description: "You now have access to admin features",
      });

      // Update local state
      setCurrentPortal("admin");

      // Navigate to admin dashboard
      console.log('Navigating to admin dashboard');
      window.location.href = "/admin-layout/admin-dashboard";
    } catch (error) {
      console.error("Error switching to admin portal:", error);
      toast.error("Failed to switch portals. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to switch to agent portal (with SSR safety)
  const switchToAgentPortal = async () => {
    // No-op during SSR/SSG
    if (!isBrowser || currentPortal === "agent" || isLoading) return;

    setIsLoading(true);

    // Show loading toast
    const loadingToast = toast.loading("Switching to Agent Portal...");

    try {
      console.log('Setting agent portal preference via API');

      // Make a server request to set the portal preference in a secure cookie
      const response = await fetch("/api/portal/set-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ portal: "agent" }),
      });

      const responseData = await response.json();
      console.log('Portal preference API response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to set portal preference");
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show success toast
      toast.success("Welcome to Agent Portal", {
        description: "You're now in the agent view",
      });

      // Update local state
      setCurrentPortal("agent");

      // Navigate to agent dashboard
      console.log('Navigating to agent dashboard');
      window.location.href = "/agent-layout/agent/dashboard";
    } catch (error) {
      console.error("Error switching to agent portal:", error);
      toast.error("Failed to switch portals. Please try again.");
    } finally {
      setIsLoading(false);
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
