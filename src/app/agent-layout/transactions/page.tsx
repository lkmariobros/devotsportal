import { redirect } from 'next/navigation'

export default function TransactionsPage() {
  // Redirect to the agent transactions page
  redirect('/agent-layout/agent/transactions')
}
