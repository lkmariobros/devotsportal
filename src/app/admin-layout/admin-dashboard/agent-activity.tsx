"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/utils/trpc/client";
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
  const { data, isLoading, error } = trpc.users.getRecentAgentActivity.useQuery(
    { limit: 5 },
    { staleTime: 2 * 60 * 1000 } // 2 minutes
  ) as { 
    data: AgentActivityResponse | undefined; 
    isLoading: boolean; 
    error: Error | null 
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Agent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/4 bg-muted rounded"></div>
                  <div className="h-3 w-3/4 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Agent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">
            Failed to load agent activity
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!data?.activities?.length) {
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Agent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={activity.agent.avatar_url || ""} />
                <AvatarFallback>
                  {activity.agent.first_name?.[0]}{activity.agent.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {activity.agent.first_name} {activity.agent.last_name}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.action_type === "transaction_created" && "Created a new transaction"}
                  {activity.action_type === "transaction_updated" && "Updated transaction details"}
                  {activity.action_type === "document_uploaded" && "Uploaded a new document"}
                  {activity.action_type === "profile_updated" && "Updated their profile"}
                </p>
                {activity.entity_id && (
                  <Badge variant="outline" className="mt-1">
                    {activity.entity_type === "transaction" && `Transaction #${activity.entity_id.slice(-6)}`}
                    {activity.entity_type === "document" && `Document #${activity.entity_id.slice(-6)}`}
                    {activity.entity_type === "profile" && "Profile"}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}