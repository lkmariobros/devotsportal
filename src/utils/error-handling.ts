import { TRPCError } from '@trpc/server';

/**
 * Error context information
 */
export interface ErrorContext {
  component: string;
  userId?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  metadata?: Record<string, any>;
}

/**
 * Error metrics for tracking error rates
 */
class ErrorMetrics {
  private errorCounts: Record<string, number> = {};
  private errorTimestamps: Record<string, number[]> = {};
  private readonly windowSize = 60 * 1000; // 1 minute window

  /**
   * Increment error count for a component
   */
  increment(component: string): void {
    // Initialize if not exists
    if (!this.errorCounts[component]) {
      this.errorCounts[component] = 0;
      this.errorTimestamps[component] = [];
    }

    // Increment count
    this.errorCounts[component]++;
    
    // Add timestamp
    const now = Date.now();
    this.errorTimestamps[component].push(now);
    
    // Clean up old timestamps
    this.cleanupOldTimestamps(component, now);
  }

  /**
   * Get error rate for a component (errors per minute)
   */
  getRate(component: string): number {
    if (!this.errorTimestamps[component]) {
      return 0;
    }

    const now = Date.now();
    this.cleanupOldTimestamps(component, now);
    
    return this.errorTimestamps[component].length;
  }

  /**
   * Clean up timestamps older than the window size
   */
  private cleanupOldTimestamps(component: string, now: number): void {
    const cutoff = now - this.windowSize;
    this.errorTimestamps[component] = this.errorTimestamps[component].filter(
      timestamp => timestamp >= cutoff
    );
  }
}

// Singleton instance of error metrics
export const errorMetrics = new ErrorMetrics();

// Error thresholds for different components
const ERROR_THRESHOLDS: Record<string, number> = {
  'transaction-approval': 5, // 5 errors per minute
  'transaction-rejection': 5,
  'batch-approval': 10,
  default: 10
};

/**
 * Get error threshold for a component
 */
export function getErrorThreshold(component: string): number {
  return ERROR_THRESHOLDS[component] || ERROR_THRESHOLDS.default;
}

/**
 * Log error to console and monitoring system
 */
export async function logError(error: Error, context: ErrorContext): Promise<void> {
  // Log to console for development
  console.error(`Error in ${context.component}: ${error.message}`, error);
  
  // Track error rates
  errorMetrics.increment(context.component);
  
  // In production, we would send to a monitoring service
  if (process.env.NODE_ENV === 'production') {
    try {
      // This would be replaced with actual monitoring service integration
      console.log('Would send to monitoring service:', {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
      });
      
      // Check if error rate exceeds threshold
      const errorRate = errorMetrics.getRate(context.component);
      const threshold = getErrorThreshold(context.component);
      
      if (errorRate > threshold) {
        // This would trigger an alert in production
        console.warn(`Error rate exceeded threshold in ${context.component}: ${errorRate} errors/minute`);
      }
    } catch (loggingError) {
      // Don't let logging errors affect the main flow
      console.error('Error while logging error:', loggingError);
    }
  }
}

/**
 * Execute an operation with consistent error handling
 */
export async function executeWithErrorHandling<T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  recovery?: () => Promise<void>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // Log the error
    await logError(error as Error, context);
    
    // Attempt recovery if provided
    if (recovery) {
      try {
        await recovery();
      } catch (recoveryError) {
        await logError(recoveryError as Error, {
          ...context,
          component: `${context.component}-recovery`,
        });
      }
    }
    
    // Rethrow as TRPC error if it's not already one
    if (error instanceof TRPCError) {
      throw error;
    }
    
    // Determine appropriate error code based on the error
    let code: TRPCError['code'] = 'INTERNAL_SERVER_ERROR';
    if ((error as Error).message.includes('not found')) {
      code = 'NOT_FOUND';
    } else if ((error as Error).message.includes('permission') || 
               (error as Error).message.includes('forbidden')) {
      code = 'FORBIDDEN';
    } else if ((error as Error).message.includes('version mismatch')) {
      code = 'CONFLICT';
    }
    
    // Rethrow with context
    throw new TRPCError({
      code,
      message: `${context.component}: ${(error as Error).message}`,
      cause: error,
    });
  }
}

/**
 * Mark a transaction for review (recovery action)
 */
export async function markTransactionForReview(
  supabase: any,
  transactionId: string,
  error: Error
): Promise<void> {
  try {
    // Add a note to the transaction
    await supabase
      .from('transaction_notes')
      .insert({
        transaction_id: transactionId,
        content: `System flagged for review: ${error.message}`,
        created_by: 'system',
      });
    
    // We could also update a flag on the transaction itself
    // or create a special review queue
  } catch (noteError) {
    console.error('Failed to mark transaction for review:', noteError);
  }
}
