"use client"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
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
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-medium">Settings</h3>
          <p className="text-sm text-muted-foreground">Configure system settings</p>
        </div>
      </div>
    </div>
  )
}