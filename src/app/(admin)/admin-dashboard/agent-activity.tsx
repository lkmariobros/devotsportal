"use client";

import { trpc } from "@/utils/trpc/client";
import { formatDistanceToNow } from "date-fns";

// Simple UI components to avoid import issues
function SimpleCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>;
}

function SimpleCardHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
}

function SimpleCardTitle({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
}

function SimpleCardContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

function SimpleAvatar({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>;
}

function SimpleAvatarImage({ src, className = '' }: { src: string, className?: string }) {
  return src ? <img src={src} className={`aspect-square h-full w-full ${className}`} /> : null;
}

function SimpleAvatarFallback({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`flex h-full w-full items-center justify-center rounded-full bg-muted text-xs ${className}`}>{children}</div>;
}

function SimpleBadge({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>{children}</span>;
}

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
      <SimpleCard>
        <SimpleCardHeader>
          <SimpleCardTitle>Recent Agent Activity</SimpleCardTitle>
        </SimpleCardHeader>
        <SimpleCardContent>
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
        </SimpleCardContent>
      </SimpleCard>
    );
  }

  if (error) {
    return (
      <SimpleCard>
        <SimpleCardHeader>
          <SimpleCardTitle>Recent Agent Activity</SimpleCardTitle>
        </SimpleCardHeader>
        <SimpleCardContent>
          <div className="text-destructive">
            Failed to load agent activity
          </div>
        </SimpleCardContent>
      </SimpleCard>
    );
  }

  if (!data?.activities?.length) {
    return (
      <SimpleCard>
        <SimpleCardHeader>
          <SimpleCardTitle>Recent Agent Activity</SimpleCardTitle>
        </SimpleCardHeader>
        <SimpleCardContent>
          <div className="text-muted-foreground text-center py-6">
            No recent agent activity to display
          </div>
        </SimpleCardContent>
      </SimpleCard>
    );
  }

  return (
    <SimpleCard>
      <SimpleCardHeader>
        <SimpleCardTitle>Recent Agent Activity</SimpleCardTitle>
      </SimpleCardHeader>
      <SimpleCardContent>
        <div className="space-y-4">
          {data.activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <SimpleAvatar>
                <SimpleAvatarImage src={activity.agent.avatar_url || ""} />
                <SimpleAvatarFallback>
                  {activity.agent.first_name?.[0]}{activity.agent.last_name?.[0]}
                </SimpleAvatarFallback>
              </SimpleAvatar>
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
                  <SimpleBadge className="mt-1 border-muted-foreground/20 text-muted-foreground">
                    {activity.entity_type === "transaction" && `Transaction #${activity.entity_id.slice(-6)}`}
                    {activity.entity_type === "document" && `Document #${activity.entity_id.slice(-6)}`}
                    {activity.entity_type === "profile" && "Profile"}
                  </SimpleBadge>
                )}
              </div>
            </div>
          ))}
        </div>
      </SimpleCardContent>
    </SimpleCard>
  );
}