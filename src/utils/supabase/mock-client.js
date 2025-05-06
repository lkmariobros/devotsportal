"use client";

// Mock Supabase client for build-time
export const createClientComponentClient = () => {
  return {
    auth: {
      getSession: async () => ({
        data: {
          session: {
            user: {
              id: 'mock-user-id',
              email: 'mock@example.com',
              role: 'authenticated'
            }
          }
        },
        error: null
      }),
      getUser: async () => ({
        data: {
          user: {
            id: 'mock-user-id',
            email: 'mock@example.com',
            role: 'authenticated'
          }
        },
        error: null
      }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({
        data: {
          user: {
            id: 'mock-user-id',
            email: 'mock@example.com',
            role: 'authenticated'
          }
        },
        error: null
      }),
      onAuthStateChange: () => ({ data: {}, error: null, unsubscribe: () => {} })
    },
    from: (table) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: {}, error: null }),
          maybeSingle: async () => ({ data: {}, error: null }),
          order: () => ({
            limit: () => ({
              data: [],
              error: null
            })
          }),
          data: [],
          error: null
        }),
        order: () => ({
          limit: () => ({
            data: [],
            error: null
          })
        }),
        data: [],
        error: null
      }),
      insert: () => ({ data: {}, error: null }),
      update: () => ({ data: {}, error: null }),
      delete: () => ({ data: {}, error: null })
    }),
    rpc: () => ({ data: {}, error: null })
  };
};

// Mock for server component client
export const createServerComponentClient = () => createClientComponentClient();

// Default export for compatibility
export default { createClientComponentClient, createServerComponentClient };