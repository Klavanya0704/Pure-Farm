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

const LOCAL_MACHINES_KEY = "purefarm_local_machines_listings_v2";

const INITIAL_STATIC_MACHINES: DbMachine[] = [
  // 1. TRACTORS (4 items)
  {
    id: "m-1",
    farmer_id: "farmer-101",
    owner_name: "Ramesh Varma",
    owner_phone: "9848012345",
    name: "Mahindra 575 DI Tractor (45 HP)",
    category: "Tractor",
    description: "Multi-purpose 45 HP red diesel agricultural tractor with power steering and dual clutch. Ideal for tilling, ploughing, and transport.",
    image_url: "/images/machines/tractor.jpg",
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
    id: "m-1b",
    farmer_id: "farmer-101b",
    owner_name: "K. Srinivasa Rao",
    owner_phone: "9848011223",
    name: "John Deere 5310 GearPro Tractor (55 HP)",
    category: "Tractor",
    description: "High power 55 HP heavy-duty tractor equipped with 12F+4R gear transmission, oil immersed disc brakes, and high torque output.",
    image_url: "/images/machines/tractor.jpg",
    location: "Vijayawada",
    rental_rate: 650,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "55 HP Power Steering, 12F+4R Gearbox, Oil Immersed Brakes",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-1c",
    farmer_id: "farmer-101c",
    owner_name: "M. Nageswara Rao",
    owner_phone: "9848011334",
    name: "Swaraj 744 FE Multi-Speed Tractor (48 HP)",
    category: "Tractor",
    description: "Reliable 48 HP 3-cylinder diesel tractor with multi-speed PTO, dual clutch, and 2000kg hydraulic lift capacity for heavy soil tilling.",
    image_url: "/images/machines/tractor.jpg",
    location: "Guntur",
    rental_rate: 520,
    rate_unit: "hr",
    availability: "available",
    condition: "Good",
    specifications: "48 HP 3-Cylinder Diesel, Direction Control Valve, 2000kg Lift",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-1d",
    farmer_id: "farmer-101d",
    owner_name: "P. Venkateswarlu",
    owner_phone: "9848011445",
    name: "Sonalika DI 745 III Sikander (50 HP)",
    category: "Tractor",
    description: "50 HP heavy-duty agricultural tractor engineered for low fuel consumption and high pulling force with subsoilers and haulage.",
    image_url: "/images/machines/tractor.jpg",
    location: "Eluru",
    rental_rate: 550,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "50 HP Engine, High Torque, Power Steering, Constant Mesh",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 2. HARVESTERS (4 items)
  {
    id: "m-2",
    farmer_id: "farmer-102",
    owner_name: "Venkat Rao",
    owner_phone: "9848023456",
    name: "Kubota Harvester DC-68G",
    category: "Harvester",
    description: "High performance paddy & wheat combine harvester operating in field with 68 HP diesel engine for quick harvesting.",
    image_url: "/images/machines/harvester.jpg",
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
    id: "m-2b",
    farmer_id: "farmer-102b",
    owner_name: "B. Appala Naidu",
    owner_phone: "9848022334",
    name: "John Deere W70 Grain Combine Harvester",
    category: "Harvester",
    description: "100 HP turbocharged self-propelled combine harvester with 14-foot cutter bar and active grain loss monitor for large fields.",
    image_url: "/images/machines/harvester.jpg",
    location: "Vijayawada",
    rental_rate: 2100,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "100 HP Turbocharged, 14-ft Cutter Bar, Grain Loss Monitor",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-2c",
    farmer_id: "farmer-102c",
    owner_name: "Ch. Satyanarayana",
    owner_phone: "9848022445",
    name: "Preet 987 Paddy Combine Harvester",
    category: "Harvester",
    description: "Heavy duty 101 HP paddy crawler combine with heavy-duty rubber tracks for harvesting in wet muddy paddy fields.",
    image_url: "/images/machines/harvester.jpg",
    location: "Tanuku",
    rental_rate: 1950,
    rate_unit: "hr",
    availability: "available",
    condition: "Good",
    specifications: "101 HP Engine, Straw Chopper Attachment, Rubber Tracks",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-2d",
    farmer_id: "farmer-102d",
    owner_name: "T. Rama Krishna",
    owner_phone: "9848022556",
    name: "New Holland TC5.30 Combine Harvester",
    category: "Harvester",
    description: "130 HP multi-crop combine harvester with rotary separator and dual drum paddy threshing mechanism.",
    image_url: "/images/machines/harvester.jpg",
    location: "Guntur",
    rental_rate: 2200,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "130 HP Engine, Rotary Separator, Dual Drum Threshing",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 3. ROTAVATORS (4 items)
  {
    id: "m-3",
    farmer_id: "farmer-103",
    owner_name: "Appa Rao",
    owner_phone: "9848034567",
    name: "Shaktiman Rotavator 7 Feet",
    category: "Rotavator",
    description: "Heavy duty 7-foot tractor-mounted rotary tiller with 48 blades for fine seedbed preparation.",
    image_url: "/images/machines/rotavator.jpg",
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
    id: "m-3b",
    farmer_id: "farmer-103b",
    owner_name: "V. Sambasiva Rao",
    owner_phone: "9848033445",
    name: "Maschio Gaspardo Virtus 6-Foot Rotavator",
    category: "Rotavator",
    description: "Italian boron steel 42-blade rotavator engineered for smooth soil pulverization and residue incorporation.",
    image_url: "/images/machines/rotavator.jpg",
    location: "Mandapeta",
    rental_rate: 420,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "42 Boron Steel Blades, Heavy Duty Side Gear Drive",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-3c",
    farmer_id: "farmer-103c",
    owner_name: "K. Subrahmanyam",
    owner_phone: "9848033556",
    name: "Fieldking Heavy Duty 8-Foot Rotavator",
    category: "Rotavator",
    description: "Wide 8-foot tractor rotavator with 54 L-type blades suitable for tractors above 50 HP for fast land preparation.",
    image_url: "/images/machines/rotavator.jpg",
    location: "Rajahmundry",
    rental_rate: 480,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "54 L-Type Blades, Dual Crown Multi-Speed Gearbox",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-3d",
    farmer_id: "farmer-103d",
    owner_name: "G. Trimurtulu",
    owner_phone: "9848033667",
    name: "Dasmesh 642 Heavy Duty Paddy Rotavator",
    category: "Rotavator",
    description: "Specialized wet land paddy rotavator with waterproof bearing seals and 36 C-type blades for thorough puddling.",
    image_url: "/images/machines/rotavator.jpg",
    location: "Kakinada",
    rental_rate: 440,
    rate_unit: "hr",
    availability: "available",
    condition: "Good",
    specifications: "Waterproof Bearing Seal, 36 C-Type Blades for Wet Tillage",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 4. CULTIVATORS (4 items)
  {
    id: "m-6",
    farmer_id: "farmer-106",
    owner_name: "Rambabu",
    owner_phone: "9848067890",
    name: "STIHL Heavy Duty Power Tiller 7.5 HP",
    category: "Cultivator",
    description: "Heavy duty petrol power tiller cultivator with visible tines for orchard tilling and weeding.",
    image_url: "/images/machines/cultivator.jpg",
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
    id: "m-6b",
    farmer_id: "farmer-106b",
    owner_name: "D. Prasad",
    owner_phone: "9848066778",
    name: "Swan 9-Tyne Rigid Frame Field Cultivator",
    category: "Cultivator",
    description: "Tractor-mounted 9-tyne rigid cultivator with forged steel tynes for hard soil loosening and primary tillage.",
    image_url: "/images/machines/cultivator.jpg",
    location: "Rajahmundry",
    rental_rate: 300,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "9 Forged Steel Tynes, Heavy Channel Frame, 35+ HP Mount",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-6c",
    farmer_id: "farmer-106c",
    owner_name: "Y. Ramana",
    owner_phone: "9848066889",
    name: "Fieldking 11-Tyne Spring Loaded Cultivator",
    category: "Cultivator",
    description: "Heavy-duty 11-tyne spring-loaded cultivator designed for stony soils with high clearance and reversible carbon shovels.",
    image_url: "/images/machines/cultivator.jpg",
    location: "Vijayawada",
    rental_rate: 380,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "High-Tensile Springs, Reversible Carbon Shovels, 11 Tynes",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-6d",
    farmer_id: "farmer-106d",
    owner_name: "S. V. Ramana",
    owner_phone: "9848066990",
    name: "VST Shakti 13 HP Power Tiller / Cultivator",
    category: "Cultivator",
    description: "13 HP diesel water-cooled power tiller equipped with 18-blade rotary tiller for inter-cultivation and vegetable plots.",
    image_url: "/images/machines/cultivator.jpg",
    location: "Tanuku",
    rental_rate: 320,
    rate_unit: "hr",
    availability: "available",
    condition: "Good",
    specifications: "13 HP Diesel Engine, 18-Blade Rotary Tiller",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 5. SEEDERS (4 items)
  {
    id: "m-7",
    farmer_id: "farmer-107",
    owner_name: "Subba Rao",
    owner_phone: "9848078901",
    name: "National Automatic 9-Row Seed Drill",
    category: "Seeder",
    description: "Tractor-mounted 9-row automatic seed drill and fertilizer applicator for precise sowing.",
    image_url: "/images/machines/seeder.jpg",
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
    id: "m-7b",
    farmer_id: "farmer-107b",
    owner_name: "N. Veeraiah",
    owner_phone: "9848077889",
    name: "Khedut 11-Row Zero Tillage Seed Drill",
    category: "Seeder",
    description: "Direct seed drill allowing sowing without prior tilling, saving fuel and conserving soil moisture.",
    image_url: "/images/machines/seeder.jpg",
    location: "Guntur",
    rental_rate: 450,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "11 Rows, Fluted Roller Metering, Zero Tillage",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-7c",
    farmer_id: "farmer-107c",
    owner_name: "K. Tirupati Rao",
    owner_phone: "9848077990",
    name: "Landforce Paddy Drum Seeder (Manual 8-Row)",
    category: "Seeder",
    description: "Lightweight 8-row direct paddy drum seeder for sprouted paddy seeds in prepared puddled fields.",
    image_url: "/images/machines/seeder.jpg",
    location: "Eluru",
    rental_rate: 150,
    rate_unit: "day",
    availability: "available",
    condition: "Good",
    specifications: "8 Rows Direct Sowing, Fiber Drums, Lightweight Pull",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-7d",
    farmer_id: "farmer-107d",
    owner_name: "M. Durga Prasad",
    owner_phone: "9848077101",
    name: "Pneumatic Precision Planter & Maize Seeder",
    category: "Seeder",
    description: "Pneumatic vacuum precision planter for single-seed placement of maize, cotton, and sunflower seeds.",
    image_url: "/images/machines/seeder.jpg",
    location: "Kakinada",
    rental_rate: 600,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "Vacuum Precision Metering, 4 Rows, Adjustable Spacing",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 6. SPRAYERS (4 items)
  {
    id: "m-4",
    farmer_id: "farmer-104",
    owner_name: "Satyanarayana",
    owner_phone: "9848045678",
    name: "Multi-Crop Power Sprayer 20L",
    category: "Sprayer",
    description: "12V battery-operated 20L backpack power sprayer with dual brass nozzles for pesticide spray.",
    image_url: "/images/machines/sprayer.jpg",
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
    id: "m-4b",
    farmer_id: "farmer-104b",
    owner_name: "B. Srinivas",
    owner_phone: "9848044556",
    name: "Fieldking 400L Tractor Boom Sprayer",
    category: "Sprayer",
    description: "400-litre tractor PTO-driven boom sprayer with 12-meter folding spray booms for fast field chemical treatment.",
    image_url: "/images/machines/sprayer.jpg",
    location: "Guntur",
    rental_rate: 800,
    rate_unit: "day",
    availability: "available",
    condition: "Excellent",
    specifications: "400L Polyethylene Tank, 12m Folding Boom, PTO Pump",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-4c",
    farmer_id: "farmer-104c",
    owner_name: "K. Babu",
    owner_phone: "9848044667",
    name: "Aspee Marut Foot-Operated Orchard Sprayer",
    category: "Sprayer",
    description: "High-pressure foot sprayer with brass pump cylinder and long delivery hose for orchard trees.",
    image_url: "/images/machines/sprayer.jpg",
    location: "Mandapeta",
    rental_rate: 180,
    rate_unit: "day",
    availability: "available",
    condition: "Good",
    specifications: "Brass Pump Barrel, 2m Extension Rod, High Pressure Hose",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-4d",
    farmer_id: "farmer-104d",
    owner_name: "G. Krishna",
    owner_phone: "9848044778",
    name: "KisanKraft 4-Stroke Petrol Engine Power Sprayer",
    category: "Sprayer",
    description: "Portable 31cc 4-stroke petrol engine power sprayer with 50-meter hose reel for spraying fruit gardens and field crops.",
    image_url: "/images/machines/sprayer.jpg",
    location: "Vijayawada",
    rental_rate: 350,
    rate_unit: "day",
    availability: "available",
    condition: "Excellent",
    specifications: "31cc 4-Stroke Engine, 50m Hose Reel, High Jet Pressure",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 7. WATER PUMPS (4 items)
  {
    id: "m-5",
    farmer_id: "farmer-105",
    owner_name: "Krishna Reddy",
    owner_phone: "9848056789",
    name: "Honda 5 HP High Pressure Water Pump",
    category: "Water Pump",
    description: "4-stroke petrol 3-inch agricultural irrigation water pump for high volume field watering.",
    image_url: "/images/machines/water_pump.jpg",
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
    id: "m-5b",
    farmer_id: "farmer-105b",
    owner_name: "P. Satyanarayana",
    owner_phone: "9848055667",
    name: "Kirloskar 7.5 HP Diesel Agricultural Pump",
    category: "Water Pump",
    description: "Heavy duty single cylinder diesel water pump coupled with 4-inch high discharge centrifugal pump.",
    image_url: "/images/machines/water_pump.jpg",
    location: "Eluru",
    rental_rate: 400,
    rate_unit: "day",
    availability: "available",
    condition: "Excellent",
    specifications: "7.5 HP Air-Cooled Diesel, 4-inch Suction & Delivery",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-5c",
    farmer_id: "farmer-105c",
    owner_name: "V. Chalapathi",
    owner_phone: "9848055778",
    name: "Crompton 5 HP Submersible Farm Well Pump",
    category: "Water Pump",
    description: "5 HP 3-phase open well submersible pump set engineered for continuous agricultural irrigation from open wells.",
    image_url: "/images/machines/water_pump.jpg",
    location: "Rajahmundry",
    rental_rate: 350,
    rate_unit: "day",
    availability: "available",
    condition: "Excellent",
    specifications: "5 HP 3-Phase Motor, Stainless Steel Impellers, High Head",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-5d",
    farmer_id: "farmer-105d",
    owner_name: "K. Adinarayana",
    owner_phone: "9848055889",
    name: "Texmo 3 HP Monoblock Irrigation Water Pump",
    category: "Water Pump",
    description: "Single-phase 3 HP monoblock pump suitable for lifting water from canals, ponds, and shallow borewells.",
    image_url: "/images/machines/water_pump.jpg",
    location: "Kakinada",
    rental_rate: 280,
    rate_unit: "day",
    availability: "available",
    condition: "Good",
    specifications: "3 HP Single Phase, Heavy Cast Iron Body, High Discharge",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 8. IRRIGATION EQUIPMENT (4 items)
  {
    id: "m-8",
    farmer_id: "farmer-108",
    owner_name: "Narasimha Rao",
    owner_phone: "9848089012",
    name: "Jain Drip & Sprinkler Irrigation System",
    category: "Irrigation Equipment",
    description: "Portable agricultural sprinkler set with 30 nozzles and quick-fit HDPE pipes for 2-acre coverage.",
    image_url: "/images/machines/irrigation.jpg",
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
    id: "m-8b",
    farmer_id: "farmer-108b",
    owner_name: "S. Govind",
    owner_phone: "9848088990",
    name: "Netafim Micro Drip Irrigation Kit 1-Acre",
    category: "Irrigation Equipment",
    description: "Complete 1-acre drip irrigation kit featuring inline pressure compensating drippers, screen filter, and venturi injector.",
    image_url: "/images/machines/irrigation.jpg",
    location: "Guntur",
    rental_rate: 500,
    rate_unit: "day",
    availability: "available",
    condition: "Excellent",
    specifications: "Inline Dripper Tubes, Screen Filter, Venturi Injector",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-8c",
    farmer_id: "farmer-108c",
    owner_name: "Ch. Subbaiah",
    owner_phone: "9848088101",
    name: "Finolex Rain Gun Sprinkler Irrigation System",
    category: "Irrigation Equipment",
    description: "High-throw 1.5-inch brass rain gun sprinkler capable of 30-meter spray radius for sugarcane and maize fields.",
    image_url: "/images/machines/irrigation.jpg",
    location: "Vijayawada",
    rental_rate: 750,
    rate_unit: "day",
    availability: "available",
    condition: "Excellent",
    specifications: "1.5-inch Heavy Brass Rain Gun, 30m Radius, Quick Latch",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-8d",
    farmer_id: "farmer-108d",
    owner_name: "R. Jagannadham",
    owner_phone: "9848088212",
    name: "Kritika Portable HDPE Hose Reel Sprinkler Set",
    category: "Irrigation Equipment",
    description: "Portable sprinkler pipeline kit with 20 brass impact sprinklers and 60mm quick-couple latch pipes.",
    image_url: "/images/machines/irrigation.jpg",
    location: "Tanuku",
    rental_rate: 550,
    rate_unit: "day",
    availability: "available",
    condition: "Good",
    specifications: "60mm Quick Latch Pipes, 20 Brass Impact Heads",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 9. POWER TOOLS (4 items)
  {
    id: "m-9",
    farmer_id: "farmer-109",
    owner_name: "Venkatesh",
    owner_phone: "9848090123",
    name: "STIHL Power Weeder & Brush Cutter 2.2 HP",
    category: "Power Tool",
    description: "Heavy duty 2-stroke petrol brush cutter tool with 3-tooth metal blade and tap-and-go nylon head.",
    image_url: "/images/machines/power_tools.jpg",
    location: "Eluru",
    rental_rate: 200,
    rate_unit: "day",
    availability: "available",
    condition: "Good",
    specifications: "2.2 HP 40cc Petrol, 3-Tooth Blade, Double Harness",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-9b",
    farmer_id: "farmer-109b",
    owner_name: "T. Anjaneyulu",
    owner_phone: "9848099001",
    name: "Husqvarna 455 Rancher Chainsaw 3.5 HP",
    category: "Power Tool",
    description: "Professional 55.5cc petrol chainsaw with 20-inch guide bar for farm tree pruning, timber cutting, and land clearing.",
    image_url: "/images/machines/power_tools.jpg",
    location: "Rajahmundry",
    rental_rate: 300,
    rate_unit: "day",
    availability: "available",
    condition: "Excellent",
    specifications: "55.5cc Engine, 20-inch Guide Bar, AutoTune Carburetor",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-9c",
    farmer_id: "farmer-109c",
    owner_name: "B. Mohan Rao",
    owner_phone: "9848099112",
    name: "KisanKraft Earth Auger Hole Digger 52cc",
    category: "Power Tool",
    description: "One-man petrol earth auger with 8-inch and 10-inch heavy steel bits for fencing posts and tree sapling plantations.",
    image_url: "/images/machines/power_tools.jpg",
    location: "Mandapeta",
    rental_rate: 250,
    rate_unit: "day",
    availability: "available",
    condition: "Excellent",
    specifications: "52cc 2-Stroke Petrol, 8-inch & 10-inch Bits, Plantation Digger",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-9d",
    farmer_id: "farmer-109d",
    owner_name: "M. Ramu",
    owner_phone: "9848099223",
    name: "Honda Petrol Engine Sugarcane & Crop Cutter",
    category: "Power Tool",
    description: "Portable 4-stroke crop harvester cutter tool for fast harvesting of sugarcane, paddy stalks, and fodder grass.",
    image_url: "/images/machines/power_tools.jpg",
    location: "Kakinada",
    rental_rate: 350,
    rate_unit: "day",
    availability: "available",
    condition: "Good",
    specifications: "4-Stroke Engine, Carbide Tipped Blade, Lightweight Frame",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 10. OTHER FARM EQUIPMENT (4 items)
  {
    id: "m-10",
    farmer_id: "farmer-110",
    owner_name: "Suryanarayana",
    owner_phone: "9848091234",
    name: "Hydraulic Tipping Tractor Trolley 5-Ton",
    category: "Other",
    description: "Heavy duty 5-tonne hydraulic tipping tractor trailer for agricultural crop haulage and transport.",
    image_url: "/images/machines/trolley.jpg",
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
  {
    id: "m-10b",
    farmer_id: "farmer-110b",
    owner_name: "K. Venkatadri",
    owner_phone: "9848091122",
    name: "Fieldking 3-Bottom Hydraulic Reversible MB Plough",
    category: "Other",
    description: "Hydraulic reversible mouldboard plough for deep tillage, soil inversion, and breaking hard pan layers.",
    image_url: "/images/machines/trolley.jpg",
    location: "Guntur",
    rental_rate: 600,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "3 Bottom MB Plough, High Carbon Steel, Hydraulic Turnover",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-10c",
    farmer_id: "farmer-110c",
    owner_name: "P. Subbaraju",
    owner_phone: "9848091233",
    name: "Redlands Sugarcane Trash Shredder & Mulcher",
    category: "Other",
    description: "PTO driven crop residue flail shredder for crushing sugarcane trash and crop straw into organic soil mulch.",
    image_url: "/images/machines/trolley.jpg",
    location: "Tanuku",
    rental_rate: 700,
    rate_unit: "hr",
    availability: "available",
    condition: "Excellent",
    specifications: "Tractor PTO Shaft Driven, Heavy Flail Blades, Organic Mulch",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "m-10d",
    farmer_id: "farmer-110d",
    owner_name: "D. Ramakrishna",
    owner_phone: "9848091344",
    name: "Grain Solar Dryer Portable Chamber 500kg",
    category: "Other",
    description: "Solar powered grain & spice drying chamber with forced air ventilation for hygienic drying of agricultural produce.",
    image_url: "/images/machines/trolley.jpg",
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

export function getEquipmentImage(name?: string | null, category?: string | null, currentUrl?: string | null): string {
  const lowerName = (name || "").toLowerCase();
  const lowerCat = (category || "").toLowerCase();

  if (lowerName.includes("tractor") || lowerCat.includes("tractor")) return "/images/machines/tractor.jpg";
  if (lowerName.includes("harvester") || lowerCat.includes("harvester")) return "/images/machines/harvester.jpg";
  if (lowerName.includes("rotavator") || lowerCat.includes("rotavator")) return "/images/machines/rotavator.jpg";
  if (lowerName.includes("sprayer") || lowerCat.includes("sprayer")) return "/images/machines/sprayer.jpg";
  if (lowerName.includes("pump") || lowerCat.includes("water pump")) return "/images/machines/water_pump.jpg";
  if (lowerName.includes("cultivator") || lowerCat.includes("cultivator") || lowerName.includes("tiller")) return "/images/machines/cultivator.jpg";
  if (lowerName.includes("seed") || lowerCat.includes("seeder")) return "/images/machines/seeder.jpg";
  if (lowerName.includes("irrigation") || lowerCat.includes("irrigation") || lowerName.includes("drip") || lowerName.includes("sprinkler") || lowerName.includes("rain gun")) return "/images/machines/irrigation.jpg";
  if (lowerName.includes("brush") || lowerName.includes("weeder") || lowerName.includes("auger") || lowerName.includes("saw") || lowerName.includes("cutter") || lowerCat.includes("power tool") || lowerCat.includes("power_tool")) return "/images/machines/power_tools.jpg";
  if (lowerName.includes("trolley") || lowerName.includes("trailer") || lowerName.includes("plough") || lowerName.includes("shredder") || lowerName.includes("dryer") || lowerCat.includes("other")) return "/images/machines/trolley.jpg";

  if (currentUrl && currentUrl.startsWith("/images/machines/")) {
    return currentUrl;
  }
  return "/images/machines/tractor.jpg";
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
        return data as DbMachine[];
      }
    } catch (err) {
      console.warn("Supabase fetch failed for machines_tools, using local storage", err);
    }
  }

  // Fallback filtering
  let list = getLocalMachines();
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
