import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { insertTestTransaction } from "./actions"

export default function DebugInsertSimplePage() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Debug Insert Transaction (Simple)</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Insert Test Transaction</CardTitle>
          <CardDescription>
            Server-side insertion of a test transaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Click the button below to insert a test transaction.</p>
        </CardContent>
        <CardFooter>
          <form action={insertTestTransaction}>
            <Button type="submit">Insert Test Transaction</Button>
          </form>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Check the agent transactions page:</strong>{' '}
              <a href="/agent-layout/transactions" className="text-blue-600 hover:underline">
                Go to Agent Transactions
              </a>
            </li>
            <li>
              <strong>Check the admin transactions page:</strong>{' '}
              <a href="/admin-dashboard/transactions" className="text-blue-600 hover:underline">
                Go to Admin Transactions
              </a>
            </li>
            <li>
              <strong>Try submitting a transaction through the form:</strong>{' '}
              <a href="/agent-layout/transactions/new" className="text-blue-600 hover:underline">
                Go to Transaction Form
              </a>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
