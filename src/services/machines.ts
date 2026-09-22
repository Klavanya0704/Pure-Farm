import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { DbMachine, MachineCategory, MachineCondition, MachineRateUnit, MachineAvailability } from "@/types/database";

export interface CreateMachineInput {
  farmer_id?: string | null;
  owner_name: string;
  owner_phone?: string | null;
  name: string;
  category: MachineCategory;
  description?: string | null;
  image_url?: string | null;
  location: string;
  rental_rate: number;
  rate_unit?: MachineRateUnit;
  availability?: MachineAvailability;
  condition?: MachineCondition;
  specifications?: string | null;
  status?: string;
}

const LOCAL_MACHINES_KEY = "purefarm_local_machines_listings";

const INITIAL_STATIC_MACHINES: DbMachine[] = [
  {
    id: "m-1",
    farmer_id: "farmer-101",
    owner_name: "Ramesh Varma",
    owner_phone: "9848012345",
    name: "Mahindra 575 DI Tractor (45 HP)",
    category: "Tractor",
    description:
      "Multi-purpose 45 HP red diesel agricultural tractor with power steering and dual clutch. Ideal for tilling, ploughing, and transport.",
    image_url:
      "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=1000",
    location: "Rajahmundry",
    rental_rate: 500,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "45 HP, Diesel Engine, Dual Clutch, Heavy Tow Hitch",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-2",
    farmer_id: "farmer-102",
    owner_name: "Venkat Rao",
    owner_phone: "9848023456",
    name: "Kubota Harvester DC-68G",
    category: "Harvester",
    description:
      "High performance paddy & wheat combine harvester operating in field with 68 HP diesel engine for quick harvesting.",
    image_url:
      "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1000",
    location: "Kakinada",
    rental_rate: 1800,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "68 HP, Paddy & Wheat Combine, Hydrostatic Drive",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-3",
    farmer_id: "farmer-103",
    owner_name: "Appa Rao",
    owner_phone: "9848034567",
    name: "Shaktiman Rotavator 7 Feet",
    category: "Rotavator",
    description:
      "Heavy duty 7-foot tractor-mounted rotary tiller with 48 blades for fine seedbed preparation.",
    image_url:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1000",
    location: "Eluru",
    rental_rate: 450,
    rate_unit: "hr",
    availability: "available",
    condition: "Good",
    specifications: "48 Blades, Multi-speed Gearbox, PTO Driven",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-4",
    farmer_id: "farmer-104",
    owner_name: "Satyanarayana",
    owner_phone: "9848045678",
    name: "Multi-Crop Power Sprayer 20L",
    category: "Sprayer",
    description:
      "12V battery-operated 20L backpack power sprayer with dual brass nozzles for pesticide spray.",
    image_url:
      "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=1000",
    location: "Rajahmundry",
    rental_rate: 250,
    rate_unit: "day",
    availability: "available",
    condition: "Excellent",
    specifications: "12V 12Ah Battery, 20L Tank, Adjustable Brass Nozzle",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-5",
    farmer_id: "farmer-105",
    owner_name: "Krishna Reddy",
    owner_phone: "9848056789",
    name: "Honda 5 HP High Pressure Water Pump",
    category: "Water Pump",
    description:
      "4-stroke petrol 3-inch agricultural irrigation water pump for high volume field watering.",
    image_url:
      "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000",
    location: "Tanuku",
    rental_rate: 300,
    rate_unit: "day",
    availability: "available",
    condition: "Good",
    specifications: "5 HP Engine, 3-inch Delivery Pipe, 1000L/min Flow",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-6",
    farmer_id: "farmer-106",
    owner_name: "Rambabu",
    owner_phone: "9848067890",
    name: "STIHL Heavy Duty Power Tiller 7.5 HP",
    category: "Cultivator",
    description:
      "Heavy duty petrol power tiller cultivator with visible tines for orchard tilling and weeding.",
    image_url:
      "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000",
    location: "Mandapeta",
    rental_rate: 350,
    rate_unit: "hr",
    availability: "available",
    condition: "Good",
    specifications: "7.5 HP Petrol, Reverse Gear, Tillage Depth 6-8 inch",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-7",
    farmer_id: "farmer-107",
    owner_name: "Subba Rao",
    owner_phone: "9848078901",
    name: "National Automatic 9-Row Seed Drill",
    category: "Seeder",
    description:
      "Tractor-mounted 9-row automatic seed drill and fertilizer applicator for precise sowing.",
    image_url:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1000",
    location: "Vijayawada",
    rental_rate: 400,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "9 Tines, Double Box Seed & Fertilizer, Adjustable Depth",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-8",
    farmer_id: "farmer-108",
    owner_name: "Narasimha Rao",
    owner_phone: "9848089012",
    name: "Jain Drip & Sprinkler Irrigation System",
    category: "Irrigation Equipment",
    description:
      "Portable agricultural sprinkler set with 30 nozzles and quick-fit HDPE pipes for 2-acre coverage.",
    image_url:
      "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=1000",
    location: "Kakinada",
    rental_rate: 600,
    rate_unit: "day",
    availability: "available",
    condition: "Excellent",
    specifications: "30 Brass Sprinklers, 75mm HDPE Pipes, 2 Acre Kit",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-9",
    farmer_id: "farmer-109",
    owner_name: "Venkatesh",
    owner_phone: "9848090123",
    name: "STIHL Power Weeder & Brush Cutter 2.2 HP",
    category: "Power Tool",
    description:
      "Heavy duty 2-stroke petrol brush cutter tool with 3-tooth metal blade and tap-and-go nylon head.",
    image_url:
      "https://images.unsplash.com/photo-1590682680695-43b964a3ae17?auto=format&fit=crop&w=1000",
    location: "Eluru",
    rental_rate: 200,
    rate_unit: "day",
    availability: "available",
    condition: "Good",
    specifications: "2.2 HP 40cc Petrol, 3-Tooth Blade, Double Shoulder Harness",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-10",
    farmer_id: "farmer-110",
    owner_name: "Suryanarayana",
    owner_phone: "9848091234",
    name: "Hydraulic Tipping Tractor Trolley 5-Ton",
    category: "Other",
    description:
      "Heavy duty 5-tonne hydraulic tipping tractor trailer for agricultural crop haulage and transport.",
    image_url:
      "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=1000",
    location: "Rajahmundry",
    rental_rate: 500,
    rate_unit: "day",
    availability: "available",
    condition: "Excellent",
    specifications: "5-Ton Capacity, Single Axle, Hydraulic Ram Lift",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function getLocalMachines(): DbMachine[] {
  if (typeof window === "undefined") return INITIAL_STATIC_MACHINES;
  try {
    const data = localStorage.getItem(LOCAL_MACHINES_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Fix any outdated/broken image URLs in cached local storage
        return parsed.map((item: DbMachine) => {
          const match = INITIAL_STATIC_MACHINES.find((m) => m.id === item.id);
          if (match) {
            return { ...item, image_url: match.image_url };
          }
          return item;
        });
      }
    }
  } catch (e) {
    console.error("Failed to read local machines:", e);
  }
  return INITIAL_STATIC_MACHINES;
}

function saveLocalMachines(machines: DbMachine[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_MACHINES_KEY, JSON.stringify(machines));
  } catch (e) {
    console.error("Failed to save local machines:", e);
  }
}

