"use client"

import { RiAddLine } from "@remixicon/react"
import Link from "next/link"
import { createClient } from '@supabase/supabase-js'

// Hardcoded values for Vercel deployment
const SUPABASE_URL = 'https://drelzxbshewqkaznwhrn.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyZWx6eGJzaGV3cWthem53aHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMTg0MjgsImV4cCI6MjA2MDc5NDQyOH0.NfbfbAS4x68A39znICZK4w4G7tIgAA3BxYZkrhnVRTQ'

// Inline function to create Supabase client
function createClientSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
import { useEffect, useState } from "react"

// Simple UI components to avoid import issues
function SimpleButton({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 ${className}`}>{children}</button>;
}

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

function SimpleTabs({ children, defaultValue, className = '' }: {
  children: React.ReactNode,
  defaultValue?: string,
  className?: string
}) {
  return <div className={`w-full ${className}`}>{children}</div>;
}

function SimpleTabsList({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-2 ${className}`}>{children}</div>;
}

function SimpleTabsTrigger({ children, value, className = '' }: {
  children: React.ReactNode,
  value: string,
  className?: string
}) {
  return <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm ${className}`}>{children}</button>;
}

function SimpleTabsContent({ children, value, className = '' }: {
  children: React.ReactNode,
  value: string,
  className?: string
}) {
  return <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}>{children}</div>;
}

function SimpleSkeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`}></div>;
}

// Simplified agent stats component
function SimpleAgentStats({ agentId }: { agentId?: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SimpleCard>
        <SimpleCardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-muted-foreground">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
        </SimpleCardContent>
      </SimpleCard>
      <SimpleCard>
        <SimpleCardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Commission</p>
              <p className="text-2xl font-bold">RM 0.00</p>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-muted-foreground">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
        </SimpleCardContent>
      </SimpleCard>
      <SimpleCard>
        <SimpleCardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Transactions</p>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground mt-1">Awaiting completion</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-muted-foreground">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
        </SimpleCardContent>
      </SimpleCard>
    </div>
  )
}

// Simplified commission summary component
function SimpleCommissionSummary({ agentId }: { agentId?: string }) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      No commission data available
    </div>
  )
}

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
        <Link href="/agent-layout/transactions/new">
          <SimpleButton>
            <RiAddLine className="mr-2 h-4 w-4" />
            New Transaction
          </SimpleButton>
        </Link>
      </div>

      {/* Agent Stats */}
      <SimpleAgentStats agentId={userId} />

      <SimpleTabs defaultValue="transactions" className="w-full">
        <SimpleTabsList className="grid w-full grid-cols-2">
          <SimpleTabsTrigger value="transactions">Recent Transactions</SimpleTabsTrigger>
          <SimpleTabsTrigger value="commission">Commission Summary</SimpleTabsTrigger>
        </SimpleTabsList>

        <SimpleTabsContent value="transactions" className="mt-4">
          <SimpleCard>
            <SimpleCardHeader>
              <SimpleCardTitle>Recent Transactions</SimpleCardTitle>
            </SimpleCardHeader>
            <SimpleCardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <SimpleSkeleton key={i} className="h-16 w-full" />
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
                  <Link href="/agent-layout/transactions/new">
                    <SimpleButton>
                      <RiAddLine className="mr-2 h-4 w-4" />
                      Create Your First Transaction
                    </SimpleButton>
                  </Link>
                </div>
              )}
            </SimpleCardContent>
          </SimpleCard>
        </SimpleTabsContent>

        <SimpleTabsContent value="commission" className="mt-4">
          <SimpleCard>
            <SimpleCardHeader>
              <SimpleCardTitle>Commission Summary</SimpleCardTitle>
            </SimpleCardHeader>
            <SimpleCardContent>
              <SimpleCommissionSummary agentId={userId} />
            </SimpleCardContent>
          </SimpleCard>
        </SimpleTabsContent>
      </SimpleTabs>
    </div>
  )
}