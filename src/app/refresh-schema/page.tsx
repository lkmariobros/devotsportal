"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { refreshSchemaCache } from "@/utils/refresh-schema"

export default function RefreshSchemaPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const refreshResult = await refreshSchemaCache()
      setResult(refreshResult)
    } catch (error) {
      setResult({ success: false, error: String(error) })
    } finally {
      setIsRefreshing(false)
    }
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Refresh Schema Cache</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Refresh Supabase Schema Cache</CardTitle>
          <CardDescription>
            Force Supabase to refresh its schema cache to recognize new columns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            If you've added new columns to your database but are getting errors about columns not existing, 
            this will attempt to force Supabase to refresh its schema cache.
          </p>
          
          {result && (
            <div className={`mt-4 p-4 rounded ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={result.success ? 'text-green-800' : 'text-red-800'}>
                {result.success ? 'Schema cache refreshed successfully!' : `Error: ${result.error}`}
              </p>
              {result.data && (
                <pre className="mt-2 bg-white p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? 'Refreshing...' : 'Refresh Schema Cache'}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-8 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Alternative Solutions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">If refreshing the schema cache doesn't work, try these alternatives:</p>
            
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Restart your Supabase project:</strong> Go to the Supabase dashboard, 
                find your project settings, and restart the project.
              </li>
              <li>
                <strong>Manually insert a record:</strong> Use the Supabase Table Editor to manually 
                insert a record with all the required fields.
              </li>
              <li>
                <strong>Check column names:</strong> Verify that the column names in your code exactly 
                match the column names in the database (case-sensitive).
              </li>
              <li>
                <strong>Restart your Next.js application:</strong> Sometimes a full restart of your 
                development server can help.
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
