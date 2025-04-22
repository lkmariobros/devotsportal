"use client";

import { AgentSidebar } from "@/components/ui/agent-sidebar";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClientComponentClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          redirect("/login");
        }
        
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking authentication:", error);
        redirect("/login");
      }
    }
    
    checkAuth();
  }, []);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="flex h-screen">
      <AgentSidebar className="h-screen" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}