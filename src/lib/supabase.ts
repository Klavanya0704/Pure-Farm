import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = (import.meta.env["VITE_SUPABASE_URL"] as string) || "";
const supabaseAnonKey = (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string) || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "https://your-project-id.supabase.co" &&
  supabaseAnonKey !== "your-anon-key-here"
);

/**
 * Singleton Supabase Client for Pure Farm
 */
export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
