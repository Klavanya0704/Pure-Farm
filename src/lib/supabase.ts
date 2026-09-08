import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const DEFAULT_SUPABASE_URL = "https://vnrdptchxdxrjfwkqlon.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_OCrYtpMGasuSL7df6ok3fg_9BFkj24r";

const supabaseUrl = (import.meta.env["VITE_SUPABASE_URL"] as string) || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string) || DEFAULT_SUPABASE_ANON_KEY;

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
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
