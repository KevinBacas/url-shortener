import { createClient } from "@supabase/supabase-js";
import { Database } from "../../../types/database.types";
import { serverEnv } from "@/lib/env";

/**
 * Admin Supabase client with service key privileges
 * Bypasses Row Level Security - use with extreme caution
 * ONLY use for operations that must bypass RLS, such as:
 * - Tracking clicks from anonymous users
 * - Admin operations that need full database access
 *
 * For user-scoped operations, use server.ts instead
 * NEVER import in client components or browser code
 */
const supabaseAdmin = createClient<Database>(
  serverEnv.supabaseUrl,
  serverEnv.supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export default supabaseAdmin;
