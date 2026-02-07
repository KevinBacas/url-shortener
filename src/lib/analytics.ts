import type { SupabaseClient } from "@supabase/supabase-js";
import logger from "@/lib/logger";
import type { ShortLink, LinkClick, Database } from "@/types/database.types";

export interface LinkWithClicks extends ShortLink {
  click_count: number;
  clicks: LinkClick[];
}

/**
 * Fetches short links with their click statistics from the database
 * Uses optimized single query with nested select to avoid N+1 pattern
 * With RLS enabled, only returns links belonging to the authenticated user
 * @param supabaseClient - User-scoped Supabase client (respects RLS)
 * @returns Array of links with their clicks and click count
 */
export async function getAnalyticsData(
  supabaseClient: SupabaseClient<Database>,
): Promise<LinkWithClicks[]> {
  logger.info("Fetching analytics data for short links");

  // Use nested select to fetch links and clicks in a single query
  // This avoids the N+1 query problem
  // RLS policies will automatically filter to user's links only
  const { data, error } = await supabaseClient
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
