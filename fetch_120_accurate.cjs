const fs = require("fs");
const https = require("https");
const http = require("http");
const path = require("path");

const products = JSON.parse(fs.readFileSync("all_120_products.json", "utf-8"));

// Exact semantic search terms tailored for Wikipedia / Wikimedia Commons
const QUERY_MAP = {
  "p-001": "Oryza sativa seed grain", // Paddy
  "p-002": "Triticum wheat grain harvest", // Wheat
  "p-003": "Cotton seeds Gossypium", // Cotton Seed
  "p-004": "Peanuts Arachis hypogaea in shell", // Groundnut
  "p-005": "Zea mays corn seeds yellow", // Maize
  "p-006": "Helianthus annuus sunflower seeds", // Sunflower
  "p-007": "Pennisetum glaucum pearl millet grain", // Pearl Millet
  "p-008": "Solanum lycopersicum ripe red tomatoes", // Tomato
  "p-009": "Allium cepa red onion bulbs", // Onion
  "p-010": "Solanum melongena purple eggplant brinjal", // Brinjal
  "p-011": "Dried red chili peppers Byadgi", // Chilli
  "p-012": "Abelmoschus esculentus fresh okra ladies finger", // Okra
  "p-013": "Brassica nigra black mustard seeds", // Mustard
  "p-014": "Cicer arietinum chickpea seeds garbanzo", // Chickpea
  "p-015": "Cajanus cajan pigeon pea seeds", // Pigeon Pea
  "p-016": "Glycine max soybeans seeds", // Soybean
  "p-017": "Saccharum officinarum sugarcane stalk agriculture", // Sugarcane
  "p-018": "Solanum tuberosum seed potatoes tubers", // Potato
  "p-019": "Vigna radiata mung bean green gram", // Green Gram
  "p-020": "Vigna mungo black gram urad dal", // Black Gram
  "p-021": "Brassica oleracea green head cabbage", // Cabbage
  "p-022": "Brassica oleracea botrytis fresh cauliflower", // Cauliflower
  "p-023": "Cucumis sativus fresh green cucumbers", // Cucumber
  "p-024": "Lagenaria siceraria bottle gourd calabash", // Bottle Gourd
  "p-025": "Momordica charantia bitter gourd melon", // Bitter Gourd
  "p-026": "Citrullus lanatus fresh sliced watermelon", // Watermelon
  "p-027": "Cucumis melo muskmelon cantaloupe", // Muskmelon
  "p-028": "Daucus carota fresh orange red carrots", // Carrot
  "p-029": "Spinacia oleracea fresh spinach leaves", // Spinach
  "p-030": "Coriandrum sativum dried coriander seeds", // Coriander
  "p-031": "Trigonella foenum-graecum fenugreek seeds", // Fenugreek
  "p-032": "Hordeum vulgare barley grains harvest", // Barley
  "p-033": "Sorghum bicolor grain sorghum heads", // Sorghum
  "p-034": "Eleusine coracana finger millet ragi", // Finger Millet
  "p-035": "Sesamum indicum white sesame seeds", // Sesame
  "p-036": "Ricinus communis castor oil seeds", // Castor
  "p-037": "Lens culinaris brown red lentils", // Lentil
  "p-038": "Pisum sativum green field peas in pod", // Field Pea
  "p-039": "Trifolium alexandrinum berseem clover forage", // Berseem
  "p-040": "Cenchrus purpureus elephant grass Napier grass", // Napier Grass
  "p-041": "Tagetes erecta African marigold flowers orange", // Marigold
  "p-042": "Curcuma longa fresh turmeric rhizome root", // Turmeric
  "p-043": "Zingiber officinale fresh ginger rhizome root", // Ginger
  "p-044": "Allium sativum fresh garlic bulbs cloves", // Garlic
  "p-045": "Carica papaya fresh ripe papaya fruit", // Papaya
  "p-046": "Musa acuminata Cavendish banana plant plantation", // Banana
  "p-047": "Psidium guajava fresh green guava tree fruit", // Guava
  "p-048": "Mangifera indica fresh ripe mangoes fruit", // Mango
  "p-049": "Moringa oleifera fresh drumstick pods tree", // Drumstick
  "p-050": "Murraya koenigii fresh curry leaves plant", // Curry Leaf
  "p-051": "Urea fertilizer prills white pellets", // Urea
  "p-052": "DAP fertilizer granular phosphate agriculture", // DAP
  "p-053": "MOP muriate of potash fertilizer pink granular", // MOP
  "p-054": "NPK fertilizer granules agriculture field", // NPK 10:26:26
  "p-055": "NPK fertilizer compound agriculture pellets", // NPK 20:20:0:13
  "p-056": "Superphosphate fertilizer powder agriculture", // SSP
  "p-057": "Zinc sulphate monohydrate agriculture fertilizer", // Zinc Sulphate
  "p-058": "Ammonium sulfate fertilizer agriculture", // Ammonium Sulphate
  "p-059": "Calcium nitrate fertilizer prills agriculture", // Calcium Nitrate
  "p-060": "Water soluble fertilizer 19 19 19 agriculture", // NPK 19:19:19
  "p-061": "Monopotassium phosphate 0 52 34 fertilizer", // NPK 0:52:34
  "p-062": "Potassium mineral schoenite fertilizer", // Potassium Schoenite
  "p-063": "Vermicompost organic earthworm compost dark soil", // Vermicompost
  "p-064": "Neem cake organic fertilizer powder agriculture", // Neem Cake
  "p-065": "Bone meal organic phosphorus fertilizer agriculture", // Bone Meal
  "p-066": "Composted cow manure organic cattle fertilizer", // Cow Dung Manure
  "p-067": "Rhizobium legume root nodules nitrogen fixation", // Rhizobium
  "p-068": "Azotobacter biofertilizer agriculture bacteria", // Azotobacter
  "p-069": "Phosphate solubilizing bacteria biofertilizer", // PSB
  "p-070": "Mycorrhizal fungi roots vesicular arbuscular mycorrhiza", // Mycorrhiza
  "p-071": "Trichoderma harzianum biocontrol biofungicide culture", // Trichoderma
  "p-072": "Pseudomonas fluorescens biocontrol agriculture", // Pseudomonas
  "p-073": "Humic acid organic black granules agriculture", // Humic Acid
  "p-074": "Liquid seaweed kelp fertilizer extract bottle", // Seaweed Extract
  "p-075": "Chelated micronutrient mixture fertilizer agriculture", // Micronutrient
  "p-076": "Disodium octaborate tetrahydrate Boron fertilizer", // Boron Powder
  "p-077": "Ferrous sulfate crystals iron agriculture fertilizer", // Ferrous Sulphate
  "p-078": "Gypsum mineral agricultural grade soil conditioner", // Gypsum
  "p-079": "Sulfur wettable dispersible granules yellow agriculture", // Sulphur
  "p-080": "Liquid biofertilizer consortium bottle agriculture", // Liquid Consortia
  "p-081": "Liquid urea foliar fertilizer agriculture bottle", // Nano Urea
  "p-082": "Liquid phosphate nano fertilizer foliar spray", // Nano DAP
  "p-083": "Potassium humate shiny black flakes organic fertilizer", // Potassium Humate
  "p-084": "Panchagavya traditional Indian organic fertilizer liquid", // Panchagavya
  "p-085": "Jeevamrut organic liquid bio-formulation microbial", // Jeevamrut
  "p-086": "Knapsack sprayer backpack sprayer battery farm", // Battery Sprayer
  "p-087": "Manual knapsack pressure sprayer backpack agriculture", // Manual Sprayer
  "p-088": "Power tiller rotary weeder inter-cultivator farm machine", // Power Weeder
  "p-089": "Brush cutter grass trimmer 2 stroke agriculture", // Brush Cutter
  "p-090": "Tractor rotavator rotary tiller agricultural machinery", // Rotavator
  "p-091": "Seed drill tractor mounted sowing machine farm", // Seed Drill
  "p-092": "Drip irrigation pipe lines system farm crops", // Drip Irrigation
  "p-093": "Agricultural impact sprinkler watering crop field", // Sprinkler Set
  "p-094": "Plastic mulch film black mulching agriculture field", // Mulching Film
  "p-095": "Green shade net agricultural greenhouse nursery structure", // Shade Net
  "p-096": "Insect proof mesh netting agricultural polyhouse farm", // Insect Net
  "p-097": "Digital soil testing meter pH NPK tester probe farm", // Soil Testing Kit
  "p-098": "Digital grain moisture meter tester cereal seeds", // Grain Moisture Meter
  "p-099": "Traditional serrated steel sickle harvesting hand tool", // Sickle
  "p-100": "Agricultural hoe kudali digging garden hand tool", // Kudali / Hoe
  "p-101": "Steel garden spade digging shovel farm tool", // Garden Spade
  "p-102": "Bypass pruning shears secateurs branch cutter garden", // Secateurs
  "p-103": "Chaff cutter forage cutter animal feed machine farm", // Chaff Cutter
  "p-104": "Diesel water pump centrifugal irrigation agriculture", // Water Pump Diesel
  "p-105": "Submersible borewell water pump motor irrigation farm", // Submersible Pump
  "p-106": "Solar pump inverter controller agricultural photovoltaic", // Solar Pump Controller
  "p-107": "Heavy duty waterproof blue green tarpaulin sheet farm", // Tarpaulin
  "p-108": "Jute burlap gunny sacks bags stacked grain agriculture", // Jute Gunny Bags
  "p-109": "Grain storage silo metal agricultural bin farm", // Grain Silo
  "p-110": "Digital platform weighing scale heavy duty industrial farm", // Weighing Scale
  "p-111": "Plastic cattle livestock feeding water trough farm", // Cattle Feed Trough
  "p-112": "Portable single bucket milking machine dairy cattle farm", // Milking Machine
  "p-113": "Automatic poultry chicken nipple drinker waterer farm", // Poultry Drinker
  "p-114": "Heavy duty steel wheelbarrow construction garden farm", // Wheelbarrow
  "p-115": "Thermal fogger machine pest mosquito disinfectant farm", // Fogger Machine
  "p-116": "Solar powered insect pest light trap agriculture field", // Solar Insect Trap
  "p-117": "Agricultural pheromone funnel trap crop pest monitoring", // Pheromone Trap
  "p-118": "Agricultural pesticide safety PPE mask gloves goggles", // Farm Safety Kit
  "p-119": "Digital weather station wireless sensor anemometer rain gauge", // Weather Station
  "p-120": "Agricultural tipping trailer tractor trolley farming", // Tractor Trolley
};

