import { NextRequest } from "next/server";
import { customAlphabet } from "nanoid";
import supabase from "@/utils/supabase/client";
import logger from "@/lib/logger";

export async function POST(request: NextRequest) {
  // Extract URL from the request body
  let url: string | undefined;
  try {
    const body = await request.json();
    url = body.url;
    logger.info(`Received POST request to shorten URL: ${url}`);
  } catch (err) {
    logger.error(`Failed to parse request body: ${err}`);
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!url) {
    logger.warn("URL is required but not provided in request body.");
    return new Response(JSON.stringify({ error: "URL is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Generate a slug
  const nanoid = customAlphabet(
    process.env.CUSTOM_NANOID_ALPHABET ||
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    parseInt(process.env.CUSTOM_NANOID_LENGTH ?? "6"),
  );
  const slug = nanoid();
  logger.info(`Generated slug: ${slug} for URL: ${url}`);

  // Insert the new short link into the database
  const { data, error } = await supabase
    .from("short_links")
    .insert([
      {
        slug,
        target_url: url,
        user_id: "e031657d-ac7c-434d-b61c-22e92359b13c",
      },
    ])
    .select()
    .single();

  if (error) {
    logger.error(`Database insert error: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Return the created short link
  const shortUrl = `${new URL(request.url).origin}/api/${slug}`;
  logger.info(`Short link created: ${shortUrl} for URL: ${url}`);
  return new Response(
    JSON.stringify(
      Object.assign({}, data, {
        shortUrl,
      }),
    ),
    {
      status: 201,
      headers: { "Content-Type": "application/json" },
    },
  );
}
