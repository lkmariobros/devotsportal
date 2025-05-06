"use client";

// Mock Supabase client for build-time
export const createClientComponentClient = () => {
  // Determine if we should mock an admin user
  const isAdmin = process.env.MOCK_ADMIN_USER === 'true';
  const mockEmail = isAdmin ? 'admin@example.com' : 'agent@example.com';
  const mockRole = isAdmin ? 'admin' : 'agent';

  return {
    auth: {
      getSession: async () => ({
        data: {
          session: {
            user: {
              id: 'mock-user-id',
              email: mockEmail,
              role: mockRole
            }
          }
        },
        error: null
      }),
      getUser: async () => ({
        data: {
          user: {
            id: 'mock-user-id',
            email: mockEmail,
            role: mockRole
          }
        },
        error: null
      }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async (credentials) => {
        // Check if the email is an admin email
        const adminEmails = ['elson@devots.com.my', 'josephkwantum@gmail.com'];
        const isAdmin = adminEmails.includes(credentials?.email?.toLowerCase() || '');
        const mockEmail = credentials?.email || 'mock@example.com';
        const mockRole = isAdmin ? 'admin' : 'agent';

        return {
          data: {
            user: {
              id: 'mock-user-id',
              email: mockEmail,
              role: mockRole
            }
          },
          error: null
        };
      },
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