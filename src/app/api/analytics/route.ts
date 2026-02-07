import { NextResponse } from "next/server";
import logger from "@/lib/logger";
import { getAnalyticsData } from "@/lib/analytics";

/**
 * GET /api/analytics
 * Retrieves all short links with their click statistics
 */
export async function GET() {
  try {
    const linksWithClicks = await getAnalyticsData();
    return NextResponse.json(linksWithClicks);
  } catch (error) {
    logger.error(`Unexpected error in analytics endpoint: ${error}`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
