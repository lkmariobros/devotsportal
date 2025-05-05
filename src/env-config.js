// Direct environment configuration with hardcoded values for Vercel deployment
const SUPABASE_URL = 'https://drelzxbshewqkaznwhrn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyZWx6eGJzaGV3cWthem53aHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMTg0MjgsImV4cCI6MjA2MDc5NDQyOH0.NfbfbAS4x68A39znICZK4w4G7tIgAA3BxYZkrhnVRTQ';
const IS_VERCEL = typeof process !== 'undefined' && Boolean(process.env.VERCEL);
const IS_PRODUCTION = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
const VERCEL_URL = typeof process !== 'undefined' && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
const NODE_ENV = typeof process !== 'undefined' ? (process.env.NODE_ENV || 'development') : 'development';

// Export as individual constants for direct imports
export { SUPABASE_URL, SUPABASE_ANON_KEY, IS_VERCEL, IS_PRODUCTION, VERCEL_URL, NODE_ENV };

// Also export as an object for backward compatibility
export const ENV = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  IS_VERCEL,
  IS_PRODUCTION,
  VERCEL_URL,
  NODE_ENV
};
