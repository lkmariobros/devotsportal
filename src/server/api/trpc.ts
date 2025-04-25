import { initTRPC, TRPCError } from '@trpc/server';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import superjson from 'superjson';

// Define context type
export interface Context {
  supabase: ReturnType<typeof createServerSupabaseClient>;
  user: any | null; // Replace 'any' with your user type
}

// Create context for each request
export const createTRPCContext = async (): Promise<Context> => {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  return {
    user,
    supabase,
  };
};

// Initialize tRPC
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

// Export procedures
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;















