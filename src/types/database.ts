/**
 * PureFarm Supabase Database Type Definitions
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "farmer" | "buyer" | "student" | "admin" | "seller";
export type ProductStatus = "available" | "sold_out" | "inactive";
export type ProductCategory =
  | "seeds"
  | "fertilizers"
  | "tools"
  | "pesticides"
  | "farm-tools"
  | "equipment"
  | "grains"
  | "fruits"
  | "vegetables"
  | "pulses"
  | "oilseeds"
  | "spices"
  | "other";
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "cod" | "online" | "upi" | "bank_transfer";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type ColdStorageStatus = "operational" | "maintenance" | "full" | "closed";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  role: UserRole;
  location: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbProduct {
  id: string;
  farmer_id: string | null;
  name: string;
  category: ProductCategory;
  description: string | null;
  price: number;
  unit: string;
  quantity: number;
  available_quantity: number;
  location: string | null;
  image_url: string | null;
  quality: string | null;
  harvest_date: string | null;
  status: ProductStatus;
  rating: number;
  badge: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  buyer_id: string | null;
  farmer_id: string | null;
  total_amount: number;
  status: OrderStatus;
  delivery_location: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface MarketPrice {
  id: string;
  crop_name: string;
  market_name: string;
  location: string;
  state: string;
  price: number;
  unit: string;
  change_pct: number;
  source: string;
  recorded_at: string;
  updated_at: string;
}

export type MachineCategory =
  | "Tractor"
  | "Harvester"
  | "Rotavator"
  | "Cultivator"
  | "Seeder"
  | "Sprayer"
  | "Water Pump"
  | "Irrigation Equipment"
  | "Power Tool"
  | "Other";

export type MachineCondition = "Excellent" | "Good" | "Fair";
export type MachineRateUnit = "hr" | "day" | "week";
export type MachineAvailability = "available" | "booked" | "maintenance";

export interface DbMachine {
  id: string;
  farmer_id: string | null;
  owner_name: string;
  owner_phone: string | null;
  name: string;
  category: MachineCategory;
  description: string | null;
  image_url: string | null;
  location: string;
  rental_rate: number;
  rate_unit: MachineRateUnit;
  availability: MachineAvailability;
  condition: MachineCondition;
  specifications: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ColdStorage {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: number | null;
  capacity: number;
  available_capacity: number;
  contact_number: string;
  status: ColdStorageStatus;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, "id">>;
      };
      products: {
        Row: DbProduct;
        Insert: Omit<DbProduct, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DbProduct, "id">>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Order, "id">>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<OrderItem, "id">>;
      };
      market_prices: {
        Row: MarketPrice;
        Insert: Omit<MarketPrice, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<MarketPrice, "id">>;
      };
      cold_storage: {
        Row: ColdStorage;
        Insert: Omit<ColdStorage, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ColdStorage, "id">>;
      };
      machines_tools: {
        Row: DbMachine;
        Insert: Omit<DbMachine, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DbMachine, "id">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

