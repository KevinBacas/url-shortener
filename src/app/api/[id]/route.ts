import { NextRequest } from "next/server";
import supabase from "@/utils/supabase/client";
import logger from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Extract the ID from the request parameters
  const id = (await params).id;
  logger.info(`Received GET request for short link ID: ${id}`);

  // Fetch the short link data from the database using the slug
  const { error, data } = await supabase
    .from("short_links")
    .select("*")
    .eq("slug", id)
    .single();
  if (error) {
    logger.error(`Database error for ID ${id}: ${error.message}`);
  }

  // Handle errors or if no data is found
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // If no data is found, return a 404 response
  if (!data || !data.target_url) {
    logger.warn(`Short link not found for ID: ${id}`);
    return new Response(JSON.stringify({ error: "Route not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Track the click
  const userAgent = request.headers.get("user-agent");
  const referrer = request.headers.get("referer");

  logger.info(`Tracking click for short link ID: ${data.id}`);
  const { error: clickError } = await supabase.from("link_clicks").insert([
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
  if (data.target_url) {
    logger.info(`Redirecting ID ${id} to target URL: ${data.target_url}`);
    return Response.redirect(data.target_url, 302);
  }
}
