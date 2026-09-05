import fs from 'fs';
import https from 'https';

async function getWikiImage(query) {
  const wikiUrl = 'https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent(query) + '&gsrlimit=1&prop=pageimages&pithumbsize=800&format=json';
  try {
    const wikiRes = await fetch(wikiUrl);
    const wikiJson = await wikiRes.json();
    if (wikiJson.query && wikiJson.query.pages) {
      const pages = Object.values(wikiJson.query.pages);
      if (pages.length > 0 && pages[0].thumbnail) {
        return pages[0].thumbnail.source;
      }
    }
  } catch (e) {}
  return null;
}

const customQueries = {
  "Paddy Seed PR-126 (5 kg)": "Rice grains",
  "Wheat Seed PBW-343 (5 kg)": "Wheatberries",
  "BT Cotton Seed (450 g)": "Cottonseed",
  "Groundnut Seed TAG-24 (10 kg)": "Peanut seeds",
  "Hybrid Maize Seed DKC-9108 (5 kg)": "Corn kernels",
  "Sunflower Seed KBSH-44 (5 kg)": "Sunflower seed",
  "Pearl Millet Seed HHB-67 (5 kg)": "Pearl millet grain",
  "Hybrid Tomato Seed (10 g)": "Tomato seeds",
  "Onion Seed Agrifound Dark Red (50 g)": "Onion seeds",
  "Hybrid Brinjal Seed (10 g)": "Eggplant seeds",
  "Chilli Seed Byadgi Dabbi (50 g)": "Dried chilli",
  "Okra Seed Arka Anamika (250 g)": "Okra seeds",
  "Mustard Seed Pusa Bold (2 kg)": "Mustard seed",
  "Chickpea Seed JG-11 (10 kg)": "Chickpea",
  "Pigeon Pea Seed ICPL-87 (5 kg)": "Pigeon pea",
  "Soybean Seed JS-9560 (20 kg)": "Soybean",
  "Sugarcane Seed Sett Co-0238 (100 setts)": "Sugarcane plantation",
  "Potato Seed Tuber Kufri Jyoti (50 kg)": "Potato tubers",
  "Green Gram Seed IPM-02-3 (5 kg)": "Mung bean",
  "Black Gram Seed Pant U-31 (5 kg)": "Vigna mungo",
  "Cabbage Seed Golden Acre (100 g)": "Cabbage",
  "Cauliflower Seed Snowball-16 (50 g)": "Cauliflower",
  "Cucumber Seed Hybrid Malini (25 g)": "Cucumber seeds",
  "Bottle Gourd Seed Pusa Naveen (100 g)": "Calabash",
  "Bitter Gourd Seed Hybrid (50 g)": "Bitter melon",
  "Watermelon Seed Sugar Baby (100 g)": "Watermelon seed",
  "Muskmelon Seed Hara Madhu (100 g)": "Muskmelon",
  "Carrot Seed Pusa Rudhira (250 g)": "Carrot seeds",
  "Spinach Seed All Green (500 g)": "Spinach leaves",
  "Coriander Seed Local (1 kg)": "Coriander seeds",
  "Fenugreek Seed Pusa Early Bunching (1 kg)": "Fenugreek seeds",
  "Barley Seed BH-946 (20 kg)": "Barley grain",
  "Sorghum Seed CSH-16 (5 kg)": "Sorghum grains",
  "Finger Millet Seed GPU-28 (5 kg)": "Eleusine coracana",
  "Sesame Seed GT-10 (2 kg)": "Sesame seeds",
  "Castor Seed GCH-7 (5 kg)": "Castor bean",
  "Lentil Seed IPL-406 (5 kg)": "Lentils",
  "Field Pea Seed HFP-4 (10 kg)": "Peas",
  "Berseem Fodder Seed (10 kg)": "Trifolium alexandrinum",
  "Napier Grass Root Slips (100 slips)": "Pennisetum purpureum",
  "Marigold Seed African Orange (50 g)": "Tagetes erecta",
  "Turmeric Rhizome Seed Salem (25 kg)": "Turmeric rhizome",
  "Ginger Rhizome Seed Varada (25 kg)": "Ginger root",
  "Garlic Seed Bulb G-282 (10 kg)": "Garlic bulbs",
  "Papaya Seed Red Lady (10 g)": "Papaya seeds",
  "Banana Tissue Culture Plant G-9": "Banana plantation",
  "Guava Grafted Plant Allahabad Safeda": "Guava tree",
  "Mango Grafted Plant Dasheri": "Mango tree",
  "Drumstick Seed PKM-1 (250 g)": "Moringa oleifera",
  "Curry Leaf Plant Sapling": "Curry tree",
  "Urea 46% N (45 kg)": "Urea fertilizer",
  "DAP 18-46-0 (50 kg)": "Diammonium phosphate",
  "MOP Muriate of Potash (50 kg)": "Potassium chloride fertilizer",
  "NPK 10:26:26 Complex (50 kg)": "Fertilizer granules",
  "NPK 20:20:0:13 (50 kg)": "Fertilizer granules",
  "Single Super Phosphate (50 kg)": "Superphosphate",
  "Zinc Sulphate 21% (5 kg)": "Zinc sulfate",
  "Ammonium Sulphate (50 kg)": "Ammonium sulfate fertilizer",
  "Calcium Nitrate (25 kg)": "Calcium nitrate",
  "Water Soluble NPK 19:19:19 (1 kg)": "Fertilizer powder",
  "Water Soluble NPK 0:52:34 (1 kg)": "Monopotassium phosphate",
  "Potassium Schoenite (25 kg)": "Fertilizer bag",
  "Vermicompost Organic (30 kg)": "Vermicompost",
  "Neem Cake Powder (25 kg)": "Neem cake",
  "Bone Meal Organic (10 kg)": "Bone meal fertilizer",
  "Cow Dung Manure Composted (40 kg)": "Cow dung manure",
  "Rhizobium Biofertiliser (500 g)": "Biofertilizer",
  "Azotobacter Biofertiliser (500 g)": "Azotobacter",
  "PSB Phosphate Solubilising Bacteria (500 g)": "Soil bacteria",
  "Mycorrhiza VAM Granules (4 kg)": "Mycorrhiza",
  "Trichoderma Viride Bio-fungicide (1 kg)": "Trichoderma",
  "Pseudomonas Fluorescens (1 kg)": "Pseudomonas fluorescens",
  "Humic Acid Granules (5 kg)": "Humic acid",
  "Seaweed Extract Liquid (1 litre)": "Seaweed fertilizer",
  "Micronutrient Mixture Grade-II (5 kg)": "Agricultural micronutrients",
  "Boron 20% Powder (1 kg)": "Borax powder",
  "Ferrous Sulphate (10 kg)": "Iron(II) sulfate",
  "Gypsum Agricultural Grade (50 kg)": "Agricultural gypsum",
  "Sulphur 90% WDG (5 kg)": "Sulfur powder",
  "Liquid Consortia Biofertiliser (1 litre)": "Liquid biofertilizer",
  "Nano Urea Liquid (500 ml)": "Liquid fertilizer bottle",
  "Nano DAP Liquid (500 ml)": "Liquid fertilizer bottle",
  "Potassium Humate Shiny Flakes (2 kg)": "Humate flakes",
  "Panchagavya Organic Tonic (5 litre)": "Panchagavya",
  "Jeevamrut Concentrate (5 litre)": "Organic liquid fertilizer",
  "Battery Knapsack Sprayer 16 L": "Knapsack sprayer",
  "Manual Knapsack Sprayer 16 L": "Agricultural sprayer",
  "Power Weeder 5 HP": "Rototiller",
  "Brush Cutter 2-Stroke 43 CC": "String trimmer",
  "Rotavator 5 Feet": "Rotavator",
  "Seed Drill 9 Tyne": "Seed drill",
  "Drip Irrigation Kit 1 Acre": "Drip irrigation",
  "Sprinkler Set 1 Acre": "Irrigation sprinkler",
  "HDPE Mulching Film 25 Micron (400 m)": "Plastic mulch",
  "Shade Net 50% Green (3 x 50 m)": "Agriculture shade net",
  "Insect Net 40 Mesh (3 x 50 m)": "Agriculture insect net",
  "Soil Testing Kit Digital": "Soil testing kit",
  "Grain Moisture Meter": "Moisture meter",
  "Sickle Serrated Steel": "Sickle tool",
  "Kudali / Hoe 1.5 kg": "Hoe tool",
  "Garden Spade Steel": "Spade tool",
  "Pruning Secateur Bypass": "Pruning shears",
  "Chaff Cutter Electric 2 HP": "Chaff cutter",
  "Water Pump 5 HP Diesel": "Irrigation pump",
  "Submersible Pump 3 HP": "Submersible pump",
  "Solar Pump Controller 5 HP": "Solar water pump",
  "Tarpaulin Sheet 200 GSM (18 x 24 ft)": "Tarpaulin",
  "Jute Gunny Bags (Pack of 50)": "Gunny sack",
  "Grain Storage Silo 1 Tonne": "Grain silo",
  "Weighing Scale Platform 300 kg": "Weighing scale platform",
  "Cattle Feed Trough Plastic 60 L": "Feed trough",
  "Milking Machine Single Bucket": "Milking machine",
  "Poultry Automatic Drinker (Pack of 10)": "Poultry drinker",
  "Wheelbarrow Steel 100 L": "Wheelbarrow",
  "Fogger Machine Portable": "Fogger machine",
  "Solar Insect Light Trap": "Insect trap",
  "Pheromone Trap Set (Pack of 10)": "Pheromone trap",
  "Farm Safety Kit (Mask, Gloves, Goggles)": "Personal protective equipment",
  "Weather Station Mini Digital": "Weather station",
  "Tractor Trolley Tipping 5 Tonne": "Tractor trailer"
};

