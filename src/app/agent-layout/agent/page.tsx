"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RiAddLine } from "@remixicon/react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { createClientSupabaseClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { AgentStats } from "@/components/agent/agent-stats"
import { CommissionSummary } from "@/components/agent/commission-summary"

export default function AgentDashboard() {
  // State for user data
  const [userName, setUserName] = useState('Demo Agent');
  const [userId, setUserId] = useState('mock-user-id');
  // For development, we'll set these as static values
  const isLoading = false;
  const transactions = [];

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (process.env.NODE_ENV === 'development') {
        // In development mode, use mock data
        return;
      }

      try {
        const supabase = createClientSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', user.id)
            .single();

          if (profile) {
            setUserName(`${profile.first_name} ${profile.last_name}`);
            setUserId(user.id);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {userName}
        </h1>
        <Link href="/agent/transactions/new">
          <Button>
            <RiAddLine className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        </Link>
      </div>

      {/* Agent Stats */}
      <AgentStats agentId={userId} />

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="commission">Commission Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-4">
                  {/* Transaction list would go here */}
                  <p>Your recent transactions will appear here.</p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No transactions found</p>
                  <Link href="/agent/transactions/new">
                    <Button>
                      <RiAddLine className="mr-2 h-4 w-4" />
                      Create Your First Transaction
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <CommissionSummary agentId={userId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}