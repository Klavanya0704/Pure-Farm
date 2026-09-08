import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { MarketPrice } from "@/types/database";

export interface GetMarketPricesOptions {
  search?: string;
  cropName?: string;
  marketName?: string;
  state?: string;
  sortOrder?: "price_low_high" | "price_high_low" | "recently_updated";
  limit?: number;
}

export async function getMarketPrices(options?: GetMarketPricesOptions): Promise<MarketPrice[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    let query = supabase.from("market_prices").select("*");

    if (options?.sortOrder === "price_low_high") {
      query = query.order("price", { ascending: true });
    } else if (options?.sortOrder === "price_high_low") {
      query = query.order("price", { ascending: false });
    } else {
      query = query.order("recorded_at", { ascending: false, nullsFirst: false });
    }

    if (options?.state && options.state !== "all" && options.state !== "All States") {
      query = query.ilike("state", `%${options.state}%`);
    }
    if (options?.cropName && options.cropName !== "all" && options.cropName !== "All Crops") {
      query = query.ilike("crop_name", `%${options.cropName}%`);
    }
    if (options?.marketName && options.marketName !== "all" && options.marketName !== "All Markets") {
      query = query.ilike("market_name", `%${options.marketName}%`);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching market prices from Supabase:", error.message);
      throw error;
    }

    let records: MarketPrice[] = data || [];

    // Client-side search filtering across crop, market, location, state
    if (options?.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      records = records.filter(
        (m) =>
          m.crop_name?.toLowerCase().includes(q) ||
          m.market_name?.toLowerCase().includes(q) ||
          m.location?.toLowerCase().includes(q) ||
          m.state?.toLowerCase().includes(q)
      );
    }

    return records;
  } catch (err) {
    console.error("Failed to query market_prices from Supabase:", err);
    throw err;
  }
}

export async function addMarketPrice(
  input: Omit<MarketPrice, "id" | "created_at" | "updated_at">
): Promise<MarketPrice | null> {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured");
  const { data, error } = await supabase
    .from("market_prices")
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error("Error adding market price:", error.message);
    throw error;
  }
  return data;
}

