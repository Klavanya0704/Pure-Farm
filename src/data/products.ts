import seedsImg from "@/assets/cat-seeds.jpg";
import fertImg from "@/assets/cat-fertilizers.jpg";
import toolsImg from "@/assets/cat-tools.jpg";
import cropImg from "@/assets/cat-crop.jpg";
import type { Category, Product } from "./types";

export const CATEGORY_FALLBACK_IMAGES: Record<Category, string> = {
  seeds: "/categories/seeds.jpg",
  fertilizers: "/categories/fertilizers.jpg",
  tools: "/categories/farm-tools.jpg",
  "farm-tools": "/categories/farm-tools.jpg",
  equipment: "/categories/equipment.jpg",
  pesticides: "/categories/pesticides.jpg",
  vegetables: "/categories/vegetables.jpg",
  fruits: "/categories/fruits.jpg",
  grains: "/categories/seeds.jpg",
  pulses: "/categories/seeds.jpg",
  oilseeds: "/categories/seeds.jpg",
  spices: "/categories/vegetables.jpg",
  other: cropImg,
};

type Row = [string, string, Category, string, number, number, number, string, string?];

export const IMAGE_MAPPINGS: Record<string, string> = {
  "Fresh Alphonso Mangoes (1 kg)":
    "/products/fresh-alphonso-mangoes-1-kg.jpg",
  "Fresh Grand Naine Bananas (1 Dozen)":
    "/products/fresh-grand-naine-bananas-1-dozen.jpg",
  "Fresh Red Lady Papaya (1 kg)":
    "/products/fresh-red-lady-papaya-1-kg.jpg",
  "Fresh Sugar Baby Watermelon (1 pc / 3-4 kg)":
    "/products/fresh-sugar-baby-watermelon-1-pc-3-4-kg.jpg",
  "Fresh Hara Madhu Muskmelon (1 pc)":
    "/products/fresh-hara-madhu-muskmelon-1-pc.jpg",
  "Fresh Nagpur Oranges (1 kg)":
    "/products/fresh-nagpur-oranges-1-kg.jpg",
  "Fresh Shimla Apples (1 kg)":
    "/products/fresh-shimla-apples-1-kg.jpg",
  "Fresh Thompson Seedless Grapes (500 g)":
    "/products/fresh-thompson-seedless-grapes-500-g.jpg",
  "Fresh Allahabad Safeda Guava (1 kg)":
    "/products/fresh-allahabad-safeda-guava-1-kg.jpg",
  "Fresh Kesar Pomegranate (1 kg)":
    "/products/fresh-kesar-pomegranate-1-kg.jpg",
  "Fresh Red Tomatoes (1 kg)":
    "/products/fresh-red-tomatoes-1-kg.jpg",
  "Fresh Nashik Red Onions (1 kg)":
    "/products/fresh-nashik-red-onions-1-kg.jpg",
  "Fresh Agra Potatoes (1 kg)":
    "/products/fresh-agra-potatoes-1-kg.jpg",
  "Fresh Purple Brinjal (1 kg)":
    "/products/fresh-purple-brinjal-1-kg.jpg",
  "Fresh Green Chilli (250 g)":
    "/products/fresh-green-chilli-250-g.jpg",
  "Fresh Green Cabbage (1 pc)":
    "/products/fresh-green-cabbage-1-pc.jpg",
  "Fresh White Cauliflower (1 pc)":
    "/products/fresh-white-cauliflower-1-pc.jpg",
  "Fresh Green Capsicum (500 g)":
    "/products/fresh-green-capsicum-500-g.jpg",
  "Sunflower Seed KBSH-44 (5 kg)":
    "/products/sunflower-seed-kbsh-44-5-kg.jpg",
  "Onion Seed Agrifound Dark Red (50 g)":
    "/products/onion-seed-agrifound-dark-red-50-g.jpg",
  "Okra Seed Arka Anamika (250 g)":
    "/products/okra-seed-arka-anamika-250-g.jpg",
  "Mustard Seed Pusa Bold (2 kg)":
    "/products/mustard-seed-pusa-bold-2-kg.jpg",
  "Chickpea Seed JG-11 (10 kg)":
    "/products/chickpea-seed-jg-11-10-kg.jpg",
  "Pigeon Pea Seed ICPL-87 (5 kg)":
    "/products/pigeon-pea-seed-icpl-87-5-kg.jpg",
  "Sugarcane Seed Sett Co-0238 (100 setts)":
    "/products/sugarcane-seed-sett-co-0238-100-setts.jpg",
  "Potato Seed Tuber Kufri Jyoti (50 kg)":
    "/products/potato-seed-tuber-kufri-jyoti-50-kg.jpg",
  "Green Gram Seed IPM-02-3 (5 kg)":
    "/products/green-gram-seed-ipm-02-3-5-kg.jpg",
  "Black Gram Seed Pant U-31 (5 kg)":
    "/products/black-gram-seed-pant-u-31-5-kg.jpg",
  "Cabbage Seed Golden Acre (100 g)":
    "/products/cabbage-seed-golden-acre-100-g.jpg",
  "Cauliflower Seed Snowball-16 (50 g)":
    "/products/cauliflower-seed-snowball-16-50-g.jpg",
  "Coriander Seed Local (1 kg)":
    "/products/coriander-seed-local-1-kg.jpg",
  "Fenugreek Seed Pusa Early Bunching (1 kg)":
    "/products/fenugreek-seed-pusa-early-bunching-1-kg.jpg",
  "Lentil Seed IPL-406 (5 kg)":
    "/products/lentil-seed-ipl-406-5-kg.jpg",
  "Turmeric Rhizome Seed Salem (25 kg)":
    "/products/turmeric-rhizome-seed-salem-25-kg.jpg",
  "Banana Tissue Culture Plant G-9":
    "/products/banana-tissue-culture-plant-g-9.jpg",
  "Sickle Serrated Steel":
    "/products/sickle-serrated-steel.jpg",
  "Kudali / Hoe 1.5 kg":
    "/products/kudali-hoe-15-kg.jpg",
  "Garden Spade Steel":
    "/products/garden-spade-steel.jpg",
  "Pruning Secateur Bypass":
    "/products/pruning-secateur-bypass.jpg",
  "Insect Net 40 Mesh (3 x 50 m)":
    "/products/insect-net-40-mesh-3-x-50-m.jpg",
  "Tarpaulin Sheet 200 GSM (18 x 24 ft)":
    "/products/tarpaulin-sheet-200-gsm-18-x-24-ft.jpg",
  "Jute Gunny Bags (Pack of 50)":
    "/products/jute-gunny-bags-pack-of-50.jpg",
  "Cattle Feed Trough Plastic 60 L":
    "/products/cattle-feed-trough-plastic-60-l.jpg",
  "Poultry Automatic Drinker (Pack of 10)":
    "/products/poultry-automatic-drinker-pack-of-10.jpg",
  "Wheelbarrow Steel 100 L":
    "/products/wheelbarrow-steel-100-l.jpg",
  "Pheromone Trap Set (Pack of 10)":
    "/products/pheromone-trap-set-pack-of-10.jpg",
  "Power Weeder 5 HP":
    "/products/power-weeder-5-hp.jpg",
  "Brush Cutter 2-Stroke 43 CC":
    "/products/brush-cutter-2-stroke-43-cc.jpg",
  "Rotavator 5 Feet":
    "/products/rotavator-5-feet.jpg",
  "Seed Drill 9 Tyne":
    "/products/seed-drill-9-tyne.jpg",
  "Sprinkler Set 1 Acre":
    "/products/sprinkler-set-1-acre.jpg",
  "Submersible Pump 3 HP":
    "/products/submersible-pump-3-hp.jpg",
};

