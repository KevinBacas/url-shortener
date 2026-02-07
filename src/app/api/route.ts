import { NextRequest } from "next/server";
import { customAlphabet } from "nanoid";
import { createClient } from "@/utils/supabase/server";
import logger from "@/lib/logger";
import { nanoidConfig } from "@/lib/env";

const MAX_SLUG_GENERATION_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  // Create user-scoped Supabase client
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    logger.warn("Unauthorized attempt to create short link");
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  logger.info(`User ${user.id} attempting to create short link`);

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

  // Validate URL format
  try {
    new URL(url);
  } catch (err) {
    logger.warn(`Invalid URL format: ${url}`);
    return new Response(
      JSON.stringify({
        error:
          "Invalid URL format. Must be a valid URL with protocol (http:// or https://)",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Initialize nanoid with configuration
  const nanoid = customAlphabet(nanoidConfig.alphabet, nanoidConfig.length);

  // Generate unique slug with collision handling
  let slug: string | null = null;
  let attempts = 0;

  while (!slug && attempts < MAX_SLUG_GENERATION_ATTEMPTS) {
    attempts++;
    const candidateSlug = nanoid();
    logger.info(
      `Generated slug candidate (attempt ${attempts}): ${candidateSlug}`,
    );

    // Check if slug already exists
    const { data: existing, error: checkError } = await supabase
      .from("short_links")
      .select("slug")
      .eq("slug", candidateSlug)
      .maybeSingle();

    if (checkError) {
      logger.error(`Database check error: ${checkError.message}`);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!existing) {
      // Slug is unique
      slug = candidateSlug;
      logger.info(`Unique slug found: ${slug} for URL: ${url}`);
    } else {
      logger.warn(`Slug collision detected: ${candidateSlug}, retrying...`);
    }
  }

  if (!slug) {
    logger.error(
      `Failed to generate unique slug after ${MAX_SLUG_GENERATION_ATTEMPTS} attempts`,
    );
    return new Response(
      JSON.stringify({
        error: "Failed to generate unique short URL. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

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
