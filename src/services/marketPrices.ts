import { createServerFn } from "@tanstack/react-start";
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

export interface SyncResult {
  success: boolean;
  message: string;
  recordsFetched: number;
  recordsInserted: number;
  verificationRecordsRemoved: boolean;
  error?: string;
}

export function cleanCropName(rawCommodity: string): string {
  if (!rawCommodity) return "Agricultural Produce";
  let name = rawCommodity.trim();
  // Strip parentheses e.g. "Paddy(Dhan)(Common)" -> "Paddy"
  name = name.replace(/\([^)]*\)/g, "").trim();
  if (!name) name = rawCommodity.trim();
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function parseGovernmentDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  try {
    const parts = dateStr.trim().split("/");
    const p0 = parts[0];
    const p1 = parts[1];
    const p2 = parts[2];
    if (parts.length === 3 && p0 !== undefined && p1 !== undefined && p2 !== undefined) {
      const day = parseInt(p0, 10);
      const month = parseInt(p1, 10) - 1;
      const year = parseInt(p2, 10);
      const d = new Date(Date.UTC(year, month, day));
      if (!isNaN(d.getTime())) return d.toISOString();
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {
    // fallback
  }
  return new Date().toISOString();
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

export const syncLiveMarketPrices = createServerFn({ method: "POST" }).handler(
  async (): Promise<SyncResult> => {
    const apiKey = process.env["OGD_INDIA_API_KEY"] || process.env["DATA_GOV_IN_API_KEY"];
    if (!apiKey) {
      return {
        success: false,
        message: "OGD_INDIA_API_KEY environment variable is missing on server.",
        recordsFetched: 0,
        recordsInserted: 0,
        verificationRecordsRemoved: false,
        error: "Missing OGD_INDIA_API_KEY environment variable.",
      };
    }

    if (!isSupabaseConfigured) {
      return {
        success: false,
        message: "Supabase client is not configured.",
        recordsFetched: 0,
        recordsInserted: 0,
        verificationRecordsRemoved: false,
        error: "Supabase is not configured.",
      };
    }

    try {
      const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${encodeURIComponent(
        apiKey
      )}&format=json&filters[state]=Andhra%20Pradesh&limit=100`;

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "PureFarm-Connect/1.0",
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        return {
          success: false,
          message: `Government OGD API HTTP error: ${response.status} ${response.statusText}`,
          recordsFetched: 0,
          recordsInserted: 0,
          verificationRecordsRemoved: false,
          error: errText.slice(0, 200),
        };
      }

      const json = await response.json();
      const rawRecords = json?.records;
      if (!Array.isArray(rawRecords) || rawRecords.length === 0) {
        return {
          success: false,
          message: "Government OGD API returned 0 records for Andhra Pradesh.",
          recordsFetched: 0,
          recordsInserted: 0,
          verificationRecordsRemoved: false,
        };
      }

      const now = new Date().toISOString();
      const formattedRecords = rawRecords.map((r: any) => {
        const cropName = cleanCropName(r.commodity || "Produce");
        const marketName = r.market ? `${r.market.trim()} Market` : "Market";
        const location = r.district ? `${r.district.trim()}, Andhra Pradesh` : "Andhra Pradesh";
        const price = parseFloat(r.modal_price || r.min_price || r.max_price || "0");
        const recordedAt = parseGovernmentDate(r.arrival_date);

        return {
          crop_name: cropName,
          market_name: marketName,
          location: location,
          state: "Andhra Pradesh",
          price: isNaN(price) ? 0 : price,
          unit: "Quintal",
          change_pct: 0,
          source: "Government of India OGD (AGMARKNET)",
          recorded_at: recordedAt,
          updated_at: now,
        };
      });

      // Insert new live records into Supabase market_prices
      const { data: inserted, error: insertError } = await supabase
        .from("market_prices")
        .insert(formattedRecords)
        .select();

      if (insertError) {
        console.error("Error inserting OGD records to Supabase:", insertError);
        return {
          success: false,
          message: `Database insertion error: ${insertError.message}`,
          recordsFetched: rawRecords.length,
          recordsInserted: 0,
          verificationRecordsRemoved: false,
          error: insertError.message,
        };
      }

      const countInserted = inserted ? inserted.length : formattedRecords.length;

      // Verification cleanup: Remove the 3 Step 7 verification records ONLY after live records are confirmed
      let verificationRemoved = false;
      if (countInserted > 0) {
        const { error: deleteError } = await supabase
          .from("market_prices")
          .delete()
          .eq("source", "Step 7 Verification Sample");

        if (!deleteError) {
          verificationRemoved = true;
        } else {
          console.warn("Could not delete Step 7 verification sample records:", deleteError.message);
        }
      }

      return {
        success: true,
        message: `Successfully synchronized ${countInserted} live records from Government OGD API.`,
        recordsFetched: rawRecords.length,
        recordsInserted: countInserted,
        verificationRecordsRemoved: verificationRemoved,
      };
    } catch (err: any) {
      console.error("Unexpected error in syncLiveMarketPrices:", err);
      return {
        success: false,
        message: "Failed to synchronize live mandi data.",
        recordsFetched: 0,
        recordsInserted: 0,
        verificationRecordsRemoved: false,
        error: err?.message || String(err),
      };
    }
  }
);

