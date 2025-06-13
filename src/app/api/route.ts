import { NextRequest } from "next/server";
import { customAlphabet } from "nanoid";

import supabase from "@/utils/supabase/client";

export async function POST(request: NextRequest) {
  // Extract URL from the request body
  const { url } = await request.json();
  if (!url) {
    return new Response(JSON.stringify({ error: "URL is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Generate a slug
  const nanoid = customAlphabet(
    process.env.CUSTOM_NANOID_ALPHABET ||
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    parseInt(process.env.CUSTOM_NANOID_LENGTH ?? "6")
  );
  const slug = nanoid();

  // Insert the new short link into the database
  const { data, error } = await supabase
    .from("short_links")
    .insert([
      {
        slug,
        target_url: url,
        user_id: "796558e1-cb5d-41ae-b845-dbe48fb247ec",
      },
    ])
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Return the created short link
  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
