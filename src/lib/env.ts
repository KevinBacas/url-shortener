/**
 * Centralized environment variable validation
 * This file validates all required environment variables at module load time
 * and provides typed access throughout the application
 */

interface ServerEnv {
  supabaseUrl: string;
  supabaseServiceKey: string;
}

interface ClientEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

interface NanoidConfig {
  alphabet: string;
  length: number;
}

// Check if we're in build time
const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";

// Provide dummy values during build to allow compilation
const buildTimeFallback = "http://localhost:54321";
const buildTimeKey = "dummy-key-for-build";

/**
 * Server-side environment variables
 * Only accessible in API routes, Server Components, and Server Actions
 */
export const serverEnv: ServerEnv = {
  supabaseUrl:
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (isBuildTime ? buildTimeFallback : ""),
  supabaseServiceKey:
    process.env.SUPABASE_SERVICE_KEY || (isBuildTime ? buildTimeKey : ""),
};

/**
 * Client-side environment variables
 * Accessible in both client and server code
 */
export const clientEnv: ClientEnv = {
  supabaseUrl:
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (isBuildTime ? buildTimeFallback : ""),
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (isBuildTime ? buildTimeKey : ""),
};

/**
 * Nanoid configuration for slug generation
 */
export const nanoidConfig: NanoidConfig = {
  alphabet:
    process.env.CUSTOM_NANOID_ALPHABET ||
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  length: parseInt(process.env.CUSTOM_NANOID_LENGTH || "6", 10),
};

/**
 * Validates server environment variables
 * Throws an error if any required variables are missing
 */
function validateServerEnv(): void {
  const missing: string[] = [];

  if (!serverEnv.supabaseUrl) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!serverEnv.supabaseServiceKey) {
    missing.push("SUPABASE_SERVICE_KEY");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required server environment variables: ${missing.join(", ")}`,
    );
  }
}

/**
 * Validates client environment variables
 * Throws an error if any required variables are missing
 */
function validateClientEnv(): void {
  const missing: string[] = [];

  if (!clientEnv.supabaseUrl) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!clientEnv.supabaseAnonKey) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required client environment variables: ${missing.join(", ")}`,
    );
  }
}

/**
 * Validates nanoid configuration
 */
function validateNanoidConfig(): void {
  if (nanoidConfig.length < 1 || nanoidConfig.length > 255) {
    throw new Error("CUSTOM_NANOID_LENGTH must be between 1 and 255");
  }
  if (nanoidConfig.alphabet.length < 2) {
    throw new Error("CUSTOM_NANOID_ALPHABET must have at least 2 characters");
  }
}

// Run validation based on environment
// Skip validation during build time to allow builds without all env vars present
if (typeof window === "undefined" && !isBuildTime) {
  // Server-side runtime: validate all server variables
  validateServerEnv();
  validateNanoidConfig();
} else if (typeof window !== "undefined") {
  // Client-side: validate only public client variables
  validateClientEnv();
}

export { validateServerEnv, validateClientEnv, validateNanoidConfig };
