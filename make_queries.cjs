const fs = require("fs");

const content = fs.readFileSync("src/data/products.ts", "utf-8");
const regex = /^\s*\[\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",/gm;
let m;
const products = [];
let i = 1;
while ((m = regex.exec(content)) !== null) {
  const id = `p-${String(i).padStart(3, "0")}`;
  products.push({ id, name: m[1], category: m[3] });
  i++;
}

// Generate highly specific search queries
const searchQueries = {};
const negativeKeywords = [
  "molecule",
  "chemical",
  "structure",
  "formula",
  "vector",
  "illustration",
  "drawing",
  "cartoon",
  "clipart",
  "youtube",
  "ytimg",
  "logo",
  "poster",
  "academy",
  "step-by-step",
  "tutorial",
  "dreamstime",
  "shutterstock",
  "alamy",
  "png",
  "svg",
];

for (const p of products) {
  let query = p.name;

  if (p.category === "seeds") {
    if (query.includes("Paddy")) query = "paddy rice seeds agriculture photography";
    else if (query.includes("Maize")) query = "corn seeds agriculture photography";
    else if (query.includes("Wheat")) query = "wheat seeds grain macro photography";
    else if (query.includes("Cotton")) query = "cotton seeds agriculture photography";
    else if (query.includes("Groundnut")) query = "groundnut peanuts seeds photography";
    else if (query.includes("Tomato")) query = "tomato seeds close up photography";
    else if (query.includes("Onion")) query = "onion seeds close up photography";
    else if (query.includes("Brinjal")) query = "brinjal eggplant seeds photography";
    else if (query.includes("Chilli")) query = "chilli pepper seeds photography";
    else if (query.includes("Okra")) query = "okra seeds close up photography";
    else if (query.includes("Turmeric")) query = "turmeric rhizome agriculture photography";
    else if (query.includes("Ginger")) query = "ginger rhizome agriculture photography";
    else if (query.includes("Garlic")) query = "garlic bulbs seed agriculture photography";
    else if (query.includes("Potato")) query = "seed potatoes agriculture photography";
    else if (query.includes("Tissue Culture")) query = "banana tissue culture plantlet agriculture";
    else if (query.includes("Grafted Plant"))
      query = `${p.name.split("Grafted Plant")[0]} sapling agriculture photography`;
    else if (query.includes("Sapling"))
      query = `${p.name.split("Sapling")[0]} plant sapling agriculture photography`;
    else query = `${p.name.split("(")[0]} macro photography`;
  } else if (p.category === "fertilizers") {
    if (query.includes("Urea Liquid") || query.includes("Nano"))
      query = "IFFCO Nano liquid fertilizer bottle";
    else if (query.includes("Urea")) query = "Urea fertilizer sack bag agriculture";
    else if (query.includes("DAP")) query = "DAP fertilizer sack bag agriculture";
    else if (query.includes("MOP") || query.includes("Potash"))
      query = "Muriate of Potash fertilizer bag";
    else if (query.includes("NPK")) query = "NPK fertilizer bag agriculture";
    else if (query.includes("Super Phosphate")) query = "Single Super Phosphate fertilizer bag";
    else if (
      query.includes("Zinc") ||
      query.includes("Ammonium") ||
      query.includes("Calcium") ||
      query.includes("Boron") ||
      query.includes("Ferrous") ||
      query.includes("Sulphur") ||
      query.includes("Gypsum")
    )
      query = `${p.name.split("(")[0]} agricultural fertilizer bag`;
    else if (query.includes("Vermicompost")) query = "vermicompost organic manure bag agriculture";
    else if (query.includes("Neem Cake")) query = "neem cake fertilizer agriculture";
    else if (query.includes("Cow Dung")) query = "cow dung manure compost agriculture";
    else if (
      query.includes("Biofertiliser") ||
      query.includes("Bacteria") ||
      query.includes("Viride") ||
      query.includes("Fluorescens")
    )
      query = `${p.name.split("(")[0]} biofertilizer bottle packet agriculture`;
    else if (query.includes("Tonic") || query.includes("Jeevamrut"))
      query = `${p.name.split("(")[0]} organic liquid fertilizer bottle`;
    else query = `${p.name.split("(")[0]} fertilizer bag agriculture`;
  } else if (p.category === "tools") {
    if (query.includes("Knapsack")) query = "agricultural knapsack sprayer machine";
    else if (query.includes("Weeder")) query = "power weeder agriculture machine";
    else if (query.includes("Brush Cutter")) query = "brush cutter agriculture machine";
    else if (query.includes("Rotavator")) query = "tractor rotavator implement agriculture";
    else if (query.includes("Seed Drill")) query = "tractor seed drill implement agriculture";
    else if (query.includes("Irrigation") || query.includes("Sprinkler"))
      query = `${p.name.split("1 Acre")[0]} agriculture field`;
    else if (query.includes("Film") || query.includes("Net"))
      query = `${p.name.split("(")[0]} agriculture field`;
    else if (query.includes("Kit") || query.includes("Meter"))
      query = `${p.name} agriculture instrument`;
    else if (
      query.includes("Sickle") ||
      query.includes("Hoe") ||
      query.includes("Spade") ||
      query.includes("Secateur")
    )
      query = `${p.name} agriculture hand tool`;
    else if (query.includes("Chaff Cutter")) query = "electric chaff cutter machine agriculture";
    else if (query.includes("Pump"))
      query = `${p.name.split("5 HP")[0].split("3 HP")[0]} agriculture water pump`;
    else if (
      query.includes("Tarpaulin") ||
      query.includes("Gunny") ||
      query.includes("Silo") ||
      query.includes("Scale") ||
      query.includes("Trough") ||
      query.includes("Drinker") ||
      query.includes("Wheelbarrow") ||
      query.includes("Fogger") ||
      query.includes("Trap")
    )
      query = `${p.name.split("(")[0]} agriculture equipment`;
    else if (query.includes("Safety")) query = "farm safety mask gloves agriculture";
    else if (query.includes("Weather")) query = "digital weather station agriculture field";
    else if (query.includes("Trolley")) query = "tractor trolley agriculture";
    else query = `${p.name} agriculture tool`;
  }

  searchQueries[p.id] = query;
}

fs.writeFileSync("queries.json", JSON.stringify(searchQueries, null, 2));
console.log("Queries generated.");
