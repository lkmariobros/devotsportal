import { redirect } from 'next/navigation'

export default function NewTransactionPage() {
  // Redirect to the agent new transaction page
  redirect('/agent-layout/agent/transactions/new')
}
