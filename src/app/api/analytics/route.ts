import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import logger from "@/lib/logger";
import { getAnalyticsData } from "@/lib/analytics";

/**
 * GET /api/analytics
 * Retrieves authenticated user's short links with their click statistics
 */
export async function GET() {
  try {
    // Create user-scoped Supabase client
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn("Unauthorized attempt to access analytics");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    logger.info(`User ${user.id} requesting analytics data`);

    // Fetch analytics data - RLS will filter to user's links only
    const linksWithClicks = await getAnalyticsData(supabase);

    logger.info(
      `Returning ${linksWithClicks.length} links for user ${user.id}`,
    );
    return NextResponse.json(linksWithClicks);
  } catch (error) {
    logger.error(`Unexpected error in analytics endpoint: ${error}`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
