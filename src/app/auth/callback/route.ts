import { createClient } from "@/utils/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import logger from "@/lib/logger";

/**
 * Auth callback route handler
 * Handles the callback from Supabase auth (magic link email clicks)
 * Exchanges the auth code for a user session
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") ?? "/";

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      logger.error(`Auth callback error: ${error.message}`);
      // Redirect to login page with error
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    logger.info("User successfully authenticated via magic link");

    // URL to redirect to after sign in process completes
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${redirectTo}`);
    } else {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  logger.warn("Auth callback called without code parameter");
  // No code present, redirect to home
  return NextResponse.redirect(`${origin}/`);
}
