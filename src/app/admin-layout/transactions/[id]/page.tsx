import { notFound } from "next/navigation"
import { createServerSupabaseClient as createClient } from "@/utils/supabase/server"
import { TransactionDetails } from "@/components/transactions/transaction-details"
import { TransactionActions } from "@/components/transactions/transaction-actions"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default async function TransactionPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  
  const { data: transaction, error } = await supabase
    .from("property_transactions")
    .select(`
      *,
      transaction_types(id, name),
      properties(*),
      profiles!agent_id(id, first_name, last_name, email),
      profiles!co_agent_id(id, first_name, last_name, email),
      commission_payment_schedules(*),
      transaction_documents(*)
    `)
    .eq("id", params.id)
    .single()
  
  if (error || !transaction) {
    notFound()
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Transaction Details
        </h1>
      </div>
      
      <Card className="p-6">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <TransactionDetails transaction={transaction} />
              </div>
              
              <div className="space-y-6">
                <TransactionActions transaction={transaction} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="documents">
            <div className="py-4">
              <h3 className="text-lg font-medium">Transaction Documents</h3>
              <Separator className="my-4" />
              {transaction.transaction_documents?.length > 0 ? (
                <div className="space-y-4">
                  {transaction.transaction_documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">{doc.document_type}</p>
                      </div>
                      <a 
                        href={doc.file_path} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No documents available</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="py-4">
              <h3 className="text-lg font-medium">Transaction History</h3>
              <Separator className="my-4" />
              <p className="text-muted-foreground">Transaction history will be displayed here</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}