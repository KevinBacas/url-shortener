import { NextRequest } from "next/server";

import supabase from "@/utils/supabase/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Extract the ID from the request parameters
  const id = (await params).id;

  // Fetch the short link data from the database using the slug
  const { error, data } = await supabase
    .from("short_links")
    .select("*")
    .eq("slug", id)
    .single();

  // Handle errors or if no data is found
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // If no data is found, return a 404 response
  if (!data || !data.target_url) {
    return new Response(JSON.stringify({ error: "Route not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Redirect to the target URL
  if (data.target_url) {
    return Response.redirect(data.target_url, 302);
  }
}
