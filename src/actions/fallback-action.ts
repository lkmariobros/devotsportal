"use server"

import { storeTransactionFromFallback } from '@/utils/transaction-service-new';
import { submitTransactionFixed } from '@/utils/transaction-service-fixed';

/**
 * Fallback server action that doesn't rely on any external services
 * but still stores the transaction data in the database
 */
export async function fallbackSubmitTransaction(data: any) {
  try {
    console.log("[DEBUG] Fallback action received data:", JSON.stringify(data, null, 2));

    // Log the transaction_type_id specifically
    console.log("[DEBUG] transaction_type_id:", data.transaction_type_id,
      "(type: " + typeof data.transaction_type_id + ")",
      "(valid UUID: " + /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.transaction_type_id) + ")");

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Use our fixed transaction service instead of the original one
    // This properly handles UUID fields and other data types
    const result = await submitTransactionFixed(data);

    if (!result.success) {
      console.error("Error storing transaction:", result.error);
      // Even if storage fails, return success for development mode
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          message: "Transaction submitted successfully (fallback action - dev mode)",
          receivedData: {
            market_type: data.market_type,
            transaction_type_id: data.transaction_type_id,
            property_address: data.property_address,
            primary_client_name: data.primary_client_name,
            transaction_value: data.transaction_value
          },
          warning: "Transaction was not stored in the database due to an error: " + result.error
        };
      }

      // In production, return the error
      return {
        success: false,
        error: result.error,
        details: "Failed to store transaction in database"
      };
    }

    // Return success with the transaction ID
    return {
      success: true,
      message: "Transaction submitted successfully",
      transactionId: result.id,
      receivedData: {
        market_type: data.market_type,
        transaction_type_id: data.transaction_type_id,
        property_address: data.property_address,
        primary_client_name: data.primary_client_name,
        transaction_value: data.transaction_value
      }
    };
  } catch (error) {
    console.error("Error in fallback action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in fallback action",
      details: String(error)
    };
  }
}
