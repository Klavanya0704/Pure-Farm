import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Profile, UserRole } from "@/types/database";

export interface ProfileInput {
  id: string;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  role?: UserRole;
  location?: string | null;
  avatar_url?: string | null;
}

export async function getProfile(id: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();

  if (error) {
    console.error("Error fetching profile:", error.message);
    return null;
  }
  return data;
}

export async function upsertProfile(profile: ProfileInput): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: profile.id,
      full_name: profile.full_name,
      phone: profile.phone ?? null,
      email: profile.email ?? null,
      role: profile.role ?? "farmer",
      location: profile.location ?? null,
      avatar_url: profile.avatar_url ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error upserting profile:", error.message);
    throw error;
  }
  return data;
}

export async function updateProfile(
  id: string,
  updates: Partial<Profile>,
): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error.message);
    throw error;
  }
  return data;
}
