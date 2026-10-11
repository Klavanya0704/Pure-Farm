import type { CourseLesson } from "./types";

export const AGRICULTURE_LESSONS: CourseLesson[] = [
  {
    id: "agri-1-l1",
    courseId: "agri-1",
    lessonNumber: 1,
    duration: "15 mins",
    title: "Introduction to Modern Agricultural Practices",
    summary: "Overview of modern machinery, soil preparation, and crop rotation for high yield.",
    content:
      "Modern farming combines traditional agricultural knowledge with scientific techniques such as soil testing, balanced fertilization, and mechanized tillage to maximize crop production while preserving land quality.",
    keyPoints: [
      "Use certified seeds with high germination rates",
      "Perform soil testing before every sowing season",
      "Adopt crop rotation to maintain soil microbial balance",
    ],
    farmingTip:
      "Prepare land with deep summer ploughing to expose weed seeds and soil pests to heat.",
  },
  {
    id: "agri-1-l2",
    courseId: "agri-1",
    lessonNumber: 2,
    duration: "20 mins",
    title: "Land Preparation and Field Layout",
    summary: "Proper field levelling, bunding, and channel creation for uniform irrigation.",
    content:
      "Proper land levelling prevents waterlogging and ensures even moisture distribution across the field. Laser levelling can save up to 20% irrigation water and increase crop yield.",
    keyPoints: [
      "Laser land levelling improves irrigation efficiency",
      "Construct firm field bunds to prevent soil erosion",
      "Ensure proper drainage channels for heavy rain periods",
    ],
    farmingTip:
      "Levelling field surfaces reduces seed loss during heavy rain and ensures uniform germination.",
  },
  {
    id: "agri-1-l3",
    courseId: "agri-1",
    lessonNumber: 3,
    duration: "25 mins",
    title: "Seed Selection and Sowing Techniques",
    summary: "How to choose high-quality seeds, seed treatment, and optimum seed depth.",
    content:
      "Selecting disease-resistant hybrid or certified seed varieties suitable for local agro-climatic conditions is the foundation of high productivity. Seed treatment with bio-agents or fungicides protects young roots.",
    keyPoints: [
      "Treat seeds with Trichoderma or fungicide before sowing",
      "Maintain proper seed spacing and depth for crop canopy",
      "Test seed germination percentage before large-scale field planting",
    ],
    farmingTip:
      "Soak paddy seeds in 1% salt water to remove light, hollow seeds before nursery bed preparation.",
  },
  {
    id: "agri-1-l4",
    courseId: "agri-1",
    lessonNumber: 4,
    duration: "20 mins",
    title: "Crop Monitoring and Harvesting Basics",
    summary: "Regular field scouting for pests, water stress, and identifying crop maturity.",
    content:
      "Regular field inspection helps farmers detect pest infestations, nutrient deficiencies, and water stress early. Timely harvesting at physiological maturity minimizes grain shattering and quality loss.",
    keyPoints: [
      "Inspect crops at least twice a week during critical growth stages",
      "Check lower leaf surfaces for early pest egg clusters",
      "Harvest grains when moisture content drops to 14-16%",
    ],
    farmingTip:
      "Harvest crops early in the morning when moisture content is stable to prevent grain loss.",
  },
  {
    id: "agri-2-l1",
    courseId: "agri-2",
    lessonNumber: 1,
    duration: "20 mins",
    title: "Soil Testing and pH Balance",
    summary:
      "How to collect soil samples, understand pH values, and correct acidic or alkaline soil.",
    content:
      "Soil testing reveals the availability of primary and micronutrients in the field. Soil pH affects nutrient uptake; lime is used for acidic soils while gypsum is recommended for alkaline soils.",
    keyPoints: [
      "Collect soil samples from 5 to 8 zig-zag field locations",
      "Ideal soil pH for most crops is between 6.5 and 7.5",
      "Apply agricultural lime for acidic soils (pH < 6.0)",
    ],
    farmingTip:
      "Do not take soil samples directly from field bunds, manure heaps, or tree shadows.",
  },
  {
    id: "agri-2-l2",
    courseId: "agri-2",
    lessonNumber: 2,
    duration: "25 mins",
    title: "Primary Nutrients: N, P, K Management",
    summary: "Balanced application of Nitrogen, Phosphorus, and Potassium based on crop stage.",
    content:
      "Nitrogen promotes vegetative leaf growth, Phosphorus boosts root development, and Potassium enhances crop disease resistance and grain filling. Split application of Nitrogen reduces leaching losses.",
    keyPoints: [
      "Apply full dose of Phosphorus and Potassium at basal sowing stage",
      "Apply Nitrogen in 2 to 3 split doses matching growth peaks",
      "Avoid excessive Nitrogen spray which attracts sap-sucking pests",
    ],
    farmingTip:
      "Use neem-coated urea to slow down Nitrogen release and improve plant absorption efficiency.",
  },
  {
    id: "agri-2-l3",
    courseId: "agri-2",
    lessonNumber: 3,
    duration: "20 mins",
    title: "Organic Manures and Bio-fertilizers",
    summary: "Role of FYM, vermicompost, Rhizobium, and Azotobacter in soil health.",
    content:
      "Organic manures increase soil organic carbon, improve water holding capacity, and stimulate beneficial soil microbes. Bio-fertilizers convert atmospheric nitrogen into plant-absorbable forms.",
    keyPoints: [
      "Apply well-decomposed Farm Yard Manure (FYM) 3 weeks before sowing",
      "Inoculate legume seeds with Rhizobium culture",
      "Use Phosphate Solubilizing Bacteria (PSB) to unlock fixed soil phosphorus",
    ],
    farmingTip: "Store FYM in shaded pits covered with soil to retain Nitrogen content.",
  },
  {
    id: "agri-2-l4",
    courseId: "agri-2",
    lessonNumber: 4,
    duration: "25 mins",
    title: "Soil Organic Matter and Carbon Conservation",
    summary: "Building soil humus, green manuring, and preventing soil erosion.",
    content:
      "Soil organic matter is the foundation of soil fertility. Incorporating crop residues, green manure crops like Sunn Hemp or Dhaincha, and practicing zero-tillage builds long-term soil carbon.",
    keyPoints: [
      "Incorporate crop residues into soil instead of burning",
      "Sow green manure crops like Dhaincha before Kharif paddy",
      "Mulch crop rows to conserve soil moisture and suppress weeds",
    ],
    farmingTip:
      "Incorporating 45-day-old Dhaincha into soil adds up to 80 kg Nitrogen per hectare.",
  },
  {
    id: "agri-3-l1",
    courseId: "agri-3",
    lessonNumber: 1,
    duration: "15 mins",
    title: "Kharif, Rabi, and Zaid Crop Cycles",
    summary: "Planning crops around monsoon timings, winter season, and summer irrigation.",
    content:
      "India's agricultural calendar is divided into Kharif (monsoon crops like Paddy, Maize, Cotton), Rabi (winter crops like Wheat, Mustard, Gram), and Zaid (summer crops like Watermelon, Cucumber, Pulses).",
    keyPoints: [
      "Kharif sowing depends on early monsoon rain arrivals",
      "Rabi crops require cool winter temperatures during grain filling",
      "Zaid crops offer quick short-duration income between main seasons",
    ],
    farmingTip:
      "Select short-duration Kharif varieties if monsoon rainfall is delayed in your region.",
  },
  {
    id: "agri-3-l2",
    courseId: "agri-3",
    lessonNumber: 2,
    duration: "20 mins",
    title: "Crop Rotation Strategies",
    summary: "Alternating cereals with legumes to maintain soil fertility and break pest cycles.",
    content:
      "Monoculture depletes specific soil nutrients and builds up soil-borne diseases. Rotating heavy-feeding cereal crops with nitrogen-fixing leguminous crops restores soil balance naturally.",
    keyPoints: [
      "Rotate Paddy/Wheat with Gram, Moong, or Groundnut",
      "Legumes fix atmospheric nitrogen for subsequent cereal crops",
      "Crop rotation breaks life cycles of host-specific pests and weeds",
    ],
    farmingTip: "Planting summer Moong after Rabi Wheat adds natural nitrogen and extra income.",
  },
  {
    id: "agri-3-l3",
    courseId: "agri-3",
    lessonNumber: 3,
    duration: "20 mins",
    title: "Intercropping and Companion Planting",
    summary: "Maximizing land efficiency by growing complementary crops together.",
    content:
      "Intercropping involves cultivating two or more crops simultaneously in the same field in specific row patterns. It reduces risk against total crop failure and optimizes sunlight and water use.",
    keyPoints: [
      "Intercrop Maize with Cowpea or Arhar for ground cover",
      "Grow Marigold along field borders as a trap crop for nematodes",
      "Maintain proper inter-row spacing to prevent light competition",
    ],
    farmingTip:
      "Border rows of tall Maize or Sorghum act as natural windbreakers for delicate vegetable crops.",
  },
  {
    id: "agri-3-l4",
    courseId: "agri-3",
    lessonNumber: 4,
    duration: "15 mins",
    title: "Weather-Based Sowing Schedules",
    summary: "Using rainfall forecasts and temperature windows for optimal sowing.",
    content:
      "Sowing at the right soil temperature and moisture condition ensures uniform seed emergence. Climate advisory apps provide localized weather alerts to guide sowing dates.",
    keyPoints: [
      "Avoid sowing seeds right before heavy rain to prevent soil crusting",
      "Ensure soil moisture is adequate at root depth before seed placement",
      "Use certified weather advisories for localized spray and sowing decisions",
    ],
    farmingTip:
      "Check 5-day local rainfall forecasts before scheduling large-scale sowing operations.",
  },
  {
    id: "agri-4-l1",
    courseId: "agri-4",
    lessonNumber: 1,
    duration: "20 mins",
    title: "Critical Crop Water Requirement Stages",
    summary: "Identifying critical growth stages when crops must receive irrigation.",
    content:
      "Crops have specific growth stages where moisture stress causes maximum yield loss, such as flowering, grain filling, and root establishment. Timely watering during these stages is essential.",
    keyPoints: [
      "Paddy requires critical water at tillering and panicle initiation",
      "Wheat needs guaranteed irrigation at Crown Root Initiation (CRI) stage",
      "Moisture stress during flowering causes severe flower drop",
    ],
    farmingTip:
      "Never miss irrigation during the Crown Root Initiation stage (20-25 days after Wheat sowing).",
  },
  {
    id: "agri-4-l2",
    courseId: "agri-4",
    lessonNumber: 2,
    duration: "25 mins",
    title: "Drip and Sprinkler Irrigation Systems",
    summary: "Principles of micro-irrigation, water savings, and root zone delivery.",
    content:
      "Drip irrigation delivers water directly to plant roots in precise drops, reducing water evaporation and weed growth. Sprinkler systems simulate natural rainfall for closely spaced crops.",
    keyPoints: [
      "Drip irrigation saves 40-60% water compared to flood irrigation",
      "Reduces weed emergence in inter-row spaces",
      "Enables precise fertigation directly through water drippers",
    ],
    farmingTip: "Clean drip line filters weekly to prevent emitter clogging from sand and algae.",
  },
  {
    id: "agri-4-l3",
    courseId: "agri-4",
    lessonNumber: 3,
    duration: "20 mins",
    title: "Rainwater Harvesting & Farm Ponds",
    summary: "Capturing monsoon runoff water for dry-spell protective irrigation.",
    content:
      "Farm ponds collect excess rainwater runoff during heavy monsoon rains. Stored water provides emergency protective irrigation during dry spells and recharges groundwater aquifers.",
    keyPoints: [
      "Construct farm ponds at the lowest elevation point of the land",
      "Line farm ponds with HDPE sheets to prevent seepage",
      "Use pond water for supplemental irrigation during dry spells",
    ],
    farmingTip: "Cover farm pond surfaces with shade nets to reduce evaporation loss.",
  },
  {
    id: "agri-4-l4",
    courseId: "agri-4",
    lessonNumber: 4,
    duration: "15 mins",
    title: "Soil Moisture Monitoring and Scheduling",
    summary: "Simple field tests to check root-zone moisture before watering.",
    content:
      "Checking soil moisture at root depth prevents over-watering, which causes root rot and nutrient leaching. Simple tensiometers or soil feel-and-appearance tests help determine exact irrigation needs.",
    keyPoints: [
      "Squeeze soil sample from 15 cm depth; if it forms a firm ball, irrigation is not needed",
      "Over-irrigation leads to oxygen deprivation in plant root zones",
      "Irrigate crops in early morning or evening to lower evaporation",
    ],
    farmingTip:
      "Irrigate fields during cool evening hours to minimize water loss from solar evaporation.",
  },
  {
    id: "agri-5-l1",
    courseId: "agri-5",
    lessonNumber: 1,
    duration: "20 mins",
    title: "Identifying Common Crop Pests and Insects",
    summary:
      "Distinguishing between sap-sucking insects, chewing caterpillars, and beneficial insects.",
    content:
      "Effective pest management begins with correct identification. Sap-sucking insects like aphids and whiteflies cause leaf curling, while caterpillars chew leaf tissue. Ladybugs and spiders are beneficial predators.",
    keyPoints: [
      "Aphids and thrips suck sap from tender top leaves",
      "Borer insects damage stems and fruit tissues",
      "Protect natural predators like ladybird beetles and lacewings",
    ],
    farmingTip:
      "Install yellow sticky cards in vegetable fields to detect whiteflies and aphids early.",
  },
  {
    id: "agri-5-l2",
    courseId: "agri-5",
    lessonNumber: 2,
    duration: "25 mins",
    title: "Integrated Pest Management (IPM) Principles",
    summary: "Combining cultural, biological, mechanical, and chemical pest controls.",
    content:
      "IPM combines multiple pest control methods to keep pest populations below Economic Threshold Levels (ETL) without over-relying on chemical sprays, safeguarding human health and ecosystem safety.",
    keyPoints: [
      "Use pheromone traps for monitoring insect pest populations",
      "Adopt bird perches in fields for natural predator feeding",
      "Apply chemical pesticides only when pest population exceeds ETL limit",
    ],
    farmingTip:
      "Set up 5 pheromone traps per acre for early detection of bollworm and stem borer moths.",
  },
  {
    id: "agri-5-l3",
    courseId: "agri-5",
    lessonNumber: 3,
    duration: "20 mins",
    title: "Safe Pesticide Handling & Spraying",
    summary: "Recommended dosage, safety gear, nozzle selection, and spray timing.",
    content:
      "Using chemical pesticides safely requires wearing protective gloves and masks, calculating precise doses per acre, using hollow-cone nozzles, and spraying during calm wind conditions.",
    keyPoints: [
      "Always wear gloves, face mask, and eye protection during mixing",
      "Calibrate sprayer nozzle to ensure uniform chemical droplet coverage",
      "Never spray pesticides against wind direction or during hot midday hours",
    ],
    farmingTip:
      "Spray insecticides during early morning or late afternoon when honeybees are inactive.",
  },
  {
    id: "agri-5-l4",
    courseId: "agri-5",
    lessonNumber: 4,
    duration: "20 mins",
    title: "Fungicides and Disease Prevention",
    summary: "Managing fungal blights, rots, and mildew through preventive sprays.",
    content:
      "Fungal diseases like leaf spot, blast, and powdery mildew thrive in warm, humid weather. Preventive sprays of copper oxychloride or bio-agents like Trichoderma protect crops before infection spreads.",
    keyPoints: [
      "Ensure adequate plant spacing for canopy ventilation",
      "Avoid over-fertilizing with Nitrogen, which creates soft foliage vulnerable to fungi",
      "Apply preventive copper or bio-fungicide sprays before continuous rains",
    ],
    farmingTip:
      "Remove and destroy infected plant debris from the field to stop fungal spore spread.",
  },
  {
    id: "agri-6-l1",
    courseId: "agri-6",
    lessonNumber: 1,
    duration: "20 mins",
    title: "Principles of Organic Farming & Certification",
    summary: "Understanding organic standards, bio-inputs, and conversion period.",
    content:
      "Organic farming avoids synthetic chemical fertilizers and toxic pesticides, relying instead on natural crop rotation, organic manures, and biological pest control to grow healthy, chemical-free food.",
    keyPoints: [
      "Complete 3-year organic conversion period for land certification",
      "Maintain detailed farm records of all organic inputs and harvests",
      "Use certified organic seeds or untreated local seeds",
    ],
    farmingTip:
      "Maintain a 3-meter buffer zone along field borders to prevent chemical drift from neighboring farms.",
  },
  {
    id: "agri-6-l2",
    courseId: "agri-6",
    lessonNumber: 2,
    duration: "25 mins",
    title: "Making Vermicompost & Panchagavya",
    summary: "Preparation steps for nutrient-rich vermicompost and bio-stimulants.",
    content:
      "Vermicompost uses earthworms to convert organic waste into high-grade humic manure. Panchagavya is a natural growth promoter prepared from cow dung, urine, milk, curd, and ghee.",
    keyPoints: [
      "Maintain 60% moisture content in vermicompost pits",
      "Keep vermicompost beds shaded from direct sunlight and heavy rain",
      "Dilute Panchagavya at 3% concentration for foliar spray",
    ],
    farmingTip:
      "Spraying 3% Panchagavya solution every 15 days increases flower retention and fruit setting.",
  },
  {
    id: "agri-6-l3",
    courseId: "agri-6",
    lessonNumber: 3,
    duration: "20 mins",
    title: "Green Manuring and Bio-mulching",
    summary: "Cultivating cover crops and organic mulches to enrich soil biology.",
    content:
      "Green manuring involves growing fast-growing leguminous plants and ploughing them back into the soil at flowering stage. Organic mulching with straw or leaves conserves moisture and suppresses weeds.",
    keyPoints: [
      "Sow Dhaincha or Sunn Hemp at 20-25 kg seed per acre",
      "Incorporate green manure into soil at 45 to 50 days growth stage",
      "Apply 3-4 inch straw mulch around vegetable crop rows",
    ],
    farmingTip:
      "Plough in green manure 2 weeks before main crop sowing to allow full soil decomposition.",
  },
  {
    id: "agri-6-l4",
    courseId: "agri-6",
    lessonNumber: 4,
    duration: "20 mins",
    title: "Natural Pest Control (Jeevamrutha & Neem Oil)",
    summary: "Preparing Jeevamrutha and neem seed kernel extract for field application.",
    content:
      "Jeevamrutha is a fermented bio-culture rich in beneficial microorganisms that revive soil health. Neem oil (10,000 ppm) acts as an effective repellent and growth disruptor for insect pests.",
    keyPoints: [
      "Ferment Jeevamrutha culture for 48-72 hours under shade",
      "Apply 200 liters of Jeevamrutha per acre through irrigation water",
      "Mix 5 ml neem oil with 1 ml liquid soap per liter of spray water",
    ],
    farmingTip:
      "Add liquid soap when preparing neem spray to ensure smooth emulsification in water.",
  },
  {
    id: "agri-7-l1",
    courseId: "agri-7",
    lessonNumber: 1,
    duration: "20 mins",
    title: "Precision Agri Tools & IoT Sensors",
    summary: "Using soil moisture sensors, weather stations, and smart controllers.",
    content:
      "Smart farming utilizes digital tools such as soil sensors, automatic weather stations, and satellite telemetry to monitor crop health, soil moisture, and weather in real time.",
    keyPoints: [
      "Soil sensors send automated moisture alerts to mobile phones",
      "Automatic Weather Stations (AWS) measure localized temperature and humidity",
      "Precision nutrient tools calculate exact fertilizer requirement per plot",
    ],
    farmingTip:
      "Place soil moisture sensors at both shallow (15 cm) and deep (30 cm) root zone levels.",
  },
  {
    id: "agri-7-l2",
    courseId: "agri-7",
    lessonNumber: 2,
    duration: "25 mins",
    title: "Drone Technology in Agriculture",
    summary: "Drone spraying for pesticides, fertilizers, and crop surveillance.",
    content:
      "Agricultural drones spray liquid fertilizers and pesticides in 1/10th of the time taken by hand sprayers, using 90% less water and ensuring ultra-uniform chemical coverage across fields.",
    keyPoints: [
      "Drones cover 1 acre field spray in under 10 minutes",
      "Reduces direct farmer exposure to chemical pesticides",
      "Multispectral drone cameras identify stressed crop patches early",
    ],
    farmingTip:
      "Fly drone sprayers at 2-3 meters height above crop canopy for optimum droplet distribution.",
  },
  {
    id: "agri-7-l3",
    courseId: "agri-7",
    lessonNumber: 3,
    duration: "20 mins",
    title: "Satellite Remote Sensing & Crop Mapping",
    summary: "Using NDVI indices to assess crop vigor and water stress.",
    content:
      "NDVI satellite imagery measures green vegetation health from space, helping farmers identify yield variations, nutrient shortages, and irrigation leaks.",
    keyPoints: [
      "NDVI values near 0.8 indicate healthy, dense green crop canopy",
      "Sudden drops in NDVI highlight disease outbreaks or drought stress",
      "Satellite maps help optimize field-specific fertilizer application",
    ],
    farmingTip: "Check satellite crop health maps weekly to identify underperforming field zones.",
  },
  {
    id: "agri-7-l4",
    courseId: "agri-7",
    lessonNumber: 4,
    duration: "15 mins",
    title: "Digital Portals and Agri Mobile Apps",
    summary: "Accessing market prices, weather alerts, and expert advice via phone.",
    content:
      "Digital mobile applications provide farmers with direct access to live mandi rates, weather forecasts, government scheme applications, and AI crop disease diagnosis using smartphone photos.",
    keyPoints: [
      "Upload crop leaf photos for instant AI disease identification",
      "Receive real-time weather risk alerts via SMS or app notifications",
      "Compare live mandi prices across nearby markets before selling",
    ],
    farmingTip:
      "Take clear, well-lit photos of diseased leaves showing both top and bottom surfaces for AI diagnosis.",
  },
  {
    id: "agri-8-l1",
    courseId: "agri-8",
    lessonNumber: 1,
    duration: "20 mins",
    title: "Determining Optimum Harvest Timing",
    summary: "Checking grain moisture percentage and crop maturity indicators.",
    content:
      "Harvesting at peak maturity prevents grain shattering in fields and ensures high market value. Grains harvested too early have high moisture and spoil during storage.",
    keyPoints: [
      "Harvest paddy when 80-85% grains turn straw golden yellow",
      "Grain moisture content should be 18-20% at harvest and dried to 12-14% for storage",
      "Avoid harvesting right after rain or heavy morning dew",
    ],
    farmingTip:
      "Sun-dry harvested grains on tarpaulin sheets to bring moisture content down to 12% before bagging.",
  },
  {
    id: "agri-8-l2",
    courseId: "agri-8",
    lessonNumber: 2,
    duration: "20 mins",
    title: "Cleaning, Grading, and Packaging",
    summary: "Removing chaff, sorting produce by size and quality for premium prices.",
    content:
      "Post-harvest cleaning and grading separates damaged, undersized, or diseased produce from top-quality items. Graded produce commands a 15-20% higher market price in mandis.",
    keyPoints: [
      "Use winnowers or grain cleaners to remove dust, chaff, and weed seeds",
      "Grade produce into Grade A, B, and C based on size, color, and texture",
      "Pack produce in clean jute or breathable HDPE bags with weight tags",
    ],
    farmingTip:
      "Never mix damaged or decaying fruits/vegetables with healthy produce during packaging.",
  },
  {
    id: "agri-8-l3",
    courseId: "agri-8",
    lessonNumber: 3,
    duration: "25 mins",
    title: "Scientific Grain Storage & Hermetic Bags",
    summary: "Preventing storage pests, weevils, and moisture damage in godowns.",
    content:
      "Grain storage losses from insect pests reach up to 10%. Using airtight hermetic bags deprives insects of oxygen, killing pests naturally without chemicals.",
    keyPoints: [
      "Store bags on wooden dunnage racks elevated 1 foot off the ground",
      "Maintain 1 meter gap between bag stacks and warehouse walls",
      "Use airtight hermetic bags to eliminate storage weevils naturally",
    ],
    farmingTip:
      "Place dry neem leaves inside storage bags to prevent insect infestation naturally.",
  },
  {
    id: "agri-8-l4",
    courseId: "agri-8",
    lessonNumber: 4,
    duration: "20 mins",
    title: "Cold Storage & Cold Chain Logistics",
    summary: "Pre-cooling, temperature control, and humidity management for perishable produce.",
    content:
      "Perishable produce requires cold storage maintenance (2-8°C) to slow down respiration rates, double shelf life, and enable transport to distant urban markets.",
    keyPoints: [
      "Pre-cool harvested vegetables within 2 hours of field picking",
      "Maintain relative humidity at 85-95% to prevent fruit shriveling",
      "Book certified cold storage spaces early during peak harvest seasons",
    ],
    farmingTip:
      "Pre-cool fruits in shaded packing sheds immediately after picking to remove field heat.",
  },
  {
    id: "agri-9-l1",
    courseId: "agri-9",
    lessonNumber: 1,
    duration: "15 mins",
    title: "Understanding Mandi Price Discovery",
    summary: "Factors influencing daily mandi prices: arrival volume, quality, and demand.",
    content:
      "Mandi prices fluctuate daily based on total crop arrival volumes, quality grading, buyer competition, and transportation costs. Monitoring arrival trends helps farmers choose the best selling day.",
    keyPoints: [
      "High market arrival volumes lead to temporary price dips",
      "Grade A produce commands premium prices even during supply gluts",
      "Track market arrival statistics on Agmarknet or PureFarm portal",
    ],
    farmingTip:
      "Avoid selling on peak arrival Mondays when mandi supply overflow depresses prices.",
  },
  {
    id: "agri-9-l2",
    courseId: "agri-9",
    lessonNumber: 2,
    duration: "20 mins",
    title: "e-NAM (Electronic National Agriculture Market)",
    summary: "Registering on e-NAM, online quality testing, and transparent digital bidding.",
    content:
      "e-NAM connects physical mandis across India into a single online trading platform. Farmers can sell produce to distant traders through transparent digital auctions and direct bank payments.",
    keyPoints: [
      "Register farmer account on e-NAM portal using Aadhaar and bank details",
      "Get produce quality sampled and tested at e-NAM assaying labs",
      "Receive direct online payment into bank account within 24 hours",
    ],
    farmingTip:
      "Assaying quality test reports on e-NAM help farmers command better prices from online buyers.",
  },
  {
    id: "agri-9-l3",
    courseId: "agri-9",
    lessonNumber: 3,
    duration: "20 mins",
    title: "Direct Selling to Retailers & FPOs",
    summary: "Forming Farmer Producer Organizations (FPOs) for bulk bargaining power.",
    content:
      "Selling through FPOs or direct supply contracts with retail chains bypasses multiple middleman commissions, increasing farmer profit margins by 15-20%.",
    keyPoints: [
      "FPOs aggregate small farmer produce into large commercial lots",
      "Bulk purchasing of inputs lowers seed and fertilizer costs",
      "Direct contracts offer pre-agreed fixed price protection",
    ],
    farmingTip:
      "Join a local FPO to aggregate small crop quantities into bulk lots that attract corporate buyers.",
  },
  {
    id: "agri-9-l4",
    courseId: "agri-9",
    lessonNumber: 4,
    duration: "20 mins",
    title: "Value Addition & Primary Processing",
    summary: "Processing crops into flour, oil, dried fruits, or spices for higher profit.",
    content:
      "Primary processing—such as milling mustard into oil, converting paddy to rice, or drying turmeric and chillies—transforms raw agricultural commodities into high-value processed products.",
    keyPoints: [
      "Simple milling and packaging doubles profit margins compared to raw grain sales",
      "Solar drying extends shelf life of perishable chillies and fruits",
      "Obtain basic FSSAI registration for selling packaged processed foods",
    ],
    farmingTip:
      "Solar drying tomatoes and chillies creates shelf-stable products that sell at 3x raw prices.",
  },
  {
    id: "agri-10-l1",
    courseId: "agri-10",
    lessonNumber: 1,
    duration: "15 mins",
    title: "PM-KISAN Income Support Scheme",
    summary: "Eligibility criteria, enrollment process, Aadhaar seeding, and status tracking.",
    content:
      "PM-KISAN provides Rs. 6,000 per year in three equal installments of Rs. 2,000 directly into the bank accounts of landholding farmer families across India.",
    keyPoints: [
      "Rs. 6,000 annual income support transferred directly via DBT",
      "Requires land ownership records (Khata/Khasra) and Aadhaar linkage",
      "Check installment payment status on PM-KISAN official portal",
    ],
    farmingTip:
      "Ensure your bank account is e-KYC verified and seeded with Aadhaar to receive installments without delay.",
  },
  {
    id: "agri-10-l2",
    courseId: "agri-10",
    lessonNumber: 2,
    duration: "15 mins",
    title: "Soil Health Card Scheme",
    summary:
      "How to get free soil testing, reading soil card results, and fertilizer recommendations.",
    content:
      "The Soil Health Card scheme provides farmers with customized nutrient advisories every 3 years, guiding balanced fertilizer application to lower cultivation costs.",
    keyPoints: [
      "Free soil testing conducted by government agriculture laboratories",
      "Card specifies status of 12 soil parameters including N, P, K, and micro-nutrients",
      "Provides crop-specific fertilizer dosage recommendations",
    ],
    farmingTip:
      "Follow Soil Health Card dosage recommendations to save up to 20% on unnecessary fertilizer expenses.",
  },
  {
    id: "agri-10-l3",
    courseId: "agri-10",
    lessonNumber: 3,
    duration: "20 mins",
    title: "Kisan Credit Card (KCC) Scheme",
    summary: "Low-interest crop loans, interest subvention, and application requirements.",
    content:
      "Kisan Credit Card gives farmers flexible working capital credit for crop cultivation at concessional 4% interest rates (with prompt repayment interest subvention).",
    keyPoints: [
      "Provides short-term crop loans up to Rs. 3 Lakh at 4% effective interest",
      "No collateral required for crop loans up to Rs. 1.6 Lakh",
      "Covers crop cultivation, post-harvest expenses, and livestock maintenance",
    ],
    farmingTip:
      "Repay KCC loan before due date to claim 3% prompt repayment interest subvention bonus.",
  },
  {
    id: "agri-10-l4",
    courseId: "agri-10",
    lessonNumber: 4,
    duration: "20 mins",
    title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    summary: "Crop insurance coverage, low premium rates, crop loss reporting within 72 hours.",
    content:
      "PMFBY protects farmers against non-preventable crop losses from natural calamities, droughts, floods, and pest attacks. Premium is capped at just 2% for Kharif and 1.5% for Rabi crops.",
    keyPoints: [
      "Farmer premium capped at 2% for Kharif, 1.5% for Rabi, 5% for commercial crops",
      "Covers prevented sowing, standing crop damage, and localized hailstorm loss",
      "Must report crop loss within 72 hours to insurance company or agri officer",
    ],
    farmingTip:
      "In case of hailstorm or localized flooding, inform the insurance company within 72 hours via crop insurance app.",
  },
  {
    id: "agri-11-l1",
    courseId: "agri-11",
    lessonNumber: 1,
    duration: "20 mins",
    title: "Designing Micro-Drip Layouts",
    summary: "Calculating lateral line spacing, emitter discharge rates, and pressure regulators.",
    content:
      "Precision drip systems require correct sizing of mainlines, submains, lateral tubes, and inline drippers based on soil texture, slope, and crop row spacing.",
    keyPoints: [
      "Select 16 mm lateral lines with 2 LPH or 4 LPH pressure-compensating emitters",
      "Maintain operating pressure at 1.0 to 1.5 kg/cm\u00b2 using pressure regulators",
      "Install flush valves at lateral ends for periodic sediment flushing",
    ],
    farmingTip:
      "Operate drip systems early in the morning to maintain optimal hydraulic pressure across laterals.",
  },
  {
    id: "agri-11-l2",
    courseId: "agri-11",
    lessonNumber: 2,
    duration: "25 mins",
    title: "Fertigation: Dosing Water-Soluble Fertilizers",
    summary: "Using Venturi injectors and fertilizer tanks to feed crops through drippers.",
    content:
      "Fertigation delivers liquid water-soluble fertilizers directly into root zones via drip lines, raising nutrient efficiency from 40% to 80%.",
    keyPoints: [
      "Use 100% water-soluble fertilizers to prevent line clogging",
      "Inject fertilizers during middle 50% of total irrigation cycle duration",
      "Flush drip lines with clean water for 15 minutes after every fertigation session",
    ],
    farmingTip:
      "Always run clean water through drip lines for 15 minutes after fertigation to wash residual chemical salts.",
  },
  {
    id: "agri-11-l3",
    courseId: "agri-11",
    lessonNumber: 3,
    duration: "20 mins",
    title: "Acid Treatment & Maintenance of Drippers",
    summary:
      "Cleaning salt deposits and algae from drippers using hydrochloric or phosphoric acid.",
    content:
      "Hard water and algae cause dripper clogging over time. Periodic acid treatment with dilute Hydrochloric (HCl) or Phosphoric acid dissolves mineral scale and keeps drippers operating at 100% flow rate.",
    keyPoints: [
      "Check drip emitter flow rate uniformity across field lines monthly",
      "Perform acid treatment when emitter discharge drops by more than 10%",
      "Use 0.1% Hydrochloric acid solution and let it sit in laterals for 24 hours before flushing",
    ],
    farmingTip: "Flush lateral ends every 15 days by opening end caps while drip pump is running.",
  },
  {
    id: "agri-11-l4",
    courseId: "agri-11",
    lessonNumber: 4,
    duration: "20 mins",
    title: "Precision Soil Sensor Integration",
    summary: "Connecting soil moisture and EC sensors to automated irrigation valves.",
    content:
      "Integrating soil moisture probes and Electrical Conductivity (EC) sensors with automated solenoid valves turns drip systems into smart precision systems that irrigate automatically when soil moisture drops.",
    keyPoints: [
      "Automated solenoid valves open and close based on real-time soil moisture thresholds",
      "EC sensors monitor root zone salinity and prevent fertilizer burn",
      "Reduces labor costs and water consumption by an additional 25%",
    ],
    farmingTip:
      "Calibrate soil sensors at the start of each season using saturated and field capacity soil samples.",
  },
  {
    id: "agri-12-l1",
    courseId: "agri-12",
    lessonNumber: 1,
    duration: "20 mins",
    title: "Climate Risk Assessment & Resilient Varieties",
    summary: "Selecting drought-tolerant, flood-tolerant, and short-duration crop varieties.",
    content:
      "Climate-smart agriculture focuses on building farm resilience against extreme weather events. Planting stress-tolerant seeds like drought-resistant maize or flood-tolerant Sub1 paddy safeguards harvests.",
    keyPoints: [
      "Sow climate-resilient crop varieties certified by ICAR / State Agri Universities",
      "Adopt short-duration varieties in drought-prone districts",
      "Diversify crop portfolio with climate-hardy millets (Ragi, Bajra, Jowar)",
    ],
    farmingTip: "Millets consume 70% less water than paddy and survive high heat dry spells.",
  },
  {
    id: "agri-12-l2",
    courseId: "agri-12",
    lessonNumber: 2,
    duration: "25 mins",
    title: "Zero-Tillage & Conservation Agriculture",
    summary: "Direct sowing with Happy Seeder to conserve soil moisture and lower diesel costs.",
    content:
      "Zero-tillage involves sowing seeds directly into unploughed fields retaining previous crop residues. Using machines like Happy Seeder saves tractor fuel, preserves soil structure, and reduces soil evaporation.",
    keyPoints: [
      "Happy Seeder sows Wheat directly into standing Paddy stubble without burning",
      "Saves Rs. 2,500 to 3,000 per acre in tractor diesel and land preparation costs",
      "Organic residue mulch retains soil moisture during hot winds",
    ],
    farmingTip:
      "Zero-tillage wheat sowing advances planting date by 7-10 days, preventing terminal heat stress in March.",
  },
  {
    id: "agri-12-l3",
    courseId: "agri-12",
    lessonNumber: 3,
    duration: "20 mins",
    title: "Extreme Weather Mitigation (Floods & Heatwaves)",
    summary: "Foliar sprays of Potassium and Salicylic acid during heat stress.",
    content:
      "Sudden heatwaves during grain filling shorten crop maturity and reduce grain weight. Applying foliar sprays of 1% Potassium Nitrate helps plants maintain cell turgor and withstand thermal stress.",
    keyPoints: [
      "Foliar spray of 1% KNO3 (10g/L water) protects crops during sudden heatwaves",
      "Ensure field drainage ditches are clear before heavy cyclone warnings",
      "Provide shade nets or protective sprinkler misting for high-value crops",
    ],
    farmingTip:
      "Apply light surface irrigation before expected night frost or extreme heatwaves to moderate field micro-climate.",
  },
  {
    id: "agri-12-l4",
    courseId: "agri-12",
    lessonNumber: 4,
    duration: "20 mins",
    title: "Agroforestry & Carbon Farming Integration",
    summary:
      "Planting border trees like Teak, Subabul, or Poplar for shade, timber, and carbon credits.",
    content:
      "Agroforestry integrates fast-growing trees along field borders. Trees act as windbreaks, yield timber/fruit income, capture carbon, and enrich soil through deep root nutrient cycling.",
    keyPoints: [
      "Plant Poplar, Melia Dubia, or Sandalwood along field boundaries",
      "Tree windbreaks reduce wind erosion and crop lodging during storms",
      "Generates additional long-term income alongside seasonal food crops",
    ],
    farmingTip:
      "Plant border trees along North-South lines to minimize shade competition with field crops.",
  },
];
