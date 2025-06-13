import { NextRequest } from "next/server";

import supabase from "@/utils/supabase/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Extract the ID from the request parameters
  const id = (await params).id;

  const shortLink = await supabase
    .from("short_links")
    .select("*")
    .eq("slug", id)
    .single();

  if (!shortLink.data) {
    return new Response(JSON.stringify({ error: "Route not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(shortLink.data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
