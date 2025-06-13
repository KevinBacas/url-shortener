import { createClient } from "@supabase/supabase-js";
import { Database } from "../../../types/database.types";

const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL");
}

const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
if (!supabaseServiceKey) {
  throw new Error("Missing SUPABASE_SERVICE_KEY");
}

// Create a single supabase client for interacting with your database
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// Export the supabase client for use in other parts of the application
export default supabase;
