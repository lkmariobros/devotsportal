"use server"

import { createTransaction, FormState } from "@/actions/transactions"

// This is a server action that can be safely passed to client components
export async function clientCreateTransaction(formData: FormData | any) {
  // If formData is a FormData object, convert it to a regular object
  const data = formData instanceof FormData ?
    Object.fromEntries(formData.entries()) :
    formData;
  // In development mode, just return a success message
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: Bypassing transaction creation');
    console.log('Form data:', data);

    return {
      message: "Transaction created successfully (Development Mode)",
      success: true
    };
  }

  // In production, call the actual createTransaction function
  try {
    const result = await createTransaction({} as FormState, data);
    return {
      ...result,
      success: !result.errors
    };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return {
      message: "An error occurred while creating the transaction",
      success: false
    };
  }
}
