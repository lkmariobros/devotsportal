"use client";

// Export all required functions
export const createClient = () => createMockClient();
export const createClientComponentClient = () => createMockClient();
export const createServerComponentClient = () => createMockClient();
export const createRouteHandlerClient = () => createMockClient();

// Helper function to create a consistent mock client
function createMockClient() {
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
    rpc: () => ({ data: {}, error: null }),
    storage: {
      from: () => ({
        upload: async () => ({ data: { path: 'mock-path' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://mock-url.com/image.jpg' } }),
      }),
    },
  };
};

// Default export for compatibility
export default { createClient, createClientComponentClient, createServerComponentClient, createRouteHandlerClient };