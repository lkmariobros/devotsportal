"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  
  useEffect(() => {
    // Check if this is a redirect error from authentication
    if (error.digest?.includes("NEXT_REDIRECT")) {
      // Let the middleware handle it
      return;
    }
    
    // For other errors, redirect to login after a delay
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [error, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="mb-4">Redirecting you to the login page...</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}
