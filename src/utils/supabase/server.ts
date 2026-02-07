import { createClient } from "@supabase/supabase-js";
import { Database } from "../../../types/database.types";
import { serverEnv } from "@/lib/env";

/**
 * Server-side Supabase client with admin privileges
 * Uses service key and bypasses Row Level Security
 * ONLY use in server-side code (API routes, Server Components, Server Actions)
 * NEVER import in client components or code that runs in the browser
 */
const supabaseServer = createClient<Database>(
  serverEnv.supabaseUrl,
  serverEnv.supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export default supabaseServer;
