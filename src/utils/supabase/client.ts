import { createClient } from "@supabase/supabase-js";
import { Database } from "../../../types/database.types";
import { clientEnv } from "@/lib/env";

/**
 * Client-side Supabase client for browser use
 * Uses anonymous key and respects Row Level Security policies
 * Safe to use in client components and browser code
 */
const supabase = createClient<Database>(
  clientEnv.supabaseUrl,
  clientEnv.supabaseAnonKey,
);

export default supabase;
