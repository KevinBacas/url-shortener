import supabase from "@/utils/supabase/server";
import logger from "@/lib/logger";
import type { ShortLink, LinkClick } from "@/types/database.types";

export interface LinkWithClicks extends ShortLink {
  click_count: number;
  clicks: LinkClick[];
}

/**
 * Fetches all short links with their click statistics from the database
 * Uses optimized single query with nested select to avoid N+1 pattern
 * @returns Array of links with their clicks and click count
 */
export async function getAnalyticsData(): Promise<LinkWithClicks[]> {
  logger.info("Fetching analytics data for all short links");

  // Use nested select to fetch links and clicks in a single query
  // This avoids the N+1 query problem
  const { data, error } = await supabase
    .from("short_links")
    .select(
      `
      *,
      clicks:link_clicks(*)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    logger.error(`Error fetching analytics data: ${error.message}`);
    throw new Error("Failed to fetch analytics data");
  }

  if (!data || data.length === 0) {
    logger.info("No short links found in database");
    return [];
  }

  logger.info(`Found ${data.length} short links with click data`);

  // Transform the data to include click_count
  const linksWithClicks: LinkWithClicks[] = data.map((link) => {
    const clicks = (link.clicks as unknown as LinkClick[]) || [];
    return {
      ...link,
      click_count: clicks.length,
      clicks: clicks,
    };
  });

  logger.info(
    `Successfully prepared analytics data for ${linksWithClicks.length} links`,
  );

  return linksWithClicks;
}
