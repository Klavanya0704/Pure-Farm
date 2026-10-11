export function getEquipmentPlaceholder(category?: string, name?: string): string {
  const catLabel = category
    ? category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")
    : "Farm Equipment";
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='450' viewBox='0 0 600 450' fill='%23F0FDF4'><rect width='600' height='450' fill='%23F0FDF4'/><rect x='20' y='20' width='560' height='410' rx='20' fill='%23E8F5EE' stroke='%23A7F3D0' stroke-width='2'/><circle cx='300' cy='190' r='54' fill='%23D1FAE5'/><path d='M300 156 C280 180 280 214 300 224 C320 214 320 180 300 156 Z' fill='%23059669'/><path d='M300 176 L300 218' stroke='%23FFFFFF' stroke-width='3' stroke-linecap='round'/><text x='300' y='280' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, -apple-system, sans-serif' font-size='18' font-weight='700' fill='%23064E3B'>${catLabel}</text><text x='300' y='312' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, -apple-system, sans-serif' font-size='13' font-weight='500' fill='%23047857'>Image Unavailable • PureFarm</text></svg>`;
}

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

const LOCAL_MACHINES_KEY = "purefarm_local_machines_listings_v9";

const INITIAL_STATIC_MACHINES: DbMachine[] = [
  // 1. TRACTORS (4 items)
  {
    id: "m-1",
    farmer_id: "farmer-101",
    owner_name: "Ramesh Varma",
    owner_phone: "9848012345",
    name: "Mahindra E350-DI Tractor (35 HP)",
    category: "Tractor",
    description: "Multi-purpose 35 HP red diesel agricultural tractor with power steering. Ideal for tilling, ploughing, and transport.",
    image_url: "/images/machines/mahindra_575_tractor.jpg",
    location: "Rajahmundry",
    rental_rate: 500,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "35 HP, Diesel Engine, Dual Clutch, Heavy Tow Hitch",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-1b",
    farmer_id: "farmer-101b",
    owner_name: "K. Srinivasa Rao",
    owner_phone: "9848011223",
    name: "John Deere 6310 Tractor with Front Loader (100 HP)",
    category: "Tractor",
    description: "High power 100 HP heavy-duty tractor equipped with Stoll front-loading bucket, 4WD transmission, and heavy lift capacity.",
    image_url: "/images/machines/john_deere_5310_tractor.jpg",
    location: "Vijayawada",
    rental_rate: 650,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "100 HP Power Steering, Stoll Front Loader, 4WD Heavy Duty",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-1c",
    farmer_id: "farmer-101c",
    owner_name: "M. Nageswara Rao",
    owner_phone: "9848011334",
    name: "Swaraj 735 FE Tractor (40 HP)",
    category: "Tractor",
    description: "Reliable 40 HP 3-cylinder diesel tractor with multi-speed PTO, dual clutch, and heavy hydraulic lift capacity for field tilling and haulage.",
    image_url: "/images/machines/swaraj_735_fe_tractor.jpg",
    location: "Guntur",
    rental_rate: 520,
    rate_unit: "hr",
    availability: "available",
    condition: "Good",
    specifications: "40 HP 3-Cylinder Diesel, Dual Clutch, High Torque Transmission",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-1d",
    farmer_id: "farmer-101d",
    owner_name: "P. Venkateswarlu",
    owner_phone: "9848011445",
    name: "Sonalika Baagban DI-30 RX Tractor (30 HP)",
    category: "Tractor",
    description: "30 HP compact agricultural tractor engineered for orchard spraying, inter-cultivation, and row-crop farming.",
    image_url: "/images/machines/sonalika_di30_tractor.jpg",
    location: "Eluru",
    rental_rate: 550,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "30 HP Compact Diesel, Narrow Track Width, Multi-speed PTO",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 2. HARVESTERS (3 items)
  {
    id: "m-2",
    farmer_id: "farmer-102",
    owner_name: "Suresh Reddy",
    owner_phone: "9848023456",
    name: "Kubota Harvester DC-60 (60 HP)",
    category: "Harvester",
    description: "Paddy combine harvester with rubber crawlers for wet wetland and paddy field harvesting without bogging.",
    image_url: "/images/machines/kubota_dc60_harvester.jpg",
    location: "Kakinada",
    rental_rate: 1800,
    rate_unit: "hr",
    availability: "available",
    condition: "Good",
    specifications: "60 HP Kubota Diesel, Rubber Crawler Tracks, 2m Cutter Bar",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-2b",
    farmer_id: "farmer-102b",
    owner_name: "T. Satyanarayana",
    owner_phone: "9848022334",
    name: "John Deere 2266 Extra Combine Harvester (240 HP)",
    category: "Harvester",
    description: "Large-capacity self-propelled grain combine harvester for large acreage paddy and wheat harvesting with onboard grain tank.",
    image_url: "/images/machines/john_deere_combine_harvester.jpg",
    location: "Eluru",
    rental_rate: 2200,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "240 HP Turbo Diesel Engine, Large Grain Tank, 5.5m Cutter Bar",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-2d",
    farmer_id: "farmer-102d",
    owner_name: "C. Subba Rao",
    owner_phone: "9848022556",
    name: "New Holland TC5.30 Combine Harvester",
    category: "Harvester",
    description: "Multi-crop combine harvester with 130 HP engine, 4-straw walker system, and grain tank for paddy and wheat harvesting.",
    image_url: "/images/machines/new_holland_tc530_combine.jpg",
    location: "Vijayawada",
    rental_rate: 2000,
    rate_unit: "hr",
    availability: "available",
    condition: "Good",
    specifications: "130 HP Engine, 4 Straw Walkers, 3.9m Cutter Bar",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 3. ROTAVATORS (2 items)
  {
    id: "m-3",
    farmer_id: "farmer-103",
    owner_name: "Venkat Rao",
    owner_phone: "9848034567",
    name: "Shaktiman Rotavator 7 Feet",
    category: "Rotavator",
    description: "Heavy-duty 7-foot rotary tiller with 48 boron steel L-type blades. Suitable for 50-65 HP tractors.",
    image_url: "/images/machines/shaktiman_rotavator_7ft.jpg",
    location: "Tanuku",
    rental_rate: 350,
    rate_unit: "hr",
    availability: "available",
    condition: "Good",
    specifications: "7 Feet Width, 48 Boron Blades, Side Gear Drive",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-3b",
    farmer_id: "farmer-103b",
    owner_name: "G. Prasad",
    owner_phone: "9848033445",
    name: "Kuhn EL201 Heavy Duty Rotavator",
    category: "Rotavator",
    description: "Heavy-duty 7-foot rotary tiller with reinforced gear drive and curved tines for deep soil pulverization and seedbed preparation.",
    image_url: "/images/machines/kuhn_el201_rotavator.jpg",
    location: "Bhimavaram",
    rental_rate: 380,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "Heavy Duty Gear Drive, Multi-speed Gearbox, Curved Boron Tines",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 4. CULTIVATORS (2 items)
  {
    id: "m-6",
    farmer_id: "farmer-106",
    owner_name: "Subba Raju",
    owner_phone: "9848067890",
    name: "Husqvarna T-550 R Power Tiller (5.5 HP)",
    category: "Cultivator",
    description: "Compact 5.5 HP walk-behind power tiller with reverse gear and adjustable tines for inter-crop weeding and horticulture beds.",
    image_url: "/images/machines/husqvarna_t550r_power_tiller.jpg",
    location: "Kakinada",
    rental_rate: 250,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "5.5 HP Petrol Engine, 80cm Working Width, Reverse Gear",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-6d",
    farmer_id: "farmer-106d",
    owner_name: "D. Apparao",
    owner_phone: "9848066990",
    name: "Honda Single-Axle Rotary Cultivator / Tiller",
    category: "Cultivator",
    description: "Versatile single-axle walking cultivator with rotary tines for inter-cultivation, weeding, and vegetable bed aeration.",
    image_url: "/images/machines/honda_power_tiller_cultivator.jpg",
    location: "Tanuku",
    rental_rate: 300,
    rate_unit: "hr",
    availability: "available",
    condition: "Good",
    specifications: "Single-Axle Petrol Engine, Rotary Cultivation Tines, Adjustable Depth Skids",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 5. SEEDERS (2 items)
  {
    id: "m-7",
    farmer_id: "farmer-107",
    owner_name: "Koteswara Rao",
    owner_phone: "9848078901",
    name: "Accord Automatic 9-Row Seed Drill",
    category: "Seeder",
    description: "Tractor-drawn automatic 9-row seed drill with metered seed box and adjustable furrow openers for wheat, pulses, and oilseeds.",
    image_url: "/images/machines/accord_seed_drill_9row.jpg",
    location: "Rajahmundry",
    rental_rate: 280,
    rate_unit: "hr",
    availability: "available",
    condition: "Good",
    specifications: "9 Rows, Fluted Roller Metering, Dual Hopper Box",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-7d",
    farmer_id: "farmer-107d",
    owner_name: "B. Sambasiva Rao",
    owner_phone: "9848077101",
    name: "Becker Aeromat Pneumatic Precision Planter",
    category: "Seeder",
    description: "Pneumatic vacuum precision planter for accurate single-seed placement of maize, cotton, sunflower, and soybean.",
    image_url: "/images/machines/becker_precision_planter.jpg",
    location: "Vijayawada",
    rental_rate: 450,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "Vacuum Precision Metering, 4 Rows, Adjustable Row Spacing",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 6. SPRAYERS (2 items)
  {
    id: "m-4",
    farmer_id: "farmer-104",
    owner_name: "Appala Naidu",
    owner_phone: "9848045678",
    name: "Multi-Crop Power Sprayer 20L",
    category: "Sprayer",
    description: "2-stroke petrol backpack power sprayer with 20-litre chemical tank. Includes triple nozzle lance and brass pump.",
    image_url: "/images/machines/knapsack_power_sprayer_20l.jpg",
    location: "Mandapeta",
    rental_rate: 150,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "20L Tank, 26cc 2-Stroke, Triple Nozzle Brass Lance",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-4b",
    farmer_id: "farmer-104b",
    owner_name: "Y. Veerabhadra Rao",
    owner_phone: "9848044556",
    name: "Fieldking 400L Tractor Boom Sprayer",
    category: "Sprayer",
    description: "400-litre tractor PTO-driven boom sprayer with 12-meter folding spray booms for fast, uniform field chemical application.",
    image_url: "/images/machines/fieldking_boom_sprayer_400l.jpg",
    location: "Guntur",
    rental_rate: 400,
    rate_unit: "hr",
    availability: "available",
    condition: "Good",
    specifications: "400L Polyethylene Tank, 12m Folding Boom, PTO Driven Diaphragm Pump",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 7. WATER PUMPS (4 items)
  {
    id: "m-5",
    farmer_id: "farmer-105",
    owner_name: "Krishna Murthy",
    owner_phone: "9848056789",
    name: "Honda 5 HP Portable Diesel Water Pump",
    category: "Water Pump",
    description: "High-pressure 5 HP portable agricultural water pump with 3-inch delivery outlet for canal, stream, and field irrigation.",
    image_url: "/images/machines/honda_diesel_water_pump.jpg",
    location: "Guntur",
    rental_rate: 200,
    rate_unit: "hr",
    availability: "available",
    condition: "Good",
    specifications: "5 HP Engine, 3-inch Delivery Pipe, 1000L/min Flow",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-5b",
    farmer_id: "farmer-105b",
    owner_name: "K. Ramachandra Murthy",
    owner_phone: "9848055667",
    name: "Kirloskar 7.5 HP Diesel Agricultural Pump",
    category: "Water Pump",
    description: "Heavy-duty 7.5 HP stationary field diesel pump set with 4-inch high discharge pipe for canal and open pond water lifting.",
    image_url: "/images/machines/kirloskar_diesel_water_pump.jpg",
    location: "Tanuku",
    rental_rate: 250,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "7.5 HP Stationary Diesel Engine, 4-inch Outlet, Cast Iron Casing",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-5c",
    farmer_id: "farmer-105c",
    owner_name: "T. Somaraju",
    owner_phone: "9848055778",
    name: "Crompton 5 HP Submersible Farm Well Pump",
    category: "Water Pump",
    description: "Deep borewell 5 HP multistage water-filled submersible agricultural pump set with control panel box.",
    image_url: "/images/machines/crompton_submersible_pump.jpg",
    location: "Eluru",
    rental_rate: 220,
    rate_unit: "hr",
    availability: "available",
    condition: "Good",
    specifications: "5 HP 3-Phase Submersible, 10 Stages, Stainless Steel Jacket",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-5d",
    farmer_id: "farmer-105d",
    owner_name: "A. Suryanarayana",
    owner_phone: "9848055889",
    name: "Texmo 3 HP Monoblock Irrigation Water Pump",
    category: "Water Pump",
    description: "Single-phase 3 HP heavy cast iron monoblock centrifugal pump for lifting water from open wells, tanks, and channels.",
    image_url: "/images/machines/texmo_monoblock_pump.jpg",
    location: "Rajahmundry",
    rental_rate: 180,
    rate_unit: "hr",
    availability: "available",
    condition: "Good",
    specifications: "3 HP Single Phase, Heavy Cast Iron Body, High Discharge",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 8. IRRIGATION EQUIPMENT (2 items)
  {
    id: "m-8",
    farmer_id: "farmer-108",
    owner_name: "Chiranjeevi",
    owner_phone: "9848089012",
    name: "Jain Drip & Sprinkler Irrigation System",
    category: "Irrigation Equipment",
    description: "Complete 2-acre sprinkler irrigation setup with 30 HDPE pipes, brass rotary sprinkler heads, and quick-latch couplers.",
    image_url: "/images/machines/jain_sprinkler_system.jpg",
    location: "Vijayawada",
    rental_rate: 800,
    rate_unit: "day",
    availability: "available",
    condition: "Good",
    specifications: "2 Acre Coverage, 30 HDPE Pipes, Brass Rotary Heads",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-8b",
    farmer_id: "farmer-108b",
    owner_name: "P. Bhaskar Rao",
    owner_phone: "9848088990",
    name: "Netafim Micro Drip Irrigation Kit 1-Acre",
    category: "Irrigation Equipment",
    description: "Complete 1-acre micro drip irrigation kit featuring inline pressure compensating dripper lines, screen filter, and fittings.",
    image_url: "/images/machines/netafim_drip_irrigation_kit.jpg",
    location: "Guntur",
    rental_rate: 600,
    rate_unit: "day",
    availability: "available",
    condition: "Excellent",
    specifications: "Inline Dripper Tubes, Screen Filter, Venturi Injector",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 9. POWER TOOLS (3 items)
  {
    id: "m-9",
    farmer_id: "farmer-109",
    owner_name: "Satish Kumar",
    owner_phone: "9848090123",
    name: "STIHL Power Weeder & Brush Cutter 2.2 HP",
    category: "Power Tool",
    description: "Multi-attachment STIHL power weeder with 2.2 HP 2-stroke petrol motor, nylon trimmer head, and 8-tooth clearing blade.",
    image_url: "/images/machines/stihl_brush_cutter.jpg",
    location: "Eluru",
    rental_rate: 200,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "2.2 HP Petrol Engine, Nylon Trimmer Head, 8T Metal Blade",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-9b",
    farmer_id: "farmer-109b",
    owner_name: "L. Srinivas",
    owner_phone: "9848099001",
    name: "STIHL MS 362 C Chainsaw 3.5 HP",
    category: "Power Tool",
    description: "Heavy-duty 3.5 HP 59cc professional petrol chainsaw with 20-inch guide bar for farm forestry, orchard pruning, and timber cutting.",
    image_url: "/images/machines/stihl_ms362c_chainsaw.jpg",
    location: "Rajahmundry",
    rental_rate: 220,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "59cc / 3.5 HP Engine, 20-inch Guide Bar, Anti-Vibration System",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-9c",
    farmer_id: "farmer-109c",
    owner_name: "K. Sreeram",
    owner_phone: "9848099112",
    name: "Ferguson Tractor 3-Point Earth Auger / Post Hole Digger",
    category: "Power Tool",
    description: "Heavy-duty tractor PTO-driven 3-point earth auger with replaceable hardened cutting blades for orchard planting and fencing posts.",
    image_url: "/images/machines/tractor_post_hole_auger.jpg",
    location: "Kakinada",
    rental_rate: 350,
    rate_unit: "hr",
    availability: "available",
    condition: "Good",
    specifications: "PTO Driven, 3-Point Hitch, Replaceable Hardened Cutting Bit",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 10. OTHER AGRICULTURAL EQUIPMENT (4 items)
  {
    id: "m-10",
    farmer_id: "farmer-110",
    owner_name: "Babu Rao",
    owner_phone: "9848091234",
    name: "Hydraulic Tipping Tractor Trolley 5-Ton",
    category: "Other",
    description: "Heavy-duty 5-tonne single-axle hydraulic tipping tractor trailer for agricultural crop haulage, silage, and produce transport.",
    image_url: "/images/machines/tipping_trailer_5ton.jpg",
    location: "Tanuku",
    rental_rate: 600,
    rate_unit: "day",
    availability: "available",
    condition: "Good",
    specifications: "5-Ton Capacity, Single Axle, Hydraulic Ram Lift",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-10b",
    farmer_id: "farmer-110b",
    owner_name: "R. Jagannadham",
    owner_phone: "9848091122",
    name: "Fieldking 3-Bottom Hydraulic Reversible MB Plough",
    category: "Other",
    description: "Hydraulic reversible mouldboard (MB) plough for deep primary tillage, weed inversion, and soil aeration.",
    image_url: "/images/machines/reversible_mb_plough.jpg",
    location: "Guntur",
    rental_rate: 320,
    rate_unit: "hr",
    availability: "available",
    condition: "Good",
    specifications: "3 Bottom MB Plough, High Carbon Steel, Hydraulic Turnover",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-10c",
    farmer_id: "farmer-110c",
    owner_name: "P. Someswara Rao",
    owner_phone: "9848091233",
    name: "Redlands Sugarcane Trash Shredder & Mulcher",
    category: "Other",
    description: "Tractor PTO-driven heavy flail mulcher for shredding sugarcane residue, stalks, and crop trash into organic soil mulch.",
    image_url: "/images/machines/sugarcane_trash_shredder.jpg",
    location: "Mandapeta",
    rental_rate: 450,
    rate_unit: "hr",
    availability: "available",
    condition: "Good",
    specifications: "Tractor PTO Shaft Driven, Heavy Flail Blades, Organic Mulch",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-10d",
    farmer_id: "farmer-110d",
    owner_name: "V. Apparao",
    owner_phone: "9848091344",
    name: "Grain Solar Dryer Portable Chamber 500kg",
    category: "Other",
    description: "Solar-powered agricultural grain and spice drying chamber with forced air ventilation for hygienic, uniform crop drying.",
    image_url: "/images/machines/grain_solar_dryer.jpg",
    location: "Vijayawada",
    rental_rate: 400,
    rate_unit: "day",
    availability: "available",
    condition: "Good",
    specifications: "500kg Batch Capacity, Solar Powered Fans, UV Sheet",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const GENERIC_MACHINE_IMAGES = [
  "/images/machines/sonalika_745_tractor.jpg",
  "/images/machines/kubota_dc68g_harvester.jpg",
  "/images/machines/john_deere_w70_harvester.jpg",
  "/images/machines/preet_987_harvester.jpg",
  "/images/machines/harvester.jpg",
  "/images/machines/honda_5hp_water_pump.jpg",
  "/images/machines/kirloskar_7hp_diesel_pump.jpg",
  "/images/machines/swan_9tyne_cultivator.jpg",
  "/images/machines/fieldking_11tyne_cultivator.jpg",
  "/images/machines/cultivator.jpg",
  "/images/machines/hydraulic_tipping_trolley.jpg",
  "/images/machines/trolley.jpg",
  "/images/machines/power_tools.jpg",
  "/images/machines/irrigation.jpg",
  "/images/machines/seeder.jpg",
  "/images/machines/sprayer.jpg",
];

const SPECIFIC_MACHINE_IMAGES: Record<string, string> = {
  // Tractors
  "Mahindra E350-DI Tractor (35 HP)": "/images/machines/mahindra_575_tractor.jpg",
  "John Deere 6310 Tractor with Front Loader (100 HP)": "/images/machines/john_deere_5310_tractor.jpg",
  "Swaraj 735 FE Tractor (40 HP)": "/images/machines/swaraj_735_fe_tractor.jpg",
  "Sonalika Baagban DI-30 RX Tractor (30 HP)": "/images/machines/sonalika_di30_tractor.jpg",

  // Harvesters
  "Kubota Harvester DC-60 (60 HP)": "/images/machines/kubota_dc60_harvester.jpg",
  "John Deere 2266 Extra Combine Harvester (240 HP)": "/images/machines/john_deere_combine_harvester.jpg",
  "New Holland TC5.30 Combine Harvester": "/images/machines/new_holland_tc530_combine.jpg",

  // Rotavators
  "Shaktiman Rotavator 7 Feet": "/images/machines/shaktiman_rotavator_7ft.jpg",
  "Kuhn EL201 Heavy Duty Rotavator": "/images/machines/kuhn_el201_rotavator.jpg",

  // Cultivators
  "Husqvarna T-550 R Power Tiller (5.5 HP)": "/images/machines/husqvarna_t550r_power_tiller.jpg",
  "Honda Single-Axle Rotary Cultivator / Tiller": "/images/machines/honda_power_tiller_cultivator.jpg",

  // Seeders
  "Accord Automatic 9-Row Seed Drill": "/images/machines/accord_seed_drill_9row.jpg",
  "Becker Aeromat Pneumatic Precision Planter": "/images/machines/becker_precision_planter.jpg",

  // Sprayers
  "Multi-Crop Power Sprayer 20L": "/images/machines/knapsack_power_sprayer_20l.jpg",
  "Fieldking 400L Tractor Boom Sprayer": "/images/machines/fieldking_boom_sprayer_400l.jpg",

  // Water Pumps
  "Honda 5 HP Portable Diesel Water Pump": "/images/machines/honda_diesel_water_pump.jpg",
  "Kirloskar 7.5 HP Diesel Agricultural Pump": "/images/machines/kirloskar_diesel_water_pump.jpg",
  "Crompton 5 HP Submersible Farm Well Pump": "/images/machines/crompton_submersible_pump.jpg",
  "Texmo 3 HP Monoblock Irrigation Water Pump": "/images/machines/texmo_monoblock_pump.jpg",

  // Irrigation Equipment
  "Jain Drip & Sprinkler Irrigation System": "/images/machines/jain_sprinkler_system.jpg",
  "Netafim Micro Drip Irrigation Kit 1-Acre": "/images/machines/netafim_drip_irrigation_kit.jpg",

  // Power Tools
  "STIHL Power Weeder & Brush Cutter 2.2 HP": "/images/machines/stihl_brush_cutter.jpg",
  "STIHL MS 362 C Chainsaw 3.5 HP": "/images/machines/stihl_ms362c_chainsaw.jpg",
  "Ferguson Tractor 3-Point Earth Auger / Post Hole Digger": "/images/machines/tractor_post_hole_auger.jpg",

  // Other Equipment
  "Hydraulic Tipping Tractor Trolley 5-Ton": "/images/machines/tipping_trailer_5ton.jpg",
  "Fieldking 3-Bottom Hydraulic Reversible MB Plough": "/images/machines/reversible_mb_plough.jpg",
  "Redlands Sugarcane Trash Shredder & Mulcher": "/images/machines/sugarcane_trash_shredder.jpg",
  "Grain Solar Dryer Portable Chamber 500kg": "/images/machines/grain_solar_dryer.jpg",
};

export function getEquipmentImage(name?: string | null, category?: string | null, currentUrl?: string | null): string {
  if (name) {
    const titleTrimmed = name.trim();
    if (SPECIFIC_MACHINE_IMAGES[titleTrimmed]) {
      return SPECIFIC_MACHINE_IMAGES[titleTrimmed];
    }
  }

  if (currentUrl && currentUrl.startsWith("/images/machines/") && !GENERIC_MACHINE_IMAGES.includes(currentUrl)) {
    return currentUrl;
  }

  const lowerName = (name || "").toLowerCase();

  if (lowerName.includes("mahindra")) return "/images/machines/mahindra_575_tractor.jpg";
  if (lowerName.includes("new holland")) return "/images/machines/new_holland_tc530_combine.jpg";
  if ((lowerName.includes("combine") || lowerName.includes("harvester")) && lowerName.includes("john deere")) return "/images/machines/john_deere_combine_harvester.jpg";
  if (lowerName.includes("john deere")) return "/images/machines/john_deere_5310_tractor.jpg";
  if (lowerName.includes("swaraj")) return "/images/machines/swaraj_735_fe_tractor.jpg";
  if (lowerName.includes("sonalika")) return "/images/machines/sonalika_di30_tractor.jpg";
  if (lowerName.includes("kubota")) return "/images/machines/kubota_dc60_harvester.jpg";
  if (lowerName.includes("kuhn")) return "/images/machines/kuhn_el201_rotavator.jpg";
  if (lowerName.includes("shaktiman") || lowerName.includes("rotavator")) return "/images/machines/shaktiman_rotavator_7ft.jpg";
  if (lowerName.includes("husqvarna")) return "/images/machines/husqvarna_t550r_power_tiller.jpg";
  if (lowerName.includes("honda") && (lowerName.includes("cultivator") || lowerName.includes("tiller"))) return "/images/machines/honda_power_tiller_cultivator.jpg";
  if (lowerName.includes("accord") || (lowerName.includes("seed") && lowerName.includes("drill"))) return "/images/machines/accord_seed_drill_9row.jpg";
  if (lowerName.includes("planter") || lowerName.includes("precision")) return "/images/machines/becker_precision_planter.jpg";
  if (lowerName.includes("boom") || (lowerName.includes("sprayer") && lowerName.includes("400l"))) return "/images/machines/fieldking_boom_sprayer_400l.jpg";
  if (lowerName.includes("knapsack") || lowerName.includes("power sprayer")) return "/images/machines/knapsack_power_sprayer_20l.jpg";
  if (lowerName.includes("kirloskar")) return "/images/machines/kirloskar_diesel_water_pump.jpg";
  if (lowerName.includes("honda") && (lowerName.includes("pump") || lowerName.includes("water"))) return "/images/machines/honda_diesel_water_pump.jpg";
  if (lowerName.includes("texmo") || lowerName.includes("monoblock")) return "/images/machines/texmo_monoblock_pump.jpg";
  if (lowerName.includes("submersible") || lowerName.includes("crompton")) return "/images/machines/crompton_submersible_pump.jpg";
  if (lowerName.includes("netafim") || lowerName.includes("drip")) return "/images/machines/netafim_drip_irrigation_kit.jpg";
  if (lowerName.includes("jain") || lowerName.includes("sprinkler")) return "/images/machines/jain_sprinkler_system.jpg";
  if (lowerName.includes("brush cutter") || (lowerName.includes("weeder") && lowerName.includes("stihl"))) return "/images/machines/stihl_brush_cutter.jpg";
  if (lowerName.includes("stihl") || lowerName.includes("chainsaw")) return "/images/machines/stihl_ms362c_chainsaw.jpg";
  if (lowerName.includes("auger") || lowerName.includes("hole digger") || lowerName.includes("earth")) return "/images/machines/tractor_post_hole_auger.jpg";
  if (lowerName.includes("trolley") || lowerName.includes("trailer") || lowerName.includes("tipping")) return "/images/machines/tipping_trailer_5ton.jpg";
  if (lowerName.includes("plough") || lowerName.includes("plow")) return "/images/machines/reversible_mb_plough.jpg";
  if (lowerName.includes("mulcher") || lowerName.includes("shredder")) return "/images/machines/sugarcane_trash_shredder.jpg";
  if (lowerName.includes("solar dryer") || lowerName.includes("dryer")) return "/images/machines/grain_solar_dryer.jpg";

  return getEquipmentPlaceholder(category || "Farm Equipment", name || undefined);
}

function getLocalMachines(): DbMachine[] {
  if (typeof window === "undefined") return INITIAL_STATIC_MACHINES;
  try {
    const data = localStorage.getItem(LOCAL_MACHINES_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length >= INITIAL_STATIC_MACHINES.length) {
        return parsed.map((item: DbMachine) => {
          return {
            ...item,
            image_url: getEquipmentImage(item.name, item.category, item.image_url)
          };
        });
      }
    }
  } catch (e) {
    console.error("Failed to read local machines:", e);
  }
  saveLocalMachines(INITIAL_STATIC_MACHINES);
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
        return (data as DbMachine[])
          .filter((item) => item.status === "active" || !item.status)
          .map((item) => ({
            ...item,
            image_url: getEquipmentImage(item.name, item.category, item.image_url)
          }));
      }
    } catch (err) {
      console.warn("Supabase fetch failed for machines_tools, using local storage", err);
    }
  }

  // Fallback filtering
  let list = getLocalMachines().filter((m) => m.status === "active" || !m.status);
  if (options?.category && options.category !== "all") {
    const normSearch = options.category.toLowerCase().replace(/s$/, "");
    list = list.filter((m) => {
      const catLower = m.category.toLowerCase();
      return catLower === options.category?.toLowerCase() ||
             catLower.includes(normSearch) ||
             options.category?.toLowerCase().includes(catLower);
    });
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
    image_url: input.image_url || getEquipmentImage(input.name, input.category, null),
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
