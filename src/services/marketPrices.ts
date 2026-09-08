import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { MarketPrice } from "@/types/database";
import { MANDI_PRICES } from "@/data/agriculture";

export async function getMarketPrices(options?: {
  state?: string;
  cropName?: string;
  limit?: number;
}): Promise<MarketPrice[]> {
  if (!isSupabaseConfigured) {
    return fallbackMandiPrices(options);
  }

  let query = supabase.from("market_prices").select("*").order("recorded_at", { ascending: false });

  if (options?.state) {
    query = query.ilike("state", `%${options.state}%`);
  }
  if (options?.cropName) {
    query = query.ilike("crop_name", `%${options.cropName}%`);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error || !data || data.length === 0) {
    return fallbackMandiPrices(options);
  }

  return data;
}

export async function addMarketPrice(input: Omit<MarketPrice, 'id' | 'created_at' | 'updated_at'>): Promise<MarketPrice | null> {
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

function fallbackMandiPrices(options?: { state?: string; cropName?: string; limit?: number }): MarketPrice[] {
  let list = MANDI_PRICES.map((m, idx) => ({
    id: `mp-${idx + 1}`,
    crop_name: m.crop,
    market_name: m.mandi,
    location: m.mandi,
    state: m.state,
    price: m.price,
    unit: 'quintal',
    change_pct: m.changePct,
    source: 'Mandi Agmarknet Record',
    recorded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  if (options?.state) {
    list = list.filter(m => m.state.toLowerCase().includes(options.state!.toLowerCase()));
  }
  if (options?.cropName) {
    list = list.filter(m => m.crop_name.toLowerCase().includes(options.cropName!.toLowerCase()));
  }
  if (options?.limit) {
    list = list.slice(0, options.limit);
  }

  return list;
}
