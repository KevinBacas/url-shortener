import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "../../../types/database.types";
import { serverEnv } from "@/lib/env";

/**
 * Creates a user-scoped Supabase client for server-side use
 * Uses anonymous key and respects Row Level Security based on user session
 * Reads session from cookies to enforce user-specific access
 * Use in: API routes, Server Components, Server Actions
 * For admin operations (bypassing RLS), use serverAdmin.ts instead
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    serverEnv.supabaseUrl,
    serverEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