function searchCommons(term) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(term)}&gsrlimit=3&gsrnamespace=6&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json`;
  return new Promise((resolve) => {
    https
      .get(
        url,
        { headers: { "User-Agent": "FreshProducePureFarmBot/1.0 (dev@purefarm.ag)" } },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              const json = JSON.parse(data);
              if (json.query && json.query.pages) {
                const pages = Object.values(json.query.pages);
                for (const page of pages) {
                  if (page.imageinfo && page.imageinfo[0]) {
                    const img = page.imageinfo[0];
                    const u = img.thumburl || img.url;
                    if (
                      u &&
                      !u.endsWith(".pdf") &&
                      !u.endsWith(".svg") &&
                      !u.includes(".pdf.jpg") &&
                      !u.includes(".djvu")
                    ) {
                      return resolve(u);
                    }
                  }
                }
                if (pages[0] && pages[0].imageinfo && pages[0].imageinfo[0]) {
                  return resolve(pages[0].imageinfo[0].thumburl || pages[0].imageinfo[0].url);
                }
              }
              resolve(null);
            } catch (e) {
              resolve(null);
            }
          });
        },
      )
      .on("error", () => resolve(null));
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib
      .get(
        url,
        { headers: { "User-Agent": "FreshProducePureFarmBot/1.0 (dev@purefarm.ag)" } },
        (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            let loc = res.headers.location;
            if (!loc.startsWith("http")) {
              const uObj = new URL(url);
              loc = `${uObj.protocol}//${uObj.host}${loc}`;
            }
            return resolve(downloadImage(loc, dest));
          }
          if (res.statusCode !== 200) {
            return reject(new Error(`Status ${res.statusCode}`));
          }
          const file = fs.createWriteStream(dest);
          res.pipe(file);
          file.on("finish", () => {
            file.close();
            resolve(true);
          });
          file.on("error", reject);
        },
      )
      .on("error", reject);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const audit = [];
  const outDir = path.join(process.cwd(), "public", "images", "products");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`Starting fetch for ${products.length} products...`);

  for (let idx = 0; idx < products.length; idx++) {
    const p = products[idx];
    const query = QUERY_MAP[p.id] || p.name;
    const dest = path.join(outDir, `${p.id}.jpg`);

    let imgUrl = await searchCommons(query);
    if (!imgUrl) {
      // Fallback search with shorter term
      const words = p.name.split(" ").slice(0, 3).join(" ");
      imgUrl = await searchCommons(words + " agriculture");
    }

    if (imgUrl) {
      try {
        await downloadImage(imgUrl, dest);
        console.log(`[${idx + 1}/${products.length}] OK: ${p.id} - ${p.name}`);
        audit.push({
          productId: p.id,
          productTitle: p.name,
          searchQuery: query,
          imagePath: `/images/products/${p.id}.jpg`,
          sourceUrl: imgUrl,
          matchStatus: "verified",
        });
      } catch (err) {
        console.error(`[${idx + 1}/${products.length}] ERR downloading ${p.id}: ${err.message}`);
        audit.push({
          productId: p.id,
          productTitle: p.name,
          searchQuery: query,
          imagePath: `/images/products/${p.id}.jpg`,
          sourceUrl: imgUrl,
          matchStatus: "broken",
        });
      }
    } else {
      console.warn(`[${idx + 1}/${products.length}] NOT FOUND: ${p.id} - ${p.name}`);
      audit.push({
        productId: p.id,
        productTitle: p.name,
        searchQuery: query,
        imagePath: `/images/products/${p.id}.jpg`,
        sourceUrl: null,
        matchStatus: "missing",
      });
    }

    await sleep(250); // Respectful rate limiting
  }

  fs.writeFileSync("product-image-audit.json", JSON.stringify(audit, null, 2));
  console.log("Saved product-image-audit.json");
}

main();
