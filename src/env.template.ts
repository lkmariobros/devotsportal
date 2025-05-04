/**
 * Environment configuration template
 * Copy this file to env.ts and fill in your values for local development
 * DO NOT commit env.ts to git - it should remain in .gitignore
 */

export const ENV = {
  // Supabase configuration - use environment variables with fallbacks for development
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key',
  
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development'
}
