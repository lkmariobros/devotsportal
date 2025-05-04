import { TransactionFormClient } from "@/components/agent/transaction-form-client-clean"
import { createServerSupabaseClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function NewTransactionPage() {
  // Mock data for development mode
  let user: { id: string } | null = null;
  let transactionTypes: { id: string; name: string }[] = [];

  // In development mode, use mock data
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: Using mock data for transaction form');
    user = { id: 'mock-user-id' };
    transactionTypes = [
      { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Sale' },
      { id: '223e4567-e89b-12d3-a456-426614174000', name: 'Purchase' },
      { id: '323e4567-e89b-12d3-a456-426614174000', name: 'Rental' }
    ];
  } else {
    // Production mode - use real Supabase
    try {
      const supabase = createServerSupabaseClient()
      const { data: { user: authUser }, error } = await supabase.auth.getUser()

      if (error || !authUser) {
        redirect("/")
      }

      user = authUser;

      // Get transaction types from database
      const { data: dbTransactionTypes } = await supabase
        .from('transaction_types')
        .select('*')

      // Use type assertion to handle the database response
      if (dbTransactionTypes) {
        // Force type assertion to avoid TypeScript errors
        transactionTypes = (dbTransactionTypes as any[]).map(type => ({
          id: String(type.id || ''),
          name: String(type.name || '')
        }));
      }
    } catch (error) {
      console.error('Error fetching data for transaction form:', error);
      // Only redirect in production
      if (process.env.NODE_ENV === 'production') {
        redirect("/error")
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Transaction</h1>
      {/* Use the client-side form component */}
      <TransactionFormClient
        agentId={user?.id || 'mock-user-id'}
        transactionTypes={transactionTypes || []}
      />
    </div>
  )
}