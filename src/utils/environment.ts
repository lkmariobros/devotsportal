// Environment utility functions

/**
 * Check if debug features should be enabled
 * Debug features are enabled in development or when explicitly allowed
 */
export const isDebugEnabled = () => {
  // Enable debug features in development or when explicitly allowed
  return process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true'
}

/**
 * Check if the application is running on Vercel
 */
export const isVercel = () => {
  return Boolean(process.env.VERCEL)
}

/**
 * Get the base URL for the application
 * Uses Vercel URL in production, localhost in development
 */
export const getBaseUrl = () => {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
}

/**
 * Get the environment name
 */
export const getEnvironmentName = () => {
  if (Boolean(process.env.VERCEL)) {
    return process.env.NODE_ENV === 'production' ? 'production' : 'preview'
  }
  return 'development'
}