const ROWS: Row[] = [
  // --- FRESH FRUITS ---
  [
    "Fresh Alphonso Mangoes (1 kg)",
    "Ratnagiri Farm Direct",
    "fruits",
    "kg",
    350,
    4.8,
    450,
    "GI-tagged naturally ripened Alphonso mangoes with rich aroma and sweet pulp.",
    "Best Seller",
  ],
  [
    "Fresh Grand Naine Bananas (1 Dozen)",
    "Anantapur Farmers Producer Co.",
    "fruits",
    "dozen",
    65,
    4.6,
    800,
    "Farm-fresh premium Grand Naine bananas rich in potassium and nutrients.",
  ],
  [
    "Fresh Red Lady Papaya (1 kg)",
    "Godavari Delta Farms",
    "fruits",
    "kg",
    45,
    4.7,
    600,
    "Tree-ripened sweet Red Lady papaya with deep orange flesh and high Brix value.",
    "Top Rated",
  ],
  [
    "Fresh Sugar Baby Watermelon (1 pc / 3-4 kg)",
    "Kurnool Agri Producer",
    "fruits",
    "piece",
    120,
    4.5,
    350,
    "Crisp and juicy sweet dark-skinned Sugar Baby watermelon.",
  ],
  [
    "Fresh Hara Madhu Muskmelon (1 pc)",
    "Punjab Organic Orchards",
    "fruits",
    "piece",
    85,
    4.4,
    400,
    "Highly aromatic green-fleshed muskmelon harvested at peak ripeness.",
  ],
  [
    "Fresh Nagpur Oranges (1 kg)",
    "Vidarbha Citrus Co-op",
    "fruits",
    "kg",
    90,
    4.6,
    550,
    "Juicy and sweet-sour fresh Nagpur mandarin oranges.",
  ],
  [
    "Fresh Shimla Apples (1 kg)",
    "Kinnaur Valley Orchards",
    "fruits",
    "kg",
    180,
    4.7,
    650,
    "Crisp, sweet, and juicy Royal Delicious Shimla apples.",
    "Featured",
  ],
  [
    "Fresh Thompson Seedless Grapes (500 g)",
    "Nashik Grape Growers",
    "fruits",
    "pack",
    75,
    4.6,
    500,
    "Sweet, seedless green table grapes harvested fresh from Nashik vineyards.",
  ],
  [
    "Fresh Allahabad Safeda Guava (1 kg)",
    "Varanasi Fruit Farms",
    "fruits",
    "kg",
    80,
    4.5,
    420,
    "Sweet white-fleshed Allahabad Safeda guava rich in Vitamin C.",
  ],
  [
    "Fresh Kesar Pomegranate (1 kg)",
    "Solapur Organic Growers",
    "fruits",
    "kg",
    160,
    4.8,
    380,
    "Deep red arils with soft seeds and high juice yield.",
  ],

  // --- FRESH VEGETABLES ---
  [
    "Fresh Red Tomatoes (1 kg)",
    "Madanapalle Farm Direct",
    "vegetables",
    "kg",
    32,
    4.5,
    1200,
    "Firm, ripe field tomatoes ideal for curries, salads and cooking.",
    "Best Seller",
  ],
  [
    "Fresh Nashik Red Onions (1 kg)",
    "Nashik Farmer Producer",
    "vegetables",
    "kg",
    28,
    4.6,
    1500,
    "Dry-skinned, pungent red onions with excellent shelf life.",
  ],
  [
    "Fresh Agra Potatoes (1 kg)",
    "UP Vegetable Co-op",
    "vegetables",
    "kg",
    25,
    4.4,
    1800,
    "Clean, firm table potatoes perfect for daily cooking.",
  ],
  [
    "Fresh Purple Brinjal (1 kg)",
    "Local Farm Direct",
    "vegetables",
    "kg",
    40,
    4.3,
    600,
    "Tender purple eggplant with soft seeds and smooth texture.",
  ],
  [
    "Fresh Green Chilli (250 g)",
    "Guntur Chilli Growers",
    "vegetables",
    "pack",
    20,
    4.5,
    800,
    "Fresh spicy green chillies for daily kitchen seasoning.",
  ],
  [
    "Fresh Green Cabbage (1 pc)",
    "Local Farm Direct",
    "vegetables",
    "piece",
    30,
    4.2,
    700,
    "Compact green cabbage head harvested fresh from the field.",
  ],
  [
    "Fresh White Cauliflower (1 pc)",
    "Local Farm Direct",
    "vegetables",
    "piece",
    35,
    4.4,
    650,
    "Tight white curd cauliflower with crisp florets.",
  ],
  [
    "Fresh Green Capsicum (500 g)",
    "Polyhouse Fresh",
    "vegetables",
    "pack",
    45,
    4.6,
    450,
    "Crisp, thick-walled green bell peppers.",
  ],

  // --- SEEDS & PLANTING MATERIAL ---
  [
    "Sunflower Seed KBSH-44 (5 kg)",
    "Karnataka Seeds Corp.",
    "seeds",
    "bag",
    380,
    4.2,
    180,
    "High-oleic sunflower hybrid. 90-day duration. Suitable for rain-fed conditions.",
  ],
  [
    "Onion Seed Agrifound Dark Red (50 g)",
    "NHRDF",
    "seeds",
    "pack",
    320,
    4.5,
    420,
    "Popular rabi onion variety with good storage life and deep red colour.",
    "Featured",
  ],
  [
    "Okra Seed Arka Anamika (250 g)",
    "IIHR Seeds",
    "seeds",
    "pack",
    260,
    4.3,
    480,
    "Yellow vein mosaic tolerant okra with tender long green pods.",
  ],
  [
    "Mustard Seed Pusa Bold (2 kg)",
    "IARI Seeds",
    "seeds",
    "bag",
    340,
    4.4,
    700,
    "High oil content mustard suited to Rajasthan and Haryana rabi belts.",
  ],
  [
    "Chickpea Seed JG-11 (10 kg)",
    "MP Seeds Corp.",
    "seeds",
    "bag",
    1350,
    4.5,
    260,
    "Wilt resistant desi chana with 110-day duration and bold grain.",
  ],
  [
    "Pigeon Pea Seed ICPL-87 (5 kg)",
    "ICRISAT Certified",
    "seeds",
    "bag",
    890,
    4.2,
    310,
    "Short duration arhar suited to intercropping with cotton and soybean.",
  ],
  [
    "Sugarcane Seed Sett Co-0238 (100 setts)",
    "UP Cane Research",
    "seeds",
    "bundle",
    780,
    4.3,
    150,
    "High sucrose cane variety recommended for the subtropical belt.",
  ],
  [
    "Potato Seed Tuber Kufri Jyoti (50 kg)",
    "CPRI Shimla",
    "seeds",
    "bag",
    1850,
    4.5,
    120,
    "Certified disease-free seed tubers with high processing quality.",
  ],
  [
    "Green Gram Seed IPM-02-3 (5 kg)",
    "IIPR Kanpur",
    "seeds",
    "bag",
    720,
    4.1,
    380,
    "Short-duration moong with synchronous maturity for zaid sowing.",
  ],
  [
    "Black Gram Seed Pant U-31 (5 kg)",
    "GBPUAT Seeds",
    "seeds",
    "bag",
    690,
    4,
    360,
    "Yellow mosaic tolerant urad with 75-day maturity.",
  ],
  [
    "Cabbage Seed Golden Acre (100 g)",
    "Namdhari Seeds",
    "seeds",
    "pack",
    340,
    4.2,
    410,
    "Compact heads averaging 1.2 kg. Ideal for early rabi planting.",
  ],
  [
    "Cauliflower Seed Snowball-16 (50 g)",
    "Namdhari Seeds",
    "seeds",
    "pack",
    380,
    4.3,
    390,
    "Pure white compact curds with excellent field holding capacity.",
  ],
  [
    "Coriander Seed Local (1 kg)",
    "Raj Agri Seeds",
    "seeds",
    "bag",
    240,
    4.1,
    720,
    "Dual purpose coriander seed for leafy harvest and seed production.",
  ],
  [
    "Fenugreek Seed Pusa Early Bunching (1 kg)",
    "IARI Seeds",
    "seeds",
    "bag",
    230,
    4,
    610,
    "Quick bunching methi seed giving 3-4 cuttings during the rabi season.",
  ],
  [
    "Lentil Seed IPL-406 (5 kg)",
    "IIPR Kanpur",
    "seeds",
    "bag",
    810,
    4.3,
    300,
    "Bold-seeded masoor seed with rust resistance and 120-day maturity.",
  ],
  [
    "Turmeric Rhizome Seed Salem (25 kg)",
    "TNAU Certified",
    "seeds",
    "bag",
    1950,
    4.5,
    130,
    "High curcumin (4.5%) rhizome seed for the Erode and Salem belt.",
    "Featured",
  ],
  [
    "Banana Tissue Culture Plant G-9",
    "Jain Tissue Culture",
    "seeds",
    "plant",
    28,
    4.7,
    5000,
    "Disease-free tissue culture banana plant sapling with uniform bunch maturity.",
    "Best Seller",
  ],

  // --- FARM TOOLS ---
  [
    "Sickle Serrated Steel",
    "Falcon Tools",
    "farm-tools",
    "unit",
    180,
    4.3,
    1200,
    "High-carbon steel serrated sickle for paddy and wheat harvesting.",
  ],
  [
    "Kudali / Hoe 1.5 kg",
    "Falcon Tools",
    "farm-tools",
    "unit",
    420,
    4.2,
    850,
    "Forged steel hoe for weeding, digging and bed preparation.",
  ],
  [
    "Garden Spade Steel",
    "Falcon Tools",
    "farm-tools",
    "unit",
    480,
    4.1,
    750,
    "Durable steel spade with ergonomic wooden handle.",
  ],
  [
    "Pruning Secateur Bypass",
    "Falcon Tools",
    "farm-tools",
    "unit",
    620,
    4.5,
    950,
    "Bypass pruner for fruit tree pruning and branch trimming.",
  ],
  [
    "Insect Net 40 Mesh (3 x 50 m)",
    "Garware",
    "farm-tools",
    "roll",
    5600,
    4.2,
    250,
    "Fine mesh insect protection net preventing whitefly and thrips entry.",
  ],
  [
    "Tarpaulin Sheet 200 GSM (18 x 24 ft)",
    "Tirupati Plastics",
    "farm-tools",
    "unit",
    1650,
    4.2,
    600,
    "Heavy-duty waterproof tarpaulin for grain protection and grain drying.",
  ],
  [
    "Jute Gunny Bags (Pack of 50)",
    "Bengal Jute Mills",
    "farm-tools",
    "pack",
    2200,
    4.1,
    500,
    "Standard 50 kg capacity food-grade jute gunny storage bags.",
  ],
  [
    "Cattle Feed Trough Plastic 60 L",
    "Tirupati Plastics",
    "farm-tools",
    "unit",
    1450,
    4,
    350,
    "Heavy plastic feeding trough for dairy cattle.",
  ],
  [
    "Poultry Automatic Drinker (Pack of 10)",
    "Kisankraft",
    "farm-tools",
    "pack",
    1850,
    4.2,
    400,
    "Automatic nipple drinker set for poultry farms.",
  ],
  [
    "Wheelbarrow Steel 100 L",
    "Falcon Tools",
    "farm-tools",
    "unit",
    3400,
    4.1,
    280,
    "Single-wheel heavy steel wheelbarrow for farm transport.",
  ],
  [
    "Pheromone Trap Set (Pack of 10)",
    "Multiplex",
    "farm-tools",
    "pack",
    640,
    4.3,
    800,
    "Funnel traps with lures for bollworm and fall armyworm monitoring.",
  ],

  // --- FARM EQUIPMENT & MACHINERY ---
  [
    "Power Weeder 5 HP",
    "VST Shakti",
    "equipment",
    "unit",
    48500,
    4.4,
    150,
    "Petrol power tiller / weeder for inter-cultivation in cotton and sugarcane.",
  ],
  [
    "Brush Cutter 2-Stroke 43 CC",
    "Honda Power",
    "equipment",
    "unit",
    8900,
    4.3,
    400,
    "Heavy-duty petrol brush cutter with 3-blade metal cutter.",
  ],
  [
    "Rotavator 5 Feet",
    "Shaktiman",
    "equipment",
    "unit",
    78500,
    4.5,
    90,
    "Tractor-mounted 5 ft rotavator for fine soil seedbed preparation.",
  ],
  [
    "Seed Drill 9 Tyne",
    "Landforce",
    "equipment",
    "unit",
    42000,
    4.2,
    120,
    "Automatic tractor-drawn seed-cum-fertiliser drill 9 tyne.",
  ],
  [
    "Sprinkler Set 1 Acre",
    "Finolex Plasson",
    "equipment",
    "kit",
    18500,
    4.3,
    300,
    "Portable HDPE sprinkler pipe set with 3/4 inch brass sprinkler heads.",
  ],
  [
    "Submersible Pump 3 HP",
    "Crompton",
    "equipment",
    "unit",
    18900,
    4.3,
    280,
    "Borewell submersible pump set with copper winding motor.",
  ],
];

