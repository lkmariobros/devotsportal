"use client"

import { redirect } from 'next/navigation'

export default function AdminDashboardPage() {
  // Redirect to the full-featured admin dashboard
  redirect('/admin-layout/admin-dashboard')
}