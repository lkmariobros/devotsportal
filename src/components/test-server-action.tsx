"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { testServerAction } from "@/actions/test-action"
import { toast } from "sonner"

export function TestServerAction() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  const handleTestAction = async () => {
    setIsLoading(true)
    try {
      // Test data
      const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        value: Math.random()
      }
      
      console.log("Sending test data:", testData)
      
      // Call the test server action
      const response = await testServerAction(testData)
      
      console.log("Test server action response:", response)
      setResult(response)
      
      if (response.success) {
        toast.success("Server action successful!")
      } else {
        toast.error(response.error || "Server action failed")
      }
    } catch (error) {
      console.error("Error testing server action:", error)
      toast.error("Error testing server action")
      setResult({ error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Test Server Action</CardTitle>
        <CardDescription>
          Test if server actions are working correctly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Click the button below to test a simple server action. This will help diagnose if there are issues with server actions in general.
        </p>
        
        {result && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h3 className="font-medium mb-2">Result:</h3>
            <pre className="text-xs overflow-auto p-2 bg-background rounded border">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleTestAction} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Testing..." : "Test Server Action"}
        </Button>
      </CardFooter>
    </Card>
  )
}
