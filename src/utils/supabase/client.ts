import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../../../types/database.types";
import { clientEnv } from "@/lib/env";

/**
 * Creates a browser-side Supabase client with automatic session management
 * Uses anonymous key and respects Row Level Security based on user session
 * Sessions are automatically stored in browser cookies
 * Safe to use in Client Components and browser code
 */
export function createClient() {
  return createBrowserClient<Database>(
    clientEnv.supabaseUrl,
    clientEnv.supabaseAnonKey,
  );
}
