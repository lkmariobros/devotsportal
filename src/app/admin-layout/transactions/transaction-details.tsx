"use client"

import { useState } from "react"
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trpc } from "@/utils/trpc/client"
import { formatCurrency, formatDate } from "@/lib/utils"
import { FileIcon, ImageIcon, PaperclipIcon } from "lucide-react"

interface TransactionDetailsProps {
  transactionId: string
}

export function TransactionDetails({ transactionId }: TransactionDetailsProps) {
  const [activeTab, setActiveTab] = useState("details")
  
  // Change from getById to getTransactionById to match the server router
const { data, isLoading } = trpc.transactions.getTransactionById.useQuery({ id: transactionId })
  
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        Loading transaction details...
      </div>
    )
  }
  
  if (!data) {
    return (
      <div className="p-6 text-center">
        Transaction details not found
      </div>
    )
  }
  
  return (
    <div className="bg-muted/30 p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="details">Transaction Details</TabsTrigger>
          <TabsTrigger value="documents">Documents ({data.documents?.length || 0})</TabsTrigger>
          <TabsTrigger value="history">History ({data.history?.length || 0})</TabsTrigger>
          <TabsTrigger value="commission">Commission Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Property Details</h3>
              <div className="rounded-md bg-background p-4">
                <div className="mb-2 text-lg font-semibold">{data.property.address}</div>
                <div className="text-sm text-muted-foreground">
                  {data.property.type} • {data.property.bedrooms} beds • {data.property.bathrooms} baths
                </div>
                <div className="mt-2 text-sm">
                  <span className="font-medium">Listed Price:</span> {formatCurrency(data.property.price)}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Transaction Information</h3>
              <div className="rounded-md bg-background p-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Transaction Type</div>
                    <div className="font-medium">{data.type}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Transaction Date</div>
                    <div className="font-medium">{formatDate(data.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Transaction Amount</div>
                    <div className="font-medium">{formatCurrency(data.amount)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="font-medium">{data.status}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Parties Involved</h3>
            <div className="rounded-md bg-background p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs text-muted-foreground">Primary Agent</div>
                  <div className="font-medium">{data.agent.name}</div>
                  <div className="text-sm text-muted-foreground">{data.agent.email}</div>
                </div>
                {data.coAgent && (
                  <div>
                    <div className="text-xs text-muted-foreground">Co-Agent</div>
                    <div className="font-medium">{data.coAgent.name}</div>
                    <div className="text-sm text-muted-foreground">{data.coAgent.email}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-muted-foreground">Client</div>
                  <div className="font-medium">{data.client.name}</div>
                  <div className="text-sm text-muted-foreground">{data.client.email}</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="documents">
          <div className="space-y-4">
            {data.documents && data.documents.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {data.documents.map((doc) => (
                  <div key={doc.id} className="flex items-start space-x-3 rounded-md border p-3">
                    <div className="rounded-md bg-primary/10 p-2">
                      {doc.type === 'image' ? (
                        <ImageIcon className="h-5 w-5 text-primary" />
                      ) : (
                        <FileIcon className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(doc.uploadedAt)} • {doc.size}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md bg-background p-6 text-center">
                <PaperclipIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">No documents</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  There are no documents attached to this transaction.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <div className="space-y-4">
            {data.history && data.history.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {data.history.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center justify-between w-full">
                        <span>{item.action}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(item.timestamp)}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">User:</span> {item.user}
                        </div>
                        {item.notes && (
                          <div>
                            <span className="font-medium">Notes:</span> {item.notes}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="rounded-md bg-background p-6 text-center">
                <h3 className="text-sm font-medium">No history</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  There is no history for this transaction yet.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="commission">
          <div className="space-y-4">
            <div className="rounded-md bg-background p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium">Commission Details</h3>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Total Commission:</div>
                    <div className="font-medium">{formatCurrency(data.commission?.total || 0)}</div>
                    
                    <div className="text-muted-foreground">Commission Rate:</div>
                    <div className="font-medium">{data.commission?.rate || 0}%</div>
                    
                    <div className="text-muted-foreground">Agent Share:</div>
                    <div className="font-medium">{formatCurrency(data.commission?.agentShare || 0)}</div>
                    
                    <div className="text-muted-foreground">Brokerage Share:</div>
                    <div className="font-medium">{formatCurrency(data.commission?.brokerageShare || 0)}</div>
                  </div>
                </div>
                
                {data.commission?.split && data.coAgent && (
                  <div>
                    <h3 className="text-sm font-medium">Commission Split</h3>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Primary Agent:</div>
                      <div className="font-medium">
                        {data.commission.primaryAgentPercentage || 0}% 
                        ({formatCurrency(data.commission.primaryAgentAmount || 0)})
                      </div>
                      
                      <div className="text-muted-foreground">Co-Agent:</div>
                      <div className="font-medium">
                        {data.commission.coAgentPercentage || 0}% 
                        ({formatCurrency(data.commission.coAgentAmount || 0)})
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {data.commission?.paymentSchedule && (
              <div>
                <h3 className="text-sm font-medium mb-2">Payment Schedule</h3>
                <div className="rounded-md bg-background p-4">
                  <div className="space-y-3">
                    {data.commission.paymentSchedule.map((payment: any) => (
                      <div key={payment.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                        <div>
                          <div className="font-medium">{payment.description}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(payment.dueDate)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(payment.amount)}</div>
                          <div className="text-xs text-muted-foreground">{payment.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}