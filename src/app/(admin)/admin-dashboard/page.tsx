"use client"

import { useEffect } from "react"
import { toast } from "sonner"

export default function AdminDashboardPage() {
  // Remove the useEffect that shows a toast on page load
  // This toast is now handled by the TeamSwitcher component
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-medium">Agents</h3>
          <p className="text-sm text-muted-foreground">Manage your agents</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-medium">Teams</h3>
          <p className="text-sm text-muted-foreground">Manage your teams</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-medium">Reports</h3>
          <p className="text-sm text-muted-foreground">View performance reports</p>
        </div>
      </div>
    </div>
  )
}
