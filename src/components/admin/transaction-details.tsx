"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface TransactionDetailsProps {
  transaction: any
  onStatusChange?: (transactionId: string, newStatus: string, notes?: string) => Promise<void>
}

export function TransactionDetails({ transaction, onStatusChange }: TransactionDetailsProps) {
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified'
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  // Handle status change
  const handleStatusChange = async (newStatus: 'approved' | 'rejected') => {
    if (!onStatusChange) return
    
    setIsSubmitting(true)
    
    try {
      await onStatusChange(transaction.id, newStatus, notes)
      toast.success(`Transaction ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully`)
      setIsApproveDialogOpen(false)
      setIsRejectDialogOpen(false)
      setNotes("")
    } catch (error) {
      console.error(`Error ${newStatus} transaction:`, error)
      toast.error(`Failed to ${newStatus} transaction`)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Get market type display
  const getMarketTypeDisplay = (type: string) => {
    const marketTypes: Record<string, string> = {
      'primary': 'Primary Market',
      'secondary': 'Secondary Market',
      'rental': 'Rental Market'
    }
    return marketTypes[type] || type
  }
  
  // Get client type display
  const getClientTypeDisplay = (type: string) => {
    const clientTypes: Record<string, string> = {
      'buyer': 'Buyer',
      'seller': 'Seller',
      'landlord': 'Landlord',
      'tenant': 'Tenant'
    }
    return clientTypes[type] || type
  }
  
  return (
    <div className="space-y-6">
      {/* Transaction Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transaction Details</h2>
          <p className="text-muted-foreground">
            {transaction.property_address}, {transaction.property_city}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusBadge(transaction.status)}
          
          {transaction.status === 'pending' && onStatusChange && (
            <>
              <Button 
                variant="outline" 
                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                onClick={() => setIsRejectDialogOpen(true)}
              >
                Reject
              </Button>
              <Button 
                variant="outline"
                className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                onClick={() => setIsApproveDialogOpen(true)}
              >
                Approve
              </Button>
            </>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="parties">Parties</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          {transaction.documents?.length > 0 && (
            <TabsTrigger value="documents">Documents</TabsTrigger>
          )}
        </TabsList>
        
        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Market Type</h3>
                    <p className="text-base">{getMarketTypeDisplay(transaction.market_type)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                    <p className="text-base">{transaction.market_subcategory}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Transaction Type</h3>
                    <p className="text-base">{transaction.transaction_type_id}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Transaction Date</h3>
                    <p className="text-base">{formatDate(transaction.transaction_date)}</p>
                  </div>
                  
                  {transaction.closing_date && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Closing Date</h3>
                      <p className="text-base">{formatDate(transaction.closing_date)}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Property Address</h3>
                    <p className="text-base">{transaction.property_address}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.property_city}, {transaction.property_state} {transaction.property_zip}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Property Type</h3>
                    <p className="text-base">{transaction.property_type}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {transaction.property_bedrooms && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Bedrooms</h3>
                        <p className="text-base">{transaction.property_bedrooms}</p>
                      </div>
                    )}
                    
                    {transaction.property_bathrooms && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Bathrooms</h3>
                        <p className="text-base">{transaction.property_bathrooms}</p>
                      </div>
                    )}
                    
                    {transaction.property_square_feet && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Square Feet</h3>
                        <p className="text-base">{transaction.property_square_feet}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Primary Market Details */}
          {transaction.market_type === 'primary' && (transaction.developer_id || transaction.project_id) && (
            <Card>
              <CardHeader>
                <CardTitle>Developer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {transaction.developer_id && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Developer</h3>
                      <p className="text-base">{transaction.developer_id}</p>
                    </div>
                  )}
                  
                  {transaction.project_id && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Project</h3>
                      <p className="text-base">{transaction.project_id}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Parties Tab */}
        <TabsContent value="parties" className="space-y-4">
          {/* Primary Client */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Client</CardTitle>
              <CardDescription>
                {getClientTypeDisplay(transaction.primary_client_type)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {transaction.primary_is_company ? "Company" : "Client"} Name
                  </h3>
                  <p className="text-base">{transaction.primary_client_name}</p>
                  
                  {transaction.primary_is_company && transaction.primary_company_name && (
                    <p className="text-sm text-muted-foreground">
                      Company: {transaction.primary_company_name}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {transaction.primary_client_email && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                      <p className="text-base">{transaction.primary_client_email}</p>
                    </div>
                  )}
                  
                  {transaction.primary_client_phone && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                      <p className="text-base">{transaction.primary_client_phone}</p>
                    </div>
                  )}
                </div>
                
                {transaction.primary_client_notes && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                    <p className="text-base">{transaction.primary_client_notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Secondary Client */}
          {transaction.include_secondary_party && (
            <Card>
              <CardHeader>
                <CardTitle>Secondary Party</CardTitle>
                <CardDescription>
                  {getClientTypeDisplay(transaction.secondary_client_type)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {transaction.secondary_is_company ? "Company" : "Party"} Name
                    </h3>
                    <p className="text-base">{transaction.secondary_client_name}</p>
                    
                    {transaction.secondary_is_company && transaction.secondary_company_name && (
                      <p className="text-sm text-muted-foreground">
                        Company: {transaction.secondary_company_name}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {transaction.secondary_client_email && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                        <p className="text-base">{transaction.secondary_client_email}</p>
                      </div>
                    )}
                    
                    {transaction.secondary_client_phone && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                        <p className="text-base">{transaction.secondary_client_phone}</p>
                      </div>
                    )}
                  </div>
                  
                  {transaction.secondary_client_notes && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                      <p className="text-base">{transaction.secondary_client_notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Co-Broking Information */}
          {transaction.co_broking_enabled && (
            <Card>
              <CardHeader>
                <CardTitle>Co-Broking Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Co-Agent Name</h3>
                    <p className="text-base">{transaction.co_agent_name}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {transaction.co_agent_email && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                        <p className="text-base">{transaction.co_agent_email}</p>
                      </div>
                    )}
                    
                    {transaction.co_agent_id && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Agent ID</h3>
                        <p className="text-base">{transaction.co_agent_id}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Commission Split</h3>
                    <p className="text-base">{transaction.commission_split}% / {100 - transaction.commission_split}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Commission Tab */}
        <TabsContent value="commission" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Transaction Value</h3>
                    <p className="text-lg font-semibold">{formatCurrency(transaction.transaction_value)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Commission Rate</h3>
                    <p className="text-lg font-semibold">{transaction.commission_rate}%</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Agent Tier</h3>
                    <p className="text-lg font-semibold">{transaction.agent_tier}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Total Commission</h3>
                    <p className="text-lg font-semibold">
                      {formatCurrency(transaction.transaction_value * (transaction.commission_rate / 100))}
                    </p>
                  </div>
                  
                  {transaction.co_broking_enabled ? (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Agent Share</h3>
                      <p className="text-lg font-semibold">
                        {formatCurrency(
                          transaction.transaction_value * 
                          (transaction.commission_rate / 100) * 
                          (transaction.commission_split / 100)
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ({transaction.commission_split}% of total commission)
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Agent Share</h3>
                      <p className="text-lg font-semibold">
                        {formatCurrency(transaction.transaction_value * (transaction.commission_rate / 100))}
                      </p>
                      <p className="text-sm text-muted-foreground">(100% of total commission)</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Documents Tab */}
        {transaction.documents?.length > 0 && (
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>
                  {transaction.documents.length} document(s) uploaded
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {transaction.documents.map((doc: any, index: number) => (
                    <li key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <span>{doc.name}</span>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
      
      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="approve-notes">Notes (Optional)</Label>
              <Textarea
                id="approve-notes"
                placeholder="Add any notes about this approval"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsApproveDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleStatusChange('approved')}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Approving...' : 'Approve Transaction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reject-notes">Reason for Rejection</Label>
              <Textarea
                id="reject-notes"
                placeholder="Provide a reason for rejecting this transaction"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleStatusChange('rejected')}
              disabled={isSubmitting}
              variant="destructive"
            >
              {isSubmitting ? 'Rejecting...' : 'Reject Transaction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
