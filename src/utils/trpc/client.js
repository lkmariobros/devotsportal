"use client";

// Create a proxy-based mock that can handle any property access
const createTRPCProxy = () => {
  const handler = {
    get: (target, prop) => {
      // Handle common tRPC methods
      if (prop === 'createClient' || prop === 'Provider') {
        return function mockFn() {
          return arguments[0]?.children || {};
        };
      }

      // Handle query methods
      if (prop === 'useQuery') {
        return () => ({
          data: {},
          isLoading: false,
          error: null,
          refetch: async () => ({})
        });
      }

      // Handle mutation methods
      if (prop === 'useMutation') {
        return () => [() => {}, { isLoading: false }];
      }

      // Return a new proxy for nested properties
      return new Proxy({}, handler);
    },
    apply: () => new Proxy({}, handler)
  };

  return new Proxy({}, handler);
};

// Export the trpc object with the proxy
export const trpc = createTRPCProxy();