/**
 * Fetch machines from Supabase or fallback store
 */
export async function getMachines(options?: {
  category?: string;
  farmerId?: string;
  limit?: number;
}): Promise<DbMachine[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from("machines_tools").select("*").order("created_at", { ascending: false });

      if (options?.category && options.category !== "all") {
        query = query.eq("category", options.category as MachineCategory);
      }
      if (options?.farmerId) {
        query = query.eq("farmer_id", options.farmerId);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as DbMachine[];
      }
    } catch (err) {
      console.warn("Supabase fetch failed for machines_tools, using local storage", err);
    }
  }

  // Fallback filtering
  let list = getLocalMachines();
  if (options?.category && options.category !== "all") {
    list = list.filter((m) => m.category.toLowerCase() === options.category?.toLowerCase());
  }
  if (options?.farmerId) {
    list = list.filter((m) => m.farmer_id === options.farmerId);
  }
  if (options?.limit) {
    list = list.slice(0, options.limit);
  }
  return list;
}

/**
 * Create a new machine/tool listing
 */
export async function createMachine(input: CreateMachineInput): Promise<DbMachine> {
  const newMachine: DbMachine = {
    id: `m-${Date.now()}`,
    farmer_id: input.farmer_id || null,
    owner_name: input.owner_name,
    owner_phone: input.owner_phone || null,
    name: input.name,
    category: input.category,
    description: input.description || null,
    image_url: input.image_url || "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=1000",
    location: input.location,
    rental_rate: Number(input.rental_rate),
    rate_unit: (input.rate_unit as MachineRateUnit) || "hr",
    availability: (input.availability as MachineAvailability) || "available",
    condition: (input.condition as MachineCondition) || "Good",
    specifications: input.specifications || null,
    status: input.status || "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("machines_tools")
        .insert({
          farmer_id: newMachine.farmer_id,
          owner_name: newMachine.owner_name,
          owner_phone: newMachine.owner_phone,
          name: newMachine.name,
          category: newMachine.category,
          description: newMachine.description,
          image_url: newMachine.image_url,
          location: newMachine.location,
          rental_rate: newMachine.rental_rate,
          rate_unit: newMachine.rate_unit,
          availability: newMachine.availability,
          condition: newMachine.condition,
          specifications: newMachine.specifications,
          status: newMachine.status,
        })
        .select("*")
        .single();

      if (!error && data) {
        return data as DbMachine;
      }
    } catch (err) {
      console.warn("Supabase insert error for machines_tools, saving to local state", err);
    }
  }

  // Local storage save
  const current = getLocalMachines();
  const updated = [newMachine, ...current];
  saveLocalMachines(updated);
  return newMachine;
}
