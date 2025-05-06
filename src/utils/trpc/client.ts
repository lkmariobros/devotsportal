"use client";

import { QueryClient } from '@tanstack/react-query';

// Create a more comprehensive mock TRPC client with all required functionality
const createTRPCNext = () => {
  return {
    createClient: () => ({}),
    Provider: ({ children }: { children: React.ReactNode }) => children,
  };
};

const createTRPCReact = () => {
  return {
    createClient: () => ({}),
    Provider: ({ children }: { children: React.ReactNode }) => children,
  };
};

// Mock query hook factory
const createQueryHook = (defaultData: any) => {
  return () => ({
    data: defaultData,
    isLoading: false,
    error: null,
    refetch: async () => ({ data: defaultData }),
    isRefetching: false,
    isFetching: false,
  });
};

// Create a proxy to handle any method calls
const createProxy = () => {
  const handler = {
    get: function(target: any, prop: string) {
      if (prop === 'useQuery') {
        return () => ({
          data: {},
          isLoading: false,
          error: null,
        });
      }

      if (prop === 'useMutation') {
        return () => [() => {}, { isLoading: false, error: null }];
      }

      return new Proxy({}, handler);
    },
    apply: function() {
      return new Proxy({}, handler);
    }
  };

  return new Proxy({}, handler);
};

// Export the trpc object with all required methods and properties
export const trpc = {
  // Core TRPC functionality
  createClient: () => ({}),
  Provider: ({ children }: { children: React.ReactNode }) => children,
  useContext: () => ({}),
  useUtils: () => ({
    client: {},
    invalidate: async () => {},
  }),

  // Specific procedures with mock data
  users: {
    getRecentAgentActivity: {
      useQuery: createQueryHook({ activities: [] })
    }
  },

  commissions: {
    getCommissionDetails: {
      useQuery: createQueryHook({
        transactions: [],
        chartData: []
      })
    }
  },

  // Proxy to handle any other procedure calls
  ...createProxy()
};
