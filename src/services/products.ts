import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { DbProduct, ProductCategory, ProductStatus } from "@/types/database";
import { PRODUCTS as STATIC_PRODUCTS } from "@/data/products";
import type { Product as LegacyProduct } from "@/data/types";

export interface CreateProductInput {
  farmer_id?: string | null;
  name: string;
  category: ProductCategory;
  description?: string | null;
  price: number;
  unit: string;
  quantity?: number;
  available_quantity?: number;
  location?: string | null;
  image_url?: string | null;
  quality?: string | null;
  harvest_date?: string | null;
  status?: ProductStatus;
  badge?: string | null;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  rating?: number;
}

/**
 * Fetch active/available products from Supabase with fallback to static products when empty
 */
export async function getProducts(options?: {
  category?: string;
  farmerId?: string;
  limit?: number;
}): Promise<DbProduct[]> {
  if (!isSupabaseConfigured) {
    return mapStaticToDbProducts(options);
  }

  let query = supabase.from("products").select("*").order("created_at", { ascending: false });

  if (options?.category && options.category !== "all") {
    query = query.eq("category", options.category as ProductCategory);
  }
  if (options?.farmerId) {
    query = query.eq("farmer_id", options.farmerId);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching products from Supabase:", error.message);
    return mapStaticToDbProducts(options);
  }

  if (!data || data.length === 0) {
    return mapStaticToDbProducts(options);
  }

  return data;
}

/**
 * Fetch products specifically created by a given farmer (farmer_id = farmerId).
 * Does NOT fall back to static products so that empty state is preserved when 0 products are listed.
 */
export async function getFarmerProducts(farmerId: string): Promise<DbProduct[]> {
  if (!isSupabaseConfigured || !farmerId) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("farmer_id", farmerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching farmer products from Supabase:", error.message);
    throw error;
  }

  return data || [];
}

export async function getProductById(id: string): Promise<DbProduct | null> {
  if (!isSupabaseConfigured) {
    const staticP = STATIC_PRODUCTS.find(p => p.id === id);
    return staticP ? convertSingleStatic(staticP) : null;
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    const staticP = STATIC_PRODUCTS.find(p => p.id === id);
    return staticP ? convertSingleStatic(staticP) : null;
  }
  return data;
}

export async function createProduct(input: CreateProductInput): Promise<DbProduct> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  const { data: { user } } = await supabase.auth.getUser();
  const farmerId = input.farmer_id || user?.id;

  if (!farmerId) {
    throw new Error("User must be authenticated to create a product");
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      farmer_id: farmerId,
      name: input.name.trim(),
      category: input.category,
      description: input.description?.trim() || null,
      price: Number(input.price),
      unit: input.unit.trim(),
      quantity: Number(input.quantity ?? 0),
      available_quantity: Number(input.available_quantity ?? input.quantity ?? 0),
      location: input.location?.trim() || null,
      image_url: input.image_url?.trim() || null,
      quality: input.quality?.trim() || "Grade A",
      harvest_date: input.harvest_date || null,
      status: input.status || "available",
      badge: input.badge?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating product:", error.message);
    throw error;
  }
  return data;
}

export async function updateProduct(id: string, updates: UpdateProductInput): Promise<DbProduct> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  const payload: Record<string, any> = {};
  if (updates["name"] !== undefined) payload["name"] = updates["name"].trim();
  if (updates["category"] !== undefined) payload["category"] = updates["category"];
  if (updates["description"] !== undefined) payload["description"] = updates["description"]?.trim() || null;
  if (updates["price"] !== undefined) payload["price"] = Number(updates["price"]);
  if (updates["unit"] !== undefined) payload["unit"] = updates["unit"].trim();
  if (updates["quantity"] !== undefined) payload["quantity"] = Number(updates["quantity"]);
  if (updates["available_quantity"] !== undefined) payload["available_quantity"] = Number(updates["available_quantity"]);
  if (updates["location"] !== undefined) payload["location"] = updates["location"]?.trim() || null;
  if (updates["image_url"] !== undefined) payload["image_url"] = updates["image_url"]?.trim() || null;
  if (updates["quality"] !== undefined) payload["quality"] = updates["quality"]?.trim() || null;
  if (updates["harvest_date"] !== undefined) payload["harvest_date"] = updates["harvest_date"] || null;
  if (updates["status"] !== undefined) payload["status"] = updates["status"];
  if (updates["badge"] !== undefined) payload["badge"] = updates["badge"]?.trim() || null;

  const { data, error } = await (supabase
    .from("products") as any)
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating product:", error.message);
    throw error;
  }
  return data;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error("Error deleting product:", error.message);
    throw error;
  }
  return true;
}

function convertSingleStatic(p: LegacyProduct): DbProduct {
  return {
    id: p.id,
    farmer_id: null,
    name: p.name,
    category: (p.category as ProductCategory) || "other",
    description: p.description || null,
    price: p.price,
    unit: p.unit,
    quantity: p.stock || 100,
    available_quantity: p.stock || 100,
    location: "India",
    image_url: p.image,
    quality: "Grade A",
    harvest_date: null,
    status: "available",
    rating: p.rating || 4.5,
    badge: p.badge || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function mapStaticToDbProducts(options?: { category?: string; farmerId?: string; limit?: number }): DbProduct[] {
  let filtered = STATIC_PRODUCTS;
  if (options?.category && options.category !== "all") {
    filtered = filtered.filter(p => p.category === options.category);
  }
  if (options?.limit) {
    filtered = filtered.slice(0, options.limit);
  }
  return filtered.map(convertSingleStatic);
}
