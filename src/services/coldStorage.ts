import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface ColdStorageFacility {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  distance: number | null;
  capacity: number;
  available_capacity: number;
  contact_number: string | null;
  status: "Available" | "Full" | "Maintenance" | string;
  created_at?: string;
  updated_at?: string;
  calculatedDistance?: number;
}

export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const DEFAULT_COLD_STORAGE_FACILITIES: ColdStorageFacility[] = [
  {
    id: "cs-1",
    name: "Green Valley Cold Storage",
    address: "Rajahmundry, East Godavari, Andhra Pradesh - 533101",
    latitude: 16.9891,
    longitude: 81.7835,
    distance: 8.4,
    capacity: 3000,
    available_capacity: 1200,
    contact_number: "+91 98765 43210",
    status: "Available",
  },
  {
    id: "cs-2",
    name: "Godavari Fresh Storage & Agro Hub",
    address: "Kadiyam, Rajahmundry Rural, Andhra Pradesh - 533126",
    latitude: 16.9142,
    longitude: 81.8315,
    distance: 12.5,
    capacity: 5000,
    available_capacity: 3200,
    contact_number: "+91 98450 12345",
    status: "Available",
  },
  {
    id: "cs-3",
    name: "Delta Mega Cold Chain Logistics",
    address: "Vijayawada Hwy, Eluru, Andhra Pradesh - 534002",
    latitude: 16.7107,
    longitude: 81.0952,
    distance: 45.2,
    capacity: 2500,
    available_capacity: 0,
    contact_number: "+91 88866 55443",
    status: "Full",
  },
  {
    id: "cs-4",
    name: "Krishna Agro Cold Preserving Unit",
    address: "Guntur Road, Vijayawada, Andhra Pradesh - 520001",
    latitude: 16.5062,
    longitude: 80.6480,
    distance: 62.0,
    capacity: 4000,
    available_capacity: 1800,
    contact_number: "+91 91234 56789",
    status: "Maintenance",
  },
];

export async function getColdStorageFacilities(options?: {
  search?: string;
  statusFilter?: string;
  userLat?: number | null;
  userLng?: number | null;
  sortOrder?: "nearest" | "farthest" | "capacity_high" | "capacity_low";
}): Promise<ColdStorageFacility[]> {
  let facilities: ColdStorageFacility[] = [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("cold_storage")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching cold storage facilities from Supabase:", error.message);
        throw error;
      }

      if (data) {
        facilities = data.map((item) => ({
          id: item.id,
          name: item.name,
          address: item.address,
          latitude: item.latitude ? Number(item.latitude) : null,
          longitude: item.longitude ? Number(item.longitude) : null,
          distance: item.distance !== null ? Number(item.distance) : null,
          capacity: Number(item.capacity || 0),
          available_capacity: Number(item.available_capacity || 0),
          contact_number: item.contact_number || null,
          status: item.status || "Available",
          created_at: item.created_at,
          updated_at: item.updated_at,
        }));
      }
    } catch (err) {
      console.error("Error fetching cold storage facilities from Supabase:", err);
      facilities = [];
    }
  } else {
    facilities = [...DEFAULT_COLD_STORAGE_FACILITIES];
  }

  if (facilities.length === 0) {
    facilities = [...DEFAULT_COLD_STORAGE_FACILITIES];
  }

  if (options?.userLat && options?.userLng) {
    facilities = facilities.map((facility) => {
      if (facility.latitude && facility.longitude) {
        const dist = calculateHaversineDistance(
          options.userLat!,
          options.userLng!,
          facility.latitude,
          facility.longitude
        );
        return { ...facility, calculatedDistance: dist };
      }
      return facility;
    });
  }

  if (options?.search && options.search.trim()) {
    const q = options.search.trim().toLowerCase();
    facilities = facilities.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q)
    );
  }

  if (options?.statusFilter && options.statusFilter !== "all") {
    const sf = options.statusFilter.toLowerCase();
    facilities = facilities.filter((f) => {
      const st = f.status.toLowerCase();
      if (sf === "available") {
        return st === "available" || st === "operational";
      }
      return st === sf;
    });
  }

  facilities.sort((a, b) => {
    const distA = a.calculatedDistance ?? a.distance ?? 999;
    const distB = b.calculatedDistance ?? b.distance ?? 999;

    if (options?.sortOrder === "farthest") {
      return distB - distA;
    }
    if (options?.sortOrder === "capacity_high") {
      return b.available_capacity - a.available_capacity;
    }
    if (options?.sortOrder === "capacity_low") {
      return a.available_capacity - b.available_capacity;
    }
    return distA - distB;
  });

  return facilities;
}
