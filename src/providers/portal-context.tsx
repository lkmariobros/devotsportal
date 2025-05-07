"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

type PortalType = "admin" | "agent";

interface PortalContextType {
  currentPortal: PortalType;
  switchToAdminPortal: () => void;
  switchToAgentPortal: () => void;
  isLoading: boolean;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  
  // Determine initial portal based on URL
  const isAdminPath = pathname.includes("/admin-layout") || pathname.includes("/admin");
  const [currentPortal, setCurrentPortal] = useState<PortalType>(
    isAdminPath ? "admin" : "agent"
  );

  // Update portal state when path changes
  useEffect(() => {
    const isAdminPath = pathname.includes("/admin-layout") || pathname.includes("/admin");
    setCurrentPortal(isAdminPath ? "admin" : "agent");
  }, [pathname]);

  // Function to switch to admin portal
  const switchToAdminPortal = async () => {
    if (currentPortal === "admin" || isLoading) return;
    
    setIsLoading(true);
    
    // Show loading toast
    const loadingToast = toast.loading("Switching to Admin Dashboard...");
    
    try {
      // Make a server request to set the portal preference in a secure cookie
      const response = await fetch("/api/portal/set-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ portal: "admin" }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to set portal preference");
      }
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Show success toast
      toast.success("Welcome to Admin Dashboard", {
        description: "You now have access to admin features",
      });
      
      // Update local state
      setCurrentPortal("admin");
      
      // Navigate to admin dashboard using Next.js router
      router.push("/admin-layout/admin-dashboard");
    } catch (error) {
      console.error("Error switching to admin portal:", error);
      toast.error("Failed to switch portals. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to switch to agent portal
  const switchToAgentPortal = async () => {
    if (currentPortal === "agent" || isLoading) return;
    
    setIsLoading(true);
    
    // Show loading toast
    const loadingToast = toast.loading("Switching to Agent Portal...");
    
    try {
      // Make a server request to set the portal preference in a secure cookie
      const response = await fetch("/api/portal/set-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ portal: "agent" }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to set portal preference");
      }
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Show success toast
      toast.success("Welcome to Agent Portal", {
        description: "You're now in the agent view",
      });
      
      // Update local state
      setCurrentPortal("agent");
      
      // Navigate to agent dashboard using Next.js router
      router.push("/agent-layout/agent/dashboard");
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
  if (context === undefined) {
    throw new Error("usePortal must be used within a PortalProvider");
  }
  return context;
}
