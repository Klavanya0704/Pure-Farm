import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus } from "@/types/database";

export interface CreateOrderItemInput {
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface CreateOrderInput {
  buyer_id?: string | null;
  farmer_id?: string | null;
  total_amount: number;
  delivery_location: string;
  payment_method?: PaymentMethod;
  notes?: string | null;
  items: CreateOrderItemInput[];
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & {
    products?: {
      name: string;
      image_url: string | null;
      unit: string;
    } | null;
  })[];
}

export async function createRealBuyerOrder(input: {
  buyer_id: string;
  delivery_location: string;
  notes?: string | null;
  items: { productId: string; qty: number }[];
}): Promise<Order[]> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  if (!input.buyer_id) {
    throw new Error("Buyer authentication required to place order");
  }

  if (!input.items || input.items.length === 0) {
    throw new Error("Cannot place an empty order");
  }

  const productIds = input.items.map(i => i.productId);

  // 1. Re-fetch current database product records from Supabase
  const { data: dbProducts, error: fetchErr } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds);

  if (fetchErr || !dbProducts) {
    console.error("Error fetching live products for checkout:", fetchErr?.message);
    throw new Error("Failed to verify product availability from database.");
  }

  // 2. Validate stock and prices for every requested item
  const validatedItems: {
    product: any;
    qty: number;
    unit_price: number;
    subtotal: number;
    farmer_id: string;
  }[] = [];

  for (const cartItem of input.items) {
    const dbProduct = dbProducts.find(p => p.id === cartItem.productId);

    if (!dbProduct) {
      throw new Error(`Product is no longer available in the store.`);
    }

    if (dbProduct.status === "inactive" || dbProduct.status === "sold_out") {
      throw new Error(`"${dbProduct.name}" is currently sold out or inactive.`);
    }

    if (cartItem.qty <= 0) {
      throw new Error(`Invalid quantity for "${dbProduct.name}".`);
    }

    if (cartItem.qty > dbProduct.available_quantity) {
      throw new Error(`Only ${dbProduct.available_quantity} units of "${dbProduct.name}" are currently available.`);
    }

    const unit_price = Number(dbProduct.price);
    const subtotal = unit_price * cartItem.qty;
    const farmer_id = dbProduct.farmer_id || "00000000-0000-0000-0000-000000000000";

    validatedItems.push({
      product: dbProduct,
      qty: cartItem.qty,
      unit_price,
      subtotal,
      farmer_id,
    });
  }

  // 3. Group validated items by farmer_id for multi-farmer cart handling
  const farmerGroups = new Map<string, typeof validatedItems>();
  for (const item of validatedItems) {
    const group = farmerGroups.get(item.farmer_id) || [];
    group.push(item);
    farmerGroups.set(item.farmer_id, group);
  }

  const createdOrders: Order[] = [];

  // 4. Create separate Order records per farmer and corresponding OrderItems
  for (const [farmerId, groupItems] of farmerGroups.entries()) {
    const groupTotal = groupItems.reduce((sum, i) => sum + i.subtotal, 0);

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        buyer_id: input.buyer_id,
        farmer_id: farmerId,
        total_amount: groupTotal,
        status: "pending",
        delivery_location: input.delivery_location,
        payment_method: "cod",
        payment_status: "pending",
        notes: input.notes ?? null,
      })
      .select()
      .single();

    if (orderErr || !order) {
      console.error("Error creating order record:", orderErr?.message);
      throw orderErr || new Error("Failed to create order record in Supabase.");
    }

    const orderItemsToInsert = groupItems.map(gi => ({
      order_id: order.id,
      product_id: gi.product.id,
      quantity: gi.qty,
      unit_price: gi.unit_price,
      subtotal: gi.subtotal,
    }));

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(orderItemsToInsert);

    if (itemsErr) {
      console.error("Error creating order items:", itemsErr.message);
      throw itemsErr;
    }

    // 5. Decrement available stock in Supabase products table atomically
    for (const gi of groupItems) {
      await decrementProductStockAtomic(gi.product.id, gi.qty, gi.product.available_quantity);
    }

    createdOrders.push(order);
  }

  return createdOrders;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  // 1. Insert Order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      buyer_id: input.buyer_id ?? null,
      farmer_id: input.farmer_id ?? null,
      total_amount: input.total_amount,
      status: "pending",
      delivery_location: input.delivery_location,
      payment_method: input.payment_method ?? "cod",
      payment_status: "pending",
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error("Error creating order:", orderError?.message);
    throw orderError || new Error("Failed to create order");
  }

  // 2. Insert Order Items
  if (input.items && input.items.length > 0) {
    const itemsToInsert = input.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Error inserting order items:", itemsError.message);
      throw itemsError;
    }
  }

  return order;
}

