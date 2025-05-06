import { redirect } from 'next/navigation'

export default function AgentLayoutPage() {
  // Redirect to the correct agent dashboard path
  redirect('/agent-layout/agent/dashboard')
}
