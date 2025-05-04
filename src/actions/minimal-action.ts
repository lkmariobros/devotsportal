"use server"

/**
 * Minimal server action with no dependencies
 * This is used to test if server actions are working at all
 */
export async function minimalServerAction(data: any) {
  try {
    console.log("Minimal server action received data:", data);

    // Simulate a small delay to mimic processing
    await new Promise(resolve => setTimeout(resolve, 100));

    // Return a simple response
    return {
      success: true,
      message: "Minimal server action executed successfully",
      timestamp: new Date().toISOString(),
      receivedData: data
    };
  } catch (error) {
    console.error("Error in minimal server action:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in minimal server action",
      timestamp: new Date().toISOString()
    };
  }
}