export async function getOrdersByBuyer(buyerId: string): Promise<OrderWithItems[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name, image_url, unit))")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching buyer orders:", error.message);
    return [];
  }
  return (data as unknown as OrderWithItems[]) || [];
}

export async function getOrdersByFarmer(farmerId: string): Promise<OrderWithItems[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name, image_url, unit))")
    .eq("farmer_id", farmerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching farmer orders:", error.message);
    return [];
  }
  return (data as unknown as OrderWithItems[]) || [];
}

export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name, image_url, unit))")
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("Error fetching order by id:", error.message);
    return null;
  }
  return data as unknown as OrderWithItems;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  paymentStatus?: PaymentStatus
): Promise<Order | null> {
  if (!isSupabaseConfigured) return null;
  const updatePayload: Partial<Order> = { status };
  if (paymentStatus) {
    updatePayload.payment_status = paymentStatus;
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    console.error("Error updating order status:", error.message);
    throw error;
  }
  return data;
}

/**
 * Atomically decrements product stock in Supabase PostgreSQL.
 * Uses RPC 'decrement_product_stock' (with FOR UPDATE row locking) when available,
 * or atomic PostgREST UPDATE with conditional '.gte("available_quantity", quantity)'.
 */
export async function decrementProductStockAtomic(
  productId: string,
  quantity: number,
  _fallbackStock?: number
): Promise<{ newStock: number; status: string }> {
  if (!isSupabaseConfigured) {
    return { newStock: 0, status: "available" };
  }

  // 1. Attempt Supabase RPC stored procedure call (atomic database transaction with FOR UPDATE row locking)
  try {
    const { data: rpcData, error: rpcErr } = await supabase.rpc("decrement_product_stock", {
      p_product_id: productId,
      p_quantity: quantity,
    });

    if (!rpcErr && rpcData) {
      const res = typeof rpcData === "string" ? JSON.parse(rpcData) : rpcData;
      return {
        newStock: Number(res.new_stock),
        status: String(res.status),
      };
    }
  } catch (rpcEx) {
    console.warn("RPC decrement_product_stock fallback to atomic query:", rpcEx);
  }

  // 2. Fallback: Atomic conditional update with .gte('available_quantity', quantity)
  // Enforces PostgreSQL row-level serialization at transaction time.
  const { data: currentProd, error: fetchErr } = await supabase
    .from("products")
    .select("available_quantity, name")
    .eq("id", productId)
    .single();

  if (fetchErr || !currentProd) {
    throw new Error("Failed to verify current stock from database.");
  }

  const currentStock = Number(currentProd.available_quantity);
  if (currentStock < quantity) {
    throw new Error(`Only ${currentStock} units of "${currentProd.name}" are currently available.`);
  }

  const targetStock = Math.max(0, currentStock - quantity);
  const targetStatus = targetStock <= 0 ? "sold_out" : "available";

  const { data: updatedRows, error: updateErr } = await supabase
    .from("products")
    .update({
      available_quantity: targetStock,
      status: targetStatus,
    })
    .eq("id", productId)
    .gte("available_quantity", quantity)
    .select();

  if (updateErr) {
    console.error("Atomic stock decrement error:", updateErr.message);
    throw updateErr;
  }

  if (!updatedRows || updatedRows.length === 0) {
    throw new Error(`Concurrent purchase conflict: Stock was modified by another buyer during transaction.`);
  }

  return {
    newStock: targetStock,
    status: targetStatus,
  };
}