(async () => {
  const content = fs.readFileSync('src/data/products.ts', 'utf8');
  const match = content.match(/const ROWS: Row\[\] = \[([\s\S]*?)\];/);
  if (!match) return;
  const rowsRaw = match[1].split('],\n');
  
  const mappings = {};
  
  let i = 0;
  for (const row of rowsRaw) {
    const titleMatch = row.match(/"([^"]+)"/);
    if (titleMatch) {
      const title = titleMatch[1];
      let query = customQueries[title];
      if (!query) query = title;
      
      let url = await getWikiImage(query);
      if (!url) {
         // fallback manually to a known image for the category
         if (query.includes("fertilizer") || query.includes("granules")) url = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Fertilizer.jpg/800px-Fertilizer.jpg";
         else if (query.includes("sprayer") || query.includes("pump")) url = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Knapsack_sprayer.jpg/800px-Knapsack_sprayer.jpg";
         else if (query.includes("seed")) url = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Various_seeds.jpg/800px-Various_seeds.jpg";
         else if (query.includes("trap")) url = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Insect_trap.jpg/800px-Insect_trap.jpg";
         else if (query.includes("net") || query.includes("mulch")) url = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Plastic_mulch.jpg/800px-Plastic_mulch.jpg";
         else if (query.includes("silo")) url = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Grain_silos.jpg/800px-Grain_silos.jpg";
         else url = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Agriculture_in_India.jpg/800px-Agriculture_in_India.jpg";
      }
      mappings[title] = url;
      console.log(`[${i+1}/120] Found ${title} -> ${url}`);
    }
    i++;
  }
  
  fs.writeFileSync('src/data/image_mappings.json', JSON.stringify(mappings, null, 2));
  console.log('Done mapping custom Wiki images!');
})();
