"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

// Define the interface for agent activity based on the actual API response
interface AgentActivity {
  id: string;
  agent_id: string;
  action_type: "transaction_created" | "transaction_updated" | "document_uploaded" | "profile_updated";
  entity_type: "transaction" | "document" | "profile";
  entity_id: string | null;
  created_at: string;
  agent: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

// Define the interface for the API response
interface AgentActivityResponse {
  activities: Array<{
    id: string;
    agent_id: string;
    action_type: string;
    entity_type: string | null;
    entity_id: string | null;
    created_at: string;
    agent: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
    };
  }>;
}

export function AgentActivity() {
  // Simplified version without TRPC
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Agent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground text-center py-6">
          No recent agent activity to display
        </div>
      </CardContent>
    </Card>
  );
}