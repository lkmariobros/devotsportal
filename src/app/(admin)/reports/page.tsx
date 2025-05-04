"use server"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Reports
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Reports functionality is coming soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}