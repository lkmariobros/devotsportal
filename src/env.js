/**
 * Direct environment configuration
 * This file provides direct access to environment variables
 * with fallbacks for development mode
 */

export const ENV = {
  // Supabase configuration with Vercel-aware fallbacks
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://drelzxbshewqkaznwhrn.supabase.co',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyZWx6eGJzaGV3cWthem53aHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMTg0MjgsImV4cCI6MjA2MDc5NDQyOH0.NfbfbAS4x68A39znICZK4w4G7tIgAA3BxYZkrhnVRTQ',

  // Environment detection
  IS_VERCEL: Boolean(process.env.VERCEL),
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  VERCEL_URL: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',

  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development'
}
