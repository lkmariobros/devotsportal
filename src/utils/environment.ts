import { ENV } from '../env.js'

/**
 * Check if debug features should be enabled
 * Debug features are enabled in development or when explicitly allowed
 */
export const isDebugEnabled = () => {
  // Enable debug features in development or when explicitly allowed
  return !ENV.IS_PRODUCTION || process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true'
}

/**
 * Check if the application is running on Vercel
 */
export const isVercel = () => {
  return ENV.IS_VERCEL
}

/**
 * Get the base URL for the application
 * Uses Vercel URL in production, localhost in development
 */
export const getBaseUrl = () => {
  return ENV.VERCEL_URL
}

/**
 * Get the environment name
 */
export const getEnvironmentName = () => {
  if (ENV.IS_VERCEL) {
    return ENV.IS_PRODUCTION ? 'production' : 'preview'
  }
  return 'development'
}
