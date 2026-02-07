import { NextRequest, NextResponse } from "next/server";
import logger from "@/lib/logger";
import supabase from "@/utils/supabase/client";
import type { Database } from "@/types/database.types";

type ShortLink = Database["public"]["Tables"]["short_links"]["Row"];
type LinkClick = Database["public"]["Tables"]["link_clicks"]["Row"];

interface LinkWithClicks extends ShortLink {
  click_count: number;
  clicks: LinkClick[];
}

/**
 * GET /api/analytics
 * Retrieves all short links with their click statistics
 */
export async function GET(request: NextRequest) {
  try {
    logger.info("Fetching analytics data for all short links");

    // Fetch all short links
    const { data: links, error: linksError } = await supabase
      .from("short_links")
      .select("*")
      .order("created_at", { ascending: false });

    if (linksError) {
      logger.error(`Error fetching short links: ${linksError.message}`);
      return NextResponse.json(
        { error: "Failed to fetch analytics data" },
        { status: 500 },
      );
    }

    if (!links || links.length === 0) {
      logger.info("No short links found in database");
      return NextResponse.json([]);
    }

    logger.info(`Found ${links.length} short links, fetching click data`);

    // Fetch clicks for all links
    const linkIds = links.map((link) => link.id);
    const { data: clicks, error: clicksError } = await supabase
      .from("link_clicks")
      .select("*")
      .in("short_link_id", linkIds)
      .order("clicked_at", { ascending: false });

    if (clicksError) {
      logger.error(`Error fetching link clicks: ${clicksError.message}`);
      return NextResponse.json(
        { error: "Failed to fetch click data" },
        { status: 500 },
      );
    }

    logger.info(`Found ${clicks?.length || 0} total clicks`);

    // Combine links with their clicks
    const linksWithClicks: LinkWithClicks[] = links.map((link) => {
      const linkClicks =
        clicks?.filter((click) => click.short_link_id === link.id) || [];

      return {
        ...link,
        click_count: linkClicks.length,
        clicks: linkClicks,
      };
    });

    logger.info(
      `Successfully prepared analytics data for ${linksWithClicks.length} links`,
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