export const PRODUCTS: Product[] = ROWS.map((r, i) => {
  const [name, brand, category, unit, price, rating, stock, description, badge] = r;
  return {
    id: `prod-${i + 1}`,
    name,
    brand,
    category,
    unit,
    price,
    rating,
    stock,
    description,
    image: getProductImage(name, category, null),
    badge: badge as Product["badge"],
  };
});

export const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All Categories" },
  { id: "fruits", label: "Fruits" },
  { id: "vegetables", label: "Vegetables" },
  { id: "seeds", label: "Seeds" },
  { id: "fertilizers", label: "Fertilizers" },
  { id: "pesticides", label: "Pesticides" },
  { id: "farm-tools", label: "Farm Tools" },
  { id: "equipment", label: "Equipment" },
];

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

export function getProducts() {
  return Promise.resolve(PRODUCTS);
}

export function getCategoryPlaceholder(category?: string, name?: string): string {
  const catLabel = category
    ? category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")
    : "Agricultural Product";
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='450' viewBox='0 0 600 450' fill='%23F0FDF4'><rect width='600' height='450' fill='%23F0FDF4'/><rect x='20' y='20' width='560' height='410' rx='20' fill='%23E8F5EE' stroke='%23A7F3D0' stroke-width='2'/><circle cx='300' cy='190' r='54' fill='%23D1FAE5'/><path d='M300 156 C280 180 280 214 300 224 C320 214 320 180 300 156 Z' fill='%23059669'/><path d='M300 176 L300 218' stroke='%23FFFFFF' stroke-width='3' stroke-linecap='round'/><text x='300' y='280' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, -apple-system, sans-serif' font-size='18' font-weight='700' fill='%23064E3B'>${catLabel}</text><text x='300' y='312' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, -apple-system, sans-serif' font-size='13' font-weight='500' fill='%23047857'>Image Unavailable • PureFarm</text></svg>`;
}

export function getProductImage(
  name?: string | null,
  category?: string | null,
  currentUrl?: string | null,
): string {
  if (name) {
    const trimmed = name.trim();
    if (IMAGE_MAPPINGS[trimmed]) {
      return IMAGE_MAPPINGS[trimmed];
    }
    const lower = trimmed.toLowerCase();
    for (const [key, path] of Object.entries(IMAGE_MAPPINGS)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey === lower || lowerKey.includes(lower) || lower.includes(lowerKey)) {
        return path;
      }
    }
  }

  if (
    currentUrl &&
    (currentUrl.startsWith("/products/") || currentUrl.startsWith("/images/")) &&
    !currentUrl.includes("placeholder")
  ) {
    return currentUrl;
  }

  return getCategoryPlaceholder(category || "Produce", name || undefined);
}

