import { NextRequest } from "next/server";
import supabaseAdmin from "@/utils/supabase/serverAdmin";
import logger from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  // Extract the ID from the request parameters
  const id = (await params).id;
  logger.info(`Received GET request for short link ID: ${id}`);

  // Fetch the short link data from the database using the slug
  // Use admin client to bypass RLS since redirects are public
  const { error, data } = await supabaseAdmin
    .from("short_links")
    .select("*")
    .eq("slug", id)
    .maybeSingle();

  // Handle database errors
  if (error) {
    logger.error(`Database error for ID ${id}: ${error.message}`);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // If no data is found, return a 404 response
  if (!data || !data.target_url) {
    logger.warn(`Short link not found for ID: ${id}`);
    return new Response(JSON.stringify({ error: "Short link not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Track the click
  const userAgent = request.headers.get("user-agent");
  const referrer = request.headers.get("referer");

  logger.info(`Tracking click for short link ID: ${data.id}`);
  // Use admin client for click tracking since it's anonymous
  const { error: clickError } = await supabaseAdmin.from("link_clicks").insert([
    {
      short_link_id: data.id,
      user_agent: userAgent,
      referrer: referrer,
      clicked_at: new Date().toISOString(),
    },
  ]);

  if (clickError) {
    logger.error(`Failed to track click for ID ${id}: ${clickError.message}`);
  } else {
    logger.info(`Click tracked successfully for ID ${id}`);
  }

  // Redirect to the target URL
  logger.info(`Redirecting ID ${id} to target URL: ${data.target_url}`);
  return Response.redirect(data.target_url, 302);
}
