/**
 * Weather API Service for PureFarm
 * Provides verified live weather data, 24-hour hourly forecast timeline,
 * 10-day agricultural outlook, crop-specific field advisories, and campus location metadata.
 * Uses Open-Meteo WMO/ECMWF high-resolution models with OpenWeather fallback.
 */

export interface CampusAddress {
  line1: string;
  line2: string;
  line3: string;
}

export interface CampusLocation {
  key: string;
  name: string;
  shortName: string;
  weatherArea: string;
  lat: number;
  lon: number;
  elevation: number;
  address: CampusAddress;
}

export const SASI_CAMPUS: CampusLocation = {
  key: "sasi_campus",
  name: "Sasi Institute of Technology and Engineering, Tadepalligudem",
  shortName: "Sasi Institute (SITE), Tadepalligudem",
  weatherArea: "Tadepalligudem, West Godavari District, Andhra Pradesh, India",
  lat: 16.8147,
  lon: 81.5284,
  elevation: 14,
  address: {
    line1: "Department of MBA, Einstein Block",
    line2: "Sasi Institute of Technology and Engineering",
    line3: "Tadepalligudem, West Godavari District, Andhra Pradesh, India",
  },
};

export interface HourlyForecastItem {
  time: string; // e.g. "Now", "11:00 AM", "12:00 PM"
  isoTime: string;
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  iconCode: string;
  iconUrl: string;
  rainProb: number;
  windSpeed: number; // km/h
  humidity: number;
}

export interface ForecastDay {
  day: string;
  dateStr: string;
  condition: string;
  description: string;
  iconCode: string;
  iconUrl: string;
  high: number;
  low: number;
  rainProb: number;
  rainMm?: number;
  uvIndex?: number;
  advisory: string;
}

export interface WeatherData {
  locationName: string;
  campusInfo?: CampusAddress;
  isCampus?: boolean;
  lat?: number;
  lon?: number;
  elevation?: number;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  condition: string;
  description: string;
  iconCode: string;
  iconUrl: string;
  humidity: number;
  windSpeed: number; // km/h
  windDirection?: string;
  surfacePressure?: number; // hPa
  uvIndex?: number;
  dewPoint?: number; // °C
  rainMm: number;
  rainProb?: number;
  sunrise: string;
  sunset: string;
  forecast: ForecastDay[];
  hourly: HourlyForecastItem[];
  dataSource: string;
  lastUpdated: string;
}

export type WeatherErrorCode = "MISSING_KEY" | "FETCH_FAILED";

export class WeatherError extends Error {
  code: WeatherErrorCode;
  constructor(message: string, code: WeatherErrorCode) {
    super(message);
    this.code = code;
    this.name = "WeatherError";
  }
}

export interface LocationResult {
  name: string;
  state?: string;
  lat?: number;
  lon?: number;
  isCampus?: boolean;
  campusInfo?: CampusAddress;
}

export const LOCATION_COORDS: Record<
  string,
  { lat: number; lon: number; name: string; isCampus?: boolean; campusInfo?: CampusAddress }
> = {
  sasi_campus: {
    lat: SASI_CAMPUS.lat,
    lon: SASI_CAMPUS.lon,
    name: SASI_CAMPUS.name,
    isCampus: true,
    campusInfo: SASI_CAMPUS.address,
  },
  sasi: {
    lat: SASI_CAMPUS.lat,
    lon: SASI_CAMPUS.lon,
    name: SASI_CAMPUS.name,
    isCampus: true,
    campusInfo: SASI_CAMPUS.address,
  },
  tadepalligudem: {
    lat: 16.8147,
    lon: 81.5284,
    name: "Tadepalligudem, West Godavari, AP",
  },
  rajahmundry: { lat: 16.9833, lon: 81.7833, name: "Rajahmundry, AP" },
  bhimavaram: { lat: 16.5449, lon: 81.5212, name: "Bhimavaram, AP" },
  eluru: { lat: 16.7107, lon: 81.1035, name: "Eluru, AP" },
  vijayawada: { lat: 16.5062, lon: 80.6480, name: "Vijayawada, AP" },
  guntur: { lat: 16.3067, lon: 80.4365, name: "Guntur, AP" },
  visakhapatnam: { lat: 17.6868, lon: 83.2185, name: "Visakhapatnam, AP" },
  kakinada: { lat: 16.9891, lon: 82.2475, name: "Kakinada, AP" },
  kurnool: { lat: 15.8281, lon: 78.0373, name: "Kurnool, AP" },
  nellore: { lat: 14.4426, lon: 79.9865, name: "Nellore, AP" },
  anantapur: { lat: 14.6819, lon: 77.6006, name: "Anantapur, AP" },
  tirupati: { lat: 13.6288, lon: 79.4192, name: "Tirupati, AP" },
  kadapa: { lat: 14.4673, lon: 78.8242, name: "Kadapa, AP" },
  chittoor: { lat: 13.2172, lon: 79.1003, name: "Chittoor, AP" },
  ongole: { lat: 15.5057, lon: 80.0499, name: "Ongole, AP" },
  srikakulam: { lat: 18.2969, lon: 83.8967, name: "Srikakulam, AP" },
  vizianagaram: { lat: 18.1133, lon: 83.4029, name: "Vizianagaram, AP" },
  machilipatnam: { lat: 16.1875, lon: 81.1389, name: "Machilipatnam, AP" },
  tenali: { lat: 16.2437, lon: 80.6400, name: "Tenali, AP" },
  nandyal: { lat: 15.4886, lon: 78.4836, name: "Nandyal, AP" },
  hyderabad: { lat: 17.3850, lon: 78.4867, name: "Hyderabad, TS" },
  warangal: { lat: 17.9689, lon: 79.5941, name: "Warangal, TS" },
  karimnagar: { lat: 18.4386, lon: 79.1288, name: "Karimnagar, TS" },
  khammam: { lat: 17.2473, lon: 80.1514, name: "Khammam, TS" },
  nizamabad: { lat: 18.6725, lon: 78.0941, name: "Nizamabad, TS" },
  mahbubnagar: { lat: 16.7488, lon: 77.9856, name: "Mahbubnagar, TS" },
  nalgonda: { lat: 17.0577, lon: 79.2684, name: "Nalgonda, TS" },
  bengaluru: { lat: 12.9716, lon: 77.5946, name: "Bengaluru, KA" },
  mysuru: { lat: 12.2958, lon: 76.6394, name: "Mysuru, KA" },
  hubli: { lat: 15.3647, lon: 75.1240, name: "Hubli, KA" },
  chennai: { lat: 13.0827, lon: 80.2707, name: "Chennai, TN" },
  coimbatore: { lat: 11.0168, lon: 76.9558, name: "Coimbatore, TN" },
  madurai: { lat: 9.9252, lon: 78.1198, name: "Madurai, TN" },
  pune: { lat: 18.5204, lon: 73.8567, name: "Pune, Maharashtra" },
  nashik: { lat: 19.9975, lon: 73.7898, name: "Nashik, Maharashtra" },
  nagpur: { lat: 21.1458, lon: 79.0882, name: "Nagpur, Maharashtra" },
  mumbai: { lat: 19.0760, lon: 72.8777, name: "Mumbai, Maharashtra" },
  ahmedabad: { lat: 23.0225, lon: 72.5714, name: "Ahmedabad, Gujarat" },
  surat: { lat: 21.1702, lon: 72.8311, name: "Surat, Gujarat" },
  jaipur: { lat: 26.9124, lon: 75.7873, name: "Jaipur, Rajasthan" },
  ludhiana: { lat: 30.9010, lon: 75.8573, name: "Ludhiana, Punjab" },
  amritsar: { lat: 31.6340, lon: 74.8723, name: "Amritsar, Punjab" },
  chandigarh: { lat: 30.7333, lon: 76.7794, name: "Chandigarh" },
  lucknow: { lat: 26.8467, lon: 80.9462, name: "Lucknow, UP" },
  agra: { lat: 27.1767, lon: 78.0081, name: "Agra, UP" },
  varanasi: { lat: 25.3176, lon: 82.9739, name: "Varanasi, UP" },
  delhi: { lat: 28.6139, lon: 77.2090, name: "Delhi" },
  patna: { lat: 25.5941, lon: 85.1376, name: "Patna, Bihar" },
  kolkata: { lat: 22.5726, lon: 88.3639, name: "Kolkata, WB" },
  bhopal: { lat: 23.2599, lon: 77.4126, name: "Bhopal, MP" },
  indore: { lat: 22.7196, lon: 75.8577, name: "Indore, MP" },
};

export async function searchLocations(query: string): Promise<LocationResult[]> {
  const clean = query.trim().toLowerCase();

  const results: LocationResult[] = [];

  // Always offer Sasi Campus first if search is empty or relates to campus/site/mba/tadepalli
  const matchesCampus =
    !clean ||
    clean.includes("sasi") ||
    clean.includes("site") ||
    clean.includes("mba") ||
    clean.includes("einstein") ||
    clean.includes("tadepalli") ||
    clean.includes("campus");

  if (matchesCampus) {
    results.push({
      name: SASI_CAMPUS.name,
      state: "West Godavari District, Andhra Pradesh",
      lat: SASI_CAMPUS.lat,
      lon: SASI_CAMPUS.lon,
      isCampus: true,
      campusInfo: SASI_CAMPUS.address,
    });
  }

  // Check known locations
  for (const [key, val] of Object.entries(LOCATION_COORDS)) {
    if (key === "sasi_campus" || key === "sasi") continue; // already handled
    if (!clean || key.includes(clean) || val.name.toLowerCase().includes(clean)) {
      const parts = val.name.split(",");
      const exists = results.some((r) => r.name.toLowerCase() === val.name.toLowerCase());
      if (!exists) {
        results.push({
          name: val.name,
          state: parts.length > 1 ? parts.slice(1).join(",").trim() : undefined,
          lat: val.lat,
          lon: val.lon,
        });
      }
    }
  }

  if (!clean || clean.length < 2) {
    return results.slice(0, 25);
  }

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(clean)}&count=6&language=en&format=json`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(geoUrl, { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results)) {
        for (const r of data.results) {
          const regionStr = [r.admin1, r.country_code?.toUpperCase()].filter(Boolean).join(", ");
          const fullName = regionStr ? `${r.name}, ${regionStr}` : r.name;
          const exists = results.some(
            (m) =>
              m.name.toLowerCase() === fullName.toLowerCase() ||
              m.name.toLowerCase().startsWith(r.name.toLowerCase()),
          );
          if (!exists) {
            results.push({
              name: fullName,
              state: r.admin1 || r.country,
              lat: r.latitude,
              lon: r.longitude,
            });
          }
        }
      }
    }
  } catch {
    // Graceful offline fallback
  }

  return results.slice(0, 30);
}

export function degreesToCompass(deg: number): string {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const val = Math.round((deg % 360) / 22.5);
  return directions[val % 16];
}

export function formatIsoTime(isoString?: string): string {
  if (!isoString) return "06:00 AM";
  try {
    const timePart = isoString.includes("T") ? isoString.split("T")[1] : isoString;
    const [hhStr, mmStr] = timePart.split(":");
    let hours = parseInt(hhStr, 10);
    const minutes = parseInt(mmStr, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${formattedMinutes} ${ampm}`;
  } catch {
    return isoString;
  }
}

export function formatHourlyTimeLabel(isoString: string, isFirst: boolean = false): string {
  if (isFirst) return "Now";
  try {
    const timePart = isoString.includes("T") ? isoString.split("T")[1] : isoString;
    const [hhStr] = timePart.split(":");
    let hours = parseInt(hhStr, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours} ${ampm}`;
  } catch {
    return isoString;
  }
}

function generateAdvisory(
  condition: string,
  temp: number,
  humidity: number,
  rainProb: number,
): string {
  if (rainProb > 60 || condition.toLowerCase().includes("rain") || condition.toLowerCase().includes("thunder")) {
    return "High rain probability. Postpone spraying and irrigation. Ensure field drainage.";
  }
  if (temp > 35) {
    return "Extreme heat stress. Schedule early morning irrigation and apply soil mulch.";
  }
  if (humidity > 80) {
    return "High humidity alert. Monitor closely for fungal blast/blight infections.";
  }
  if (temp < 15) {
    return "Cool weather window. Growth rate slow; protect nursery beds from frost.";
  }
  return "Favorable agricultural weather. Proceed with scheduled field maintenance.";
}

function formatUnixTime(timestamp: number, timezoneOffsetSec: number = 19800): string {
  try {
    const date = new Date((timestamp + timezoneOffsetSec) * 1000);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  } catch {
    return "06:00 AM";
  }
}

export interface CropAdvisory {
  category: "Thermal" | "Irrigation" | "Pest & Disease" | "Foliar Spray" | "Seasonal Operations";
  title: string;
  status: "optimal" | "warning" | "alert" | "info";
  recommendation: string;
}

export interface CropProfile {
  name: string;
  emoji: string;
  season: string;
  duration: string;
  idealTempMin: number;
  idealTempMax: number;
  waterNeed: "High" | "Medium" | "Low";
  vulnerablePests: string[];
  tip: string;
}

export const CROP_PROFILES: Record<string, CropProfile> = {
  Paddy: {
    name: "Paddy",
    emoji: "🌾",
    season: "Kharif",
    duration: "120-140 days",
    idealTempMin: 20,
    idealTempMax: 33,
    waterNeed: "High",
    vulnerablePests: ["Leaf Folder", "Stem Borer", "Blast Fungi"],
    tip: "Transplant after first monsoon spell and maintain 2-5cm standing water during tillering.",
  },
  Wheat: {
    name: "Wheat",
    emoji: "🌾",
    season: "Rabi",
    duration: "130-150 days",
    idealTempMin: 12,
    idealTempMax: 26,
    waterNeed: "Medium",
    vulnerablePests: ["Yellow Rust", "Mustard Aphids", "Termites"],
    tip: "First irrigation is critical at Crown Root Initiation (21 days after sowing).",
  },
  Cotton: {
    name: "Cotton",
    emoji: "☁️",
    season: "Kharif",
    duration: "160-180 days",
    idealTempMin: 21,
    idealTempMax: 35,
    waterNeed: "Medium",
    vulnerablePests: ["Pink Bollworm", "Whitefly", "Jassids"],
    tip: "Use pheromone traps for pink bollworm and rotate insecticide spray schedules.",
  },
  Mustard: {
    name: "Mustard",
    emoji: "🌼",
    season: "Rabi",
    duration: "110-130 days",
    idealTempMin: 12,
    idealTempMax: 25,
    waterNeed: "Low",
    vulnerablePests: ["Mustard Aphids", "White Rust", "Downy Mildew"],
    tip: "Avoid excess irrigation at flowering stage and inspect lower leaves for aphids.",
  },
  Moong: {
    name: "Moong",
    emoji: "🫘",
    season: "Zaid / Summer",
    duration: "60-70 days",
    idealTempMin: 22,
    idealTempMax: 36,
    waterNeed: "Low",
    vulnerablePests: ["Yellow Mosaic Virus", "Whitefly", "Pod Borer"],
    tip: "Short-duration pulse crop; requires light irrigation during pod development.",
  },
  Mango: {
    name: "Mango",
    emoji: "🥭",
    season: "Perennial / Summer",
    duration: "Annual harvest",
    idealTempMin: 22,
    idealTempMax: 36,
    waterNeed: "Medium",
    vulnerablePests: ["Mango Hopper", "Powdery Mildew", "Anthracnose"],
    tip: "Protect flowering panicles from high humidity and unseasonal rains during bloom.",
  },
  Chilli: {
    name: "Chilli",
    emoji: "🌶️",
    season: "Kharif / Rabi",
    duration: "150-180 days",
    idealTempMin: 18,
    idealTempMax: 32,
    waterNeed: "Medium",
    vulnerablePests: ["Thrips", "Mites", "Fruit Rot / Dieback"],
    tip: "Ensure good field drainage to avoid root rot during cloudy humid spells.",
  },
  Tomato: {
    name: "Tomato",
    emoji: "🍅",
    season: "All Season",
    duration: "110-130 days",
    idealTempMin: 18,
    idealTempMax: 30,
    waterNeed: "Medium",
    vulnerablePests: ["Early Blight", "Fruit Borer", "Whitefly"],
    tip: "Stake vines and apply preventive bio-fungicide sprays during high humidity spells.",
  },
  Onion: {
    name: "Onion",
    emoji: "🧅",
    season: "Rabi / Kharif",
    duration: "120-150 days",
    idealTempMin: 15,
    idealTempMax: 28,
    waterNeed: "Medium",
    vulnerablePests: ["Thrips", "Purple Blotch"],
    tip: "Withhold irrigation 10-15 days before harvest to improve bulb storage life.",
  },
  Potato: {
    name: "Potato",
    emoji: "🥔",
    season: "Rabi",
    duration: "90-120 days",
    idealTempMin: 14,
    idealTempMax: 24,
    waterNeed: "Medium",
    vulnerablePests: ["Late Blight", "Aphids"],
    tip: "High humidity (>80%) triggers late blight; apply preventive mancozeb spray.",
  },
  Maize: {
    name: "Maize",
    emoji: "🌽",
    season: "Kharif / Rabi",
    duration: "90-110 days",
    idealTempMin: 18,
    idealTempMax: 33,
    waterNeed: "Medium",
    vulnerablePests: ["Fall Armyworm", "Stem Borer"],
    tip: "Scout central whorls for Fall Armyworm egg masses after initial showers.",
  },
  Sugarcane: {
    name: "Sugarcane",
    emoji: "🎋",
    season: "Annual",
    duration: "300-360 days",
    idealTempMin: 24,
    idealTempMax: 38,
    waterNeed: "High",
    vulnerablePests: ["Early Shoot Borer", "Red Rot"],
    tip: "Provide adequate irrigation during grand growth phase; wrap/tie canes before high winds.",
  },
  Groundnut: {
    name: "Groundnut",
    emoji: "🥜",
    season: "Kharif / Rabi",
    duration: "105-125 days",
    idealTempMin: 22,
    idealTempMax: 32,
    waterNeed: "Low",
    vulnerablePests: ["Tikka Leaf Spot", "Spodoptera"],
    tip: "Gypsum application during pegging phase improves pod development and kernel weight.",
  },
};

export function getCropWeatherAdvisories(cropName: string, weather: WeatherData): CropAdvisory[] {
  const profile = CROP_PROFILES[cropName] || CROP_PROFILES["Paddy"];
  const advisories: CropAdvisory[] = [];

  // 1. Thermal Assessment
  if (weather.temp > profile.idealTempMax) {
    advisories.push({
      category: "Thermal",
      title: "High Heat Stress Warning",
      status: "warning",
      recommendation: `Live temp (${weather.temp}°C) exceeds optimal range (${profile.idealTempMin}–${profile.idealTempMax}°C) for ${profile.name}. Irrigate early in the morning or late evening and apply straw mulching.`,
    });
  } else if (weather.temp < profile.idealTempMin) {
    advisories.push({
      category: "Thermal",
      title: "Cold Temperature Alert",
      status: "info",
      recommendation: `Live temp (${weather.temp}°C) is below ideal growth baseline (${profile.idealTempMin}°C). Protect nursery beds and avoid excessive cold water flooding.`,
    });
  } else {
    advisories.push({
      category: "Thermal",
      title: "Optimal Growth Temperature",
      status: "optimal",
      recommendation: `Current temperature of ${weather.temp}°C is ideal for ${profile.name} vegetative and reproductive development.`,
    });
  }

  // 2. Irrigation Management
  const hasRain = weather.rainMm > 1 || (weather.rainProb ?? 0) > 45 || weather.forecast.some((f) => f.rainProb > 45);
  if (hasRain) {
    advisories.push({
      category: "Irrigation",
      title: "Hold Irrigation & Fertilization",
      status: "alert",
      recommendation: `Precipitation / rain probability detected (${weather.rainProb ?? 0}%). Postpone canal/groundwater irrigation and top-dressing urea to prevent nutrient leaching. Clear field drainage channels.`,
    });
  } else if (profile.waterNeed === "High" && weather.humidity < 55) {
    advisories.push({
      category: "Irrigation",
      title: "Active Irrigation Required",
      status: "warning",
      recommendation: `${profile.name} has high water demand. Dry air (Humidity ${weather.humidity}%) increases evapotranspiration. Schedule drip/flooding irrigation.`,
    });
  } else {
    advisories.push({
      category: "Irrigation",
      title: "Routine Soil Moisture Control",
      status: "optimal",
      recommendation: `Moisture conditions are favorable. Maintain normal irrigation cycle based on soil field capacity.`,
    });
  }

  // 3. Pest & Disease Risk
  if (weather.humidity >= 75 && weather.temp >= 20) {
    advisories.push({
      category: "Pest & Disease",
      title: "High Fungal & Pest Risk Alert",
      status: "alert",
      recommendation: `Elevated humidity (${weather.humidity}%) and warm temp (${weather.temp}°C) create high risk for ${profile.vulnerablePests.join(", ")}. Inspect field scouting plots and keep bio-fungicides ready.`,
    });
  } else {
    advisories.push({
      category: "Pest & Disease",
      title: "Low Pest Risk Window",
      status: "optimal",
      recommendation: `Relative humidity (${weather.humidity}%) is within safe thresholds. Continue routine pest monitoring.`,
    });
  }

  // 4. Foliar Spray Window
  if (weather.windSpeed > 15) {
    advisories.push({
      category: "Foliar Spray",
      title: "High Wind Spray Restriction",
      status: "warning",
      recommendation: `Wind speed of ${weather.windSpeed} km/h is too strong for foliar sprays. Postpone chemical/nutrient spraying to prevent drift and wastage.`,
    });
  } else if (hasRain) {
    advisories.push({
      category: "Foliar Spray",
      title: "Postpone Foliar Spray",
      status: "warning",
      recommendation: `Rain probability may wash off foliar sprays. Wait for clear weather window with at least 4-6 dry hours post-spray.`,
    });
  } else {
    advisories.push({
      category: "Foliar Spray",
      title: "Foliar Spray Window Open",
      status: "optimal",
      recommendation: `Wind speed (${weather.windSpeed} km/h) and dry weather are ideal for foliar nutrient and crop protection spraying.`,
    });
  }

  // 5. Seasonal Operations
  advisories.push({
    category: "Seasonal Operations",
    title: `${profile.name} Field Strategy (${profile.season})`,
    status: "info",
    recommendation: `${profile.tip} (Crop Duration: ${profile.duration}).`,
  });

  return advisories;
}

// Map WMO weather codes (Open-Meteo) to standard conditions and descriptions
export function parseWmoCode(code: number): { condition: string; description: string; iconCode: string } {
  if (code === 0) return { condition: "Clear", description: "clear sky", iconCode: "01d" };
  if (code === 1) return { condition: "Mainly Clear", description: "mainly clear", iconCode: "02d" };
  if (code === 2) return { condition: "Partly Cloudy", description: "partly cloudy", iconCode: "02d" };
  if (code === 3) return { condition: "Overcast", description: "overcast sky", iconCode: "04d" };
  if (code === 45 || code === 48) return { condition: "Fog", description: "foggy weather", iconCode: "50d" };
  if (code >= 51 && code <= 55) return { condition: "Drizzle", description: "light drizzle", iconCode: "09d" };
  if (code >= 56 && code <= 57) return { condition: "Freezing Drizzle", description: "freezing drizzle", iconCode: "09d" };
  if (code >= 61 && code <= 65) return { condition: "Rain", description: "rain showers", iconCode: "10d" };
  if (code >= 66 && code <= 67) return { condition: "Freezing Rain", description: "freezing rain", iconCode: "10d" };
  if (code >= 71 && code <= 77) return { condition: "Snow", description: "snowfall", iconCode: "13d" };
  if (code >= 80 && code <= 82) return { condition: "Rain Showers", description: "rain showers", iconCode: "09d" };
  if (code >= 85 && code <= 86) return { condition: "Snow Showers", description: "snow showers", iconCode: "13d" };
  if (code >= 95 && code <= 99) return { condition: "Thunderstorm", description: "thunderstorm with rain", iconCode: "11d" };
  return { condition: "Clear", description: "clear sky", iconCode: "01d" };
}

export async function fetchFromOpenMeteo(
  lat: number,
  lon: number,
  locationName: string,
  campusInfo?: CampusAddress,
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunrise,sunset,uv_index_max&timezone=Asia%2FKolkata&forecast_days=10`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new WeatherError("Unable to fetch weather from Open-Meteo API.", "FETCH_FAILED");
  }
  const data = await res.json();
  const current = data.current || {};
  const daily = data.daily || {};
  const hourlyRaw = data.hourly || {};

  const wmo = parseWmoCode(current.weather_code ?? 0);
  const iconUrl = `https://openweathermap.org/img/wn/${wmo.iconCode}@2x.png`;

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const forecast: ForecastDay[] = [];

  if (Array.isArray(daily.time)) {
    for (let i = 0; i < daily.time.length; i++) {
      const dStr = daily.time[i];
      const dObj = new Date(dStr);
      const dayName = i === 0 ? "Today" : daysOfWeek[dObj.getDay()] || "Day";
      const code = daily.weather_code?.[i] ?? 0;
      const parsed = parseWmoCode(code);
      const maxTemp = Math.round(daily.temperature_2m_max?.[i] ?? 30);
      const minTemp = Math.round(daily.temperature_2m_min?.[i] ?? 22);
      const rainProb = Math.round(daily.precipitation_probability_max?.[i] ?? 10);
      const rainSum = Number((daily.precipitation_sum?.[i] ?? 0).toFixed(1));
      const uv = Number((daily.uv_index_max?.[i] ?? 5).toFixed(1));

      forecast.push({
        day: dayName,
        dateStr: dStr,
        condition: parsed.condition,
        description: parsed.description,
        iconCode: parsed.iconCode,
        iconUrl: `https://openweathermap.org/img/wn/${parsed.iconCode}@2x.png`,
        high: maxTemp,
        low: minTemp,
        rainProb,
        rainMm: rainSum,
        uvIndex: uv,
        advisory: generateAdvisory(parsed.condition, maxTemp, 65, rainProb),
      });
    }
  }

  // Parse Hourly Data (next 24 hours starting from current local hour)
  const hourly: HourlyForecastItem[] = [];
  if (Array.isArray(hourlyRaw.time) && hourlyRaw.time.length > 0) {
    // Determine current hour string e.g. "2026-10-15T10"
    const nowLocal = new Date();
    // Offset for Asia/Kolkata (+5:30)
    const localUtcMs = nowLocal.getTime() + nowLocal.getTimezoneOffset() * 60000;
    const kolkataDate = new Date(localUtcMs + 5.5 * 3600000);
    const kolkataHourStr = kolkataDate.toISOString().slice(0, 13); // "YYYY-MM-DDTHH"

    let startIndex = hourlyRaw.time.findIndex((t: string) => t.startsWith(kolkataHourStr));
    if (startIndex < 0) {
      startIndex = 0;
    }

    const maxItems = Math.min(24, hourlyRaw.time.length - startIndex);
    for (let j = 0; j < maxItems; j++) {
      const idx = startIndex + j;
      const timeStr = hourlyRaw.time[idx];
      const code = hourlyRaw.weather_code?.[idx] ?? 0;
      const parsed = parseWmoCode(code);
      const tempVal = Math.round(hourlyRaw.temperature_2m?.[idx] ?? 28);
      const feelsVal = Math.round(hourlyRaw.apparent_temperature?.[idx] ?? tempVal);
      const popVal = Math.round(hourlyRaw.precipitation_probability?.[idx] ?? 0);
      const windVal = Math.round(hourlyRaw.wind_speed_10m?.[idx] ?? 10);
      const humVal = Math.round(hourlyRaw.relative_humidity_2m?.[idx] ?? 65);

      hourly.push({
        time: formatHourlyTimeLabel(timeStr, j === 0),
        isoTime: timeStr,
        temp: tempVal,
        feelsLike: feelsVal,
        condition: parsed.condition,
        description: parsed.description,
        iconCode: parsed.iconCode,
        iconUrl: `https://openweathermap.org/img/wn/${parsed.iconCode}@2x.png`,
        rainProb: popVal,
        windSpeed: windVal,
        humidity: humVal,
      });
    }
  }

  const currentTemp = Math.round(current.temperature_2m ?? 28);
  const currentHumidity = Math.round(current.relative_humidity_2m ?? 65);
  // Dew point approximation: T - ((100 - RH) / 5)
  const dewPoint = Math.round(currentTemp - (100 - currentHumidity) / 5);
  const windDirDeg = current.wind_direction_10m ?? 90;
  const windDirStr = degreesToCompass(windDirDeg);

  const isCampus =
    Boolean(campusInfo) ||
    locationName.toLowerCase().includes("sasi") ||
    locationName.toLowerCase().includes("site") ||
    (Math.abs(lat - SASI_CAMPUS.lat) < 0.005 && Math.abs(lon - SASI_CAMPUS.lon) < 0.005);

  const nowFormatted = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return {
    locationName,
    campusInfo: isCampus ? campusInfo || SASI_CAMPUS.address : undefined,
    isCampus,
    lat,
    lon,
    elevation: data.elevation ?? 14,
    temp: currentTemp,
    feelsLike: Math.round(current.apparent_temperature ?? currentTemp),
    tempMin: Math.round(daily.temperature_2m_min?.[0] ?? currentTemp - 4),
    tempMax: Math.round(daily.temperature_2m_max?.[0] ?? currentTemp + 4),
    condition: wmo.condition,
    description: wmo.description,
    iconCode: wmo.iconCode,
    iconUrl,
    humidity: currentHumidity,
    windSpeed: Math.round(current.wind_speed_10m ?? 8),
    windDirection: windDirStr,
    surfacePressure: Math.round(current.surface_pressure ?? 1011),
    uvIndex: Number((daily.uv_index_max?.[0] ?? 6).toFixed(1)),
    dewPoint,
    rainMm: Number((current.rain ?? current.precipitation ?? 0).toFixed(1)),
    rainProb: forecast[0]?.rainProb ?? 10,
    sunrise: formatIsoTime(daily.sunrise?.[0]),
    sunset: formatIsoTime(daily.sunset?.[0]),
    forecast,
    hourly,
    dataSource: "Open-Meteo (WMO / ECMWF / DWD)",
    lastUpdated: nowFormatted,
  };
}

export async function fetchWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  // Check if coordinates match Sasi campus
  const isCampus = Math.abs(lat - SASI_CAMPUS.lat) < 0.005 && Math.abs(lon - SASI_CAMPUS.lon) < 0.005;
  const resolvedName = isCampus ? SASI_CAMPUS.name : "Your Location";
  const campusAddress = isCampus ? SASI_CAMPUS.address : undefined;

  if (apiKey && typeof apiKey === "string" && apiKey.trim() !== "") {
    try {
      const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
      const [currentRes, forecastRes] = await Promise.all([fetch(currentUrl), fetch(forecastUrl)]);

      if (currentRes.ok) {
        const currentData = await currentRes.json();
        const forecastData = forecastRes.ok ? await forecastRes.json() : null;
        const weatherMain = currentData.weather?.[0]?.main || "Clear";
        const weatherDesc = currentData.weather?.[0]?.description || "clear sky";
        const iconCode = currentData.weather?.[0]?.icon || "01d";
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        const tz = currentData.timezone ?? 19800;

        const dailyForecasts: ForecastDay[] = [];
        const hourlyForecasts: HourlyForecastItem[] = [];

        if (forecastData && Array.isArray(forecastData.list)) {
          // Build hourly list (first 8 slots of 3h forecast)
          for (let k = 0; k < Math.min(8, forecastData.list.length); k++) {
            const hItem = forecastData.list[k];
            const hCond = hItem.weather?.[0]?.main || "Clear";
            const hDesc = hItem.weather?.[0]?.description || "clear sky";
            const hIcon = hItem.weather?.[0]?.icon || "01d";
            const hDate = new Date((hItem.dt + tz) * 1000);
            const hHours = hDate.getUTCHours();
            const hAmpm = hHours >= 12 ? "PM" : "AM";
            const hLabel = k === 0 ? "Now" : `${hHours % 12 || 12} ${hAmpm}`;

            hourlyForecasts.push({
              time: hLabel,
              isoTime: hItem.dt_txt || new Date(hItem.dt * 1000).toISOString(),
              temp: Math.round(hItem.main?.temp ?? 28),
              feelsLike: Math.round(hItem.main?.feels_like ?? 28),
              condition: hCond,
              description: hDesc,
              iconCode: hIcon,
              iconUrl: `https://openweathermap.org/img/wn/${hIcon}@2x.png`,
              rainProb: Math.round((hItem.pop || 0) * 100),
              windSpeed: Math.round((hItem.wind?.speed ?? 2) * 3.6),
              humidity: Math.round(hItem.main?.humidity ?? 65),
            });
          }

          // Group by Day
          const groupedByDay: Record<string, any[]> = {};
          for (const item of forecastData.list) {
            const dtTxt = item.dt_txt || "";
            const datePart =
              dtTxt.split(" ")[0] || new Date(item.dt * 1000).toISOString().split("T")[0];
            if (!groupedByDay[datePart]) groupedByDay[datePart] = [];
            groupedByDay[datePart].push(item);
          }

          const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const dayKeys = Object.keys(groupedByDay).slice(0, 7);
          for (let i = 0; i < dayKeys.length; i++) {
            const dKey = dayKeys[i];
            const items = groupedByDay[dKey];
            if (!items || items.length === 0) continue;
            let maxTemp = -999;
            let minTemp = 999;
            let maxPop = 0;
            let midItem = items[Math.floor(items.length / 2)];
            for (const it of items) {
              if (it.main?.temp_max > maxTemp) maxTemp = it.main.temp_max;
              if (it.main?.temp_min < minTemp) minTemp = it.main.temp_min;
              if ((it.pop || 0) > maxPop) maxPop = it.pop;
            }
            const dateObj = new Date(dKey);
            const dayName = i === 0 ? "Today" : daysOfWeek[dateObj.getDay()] || "Day";
            const cond = midItem.weather?.[0]?.main || "Clear";
            const desc = midItem.weather?.[0]?.description || "clear sky";
            const icon = midItem.weather?.[0]?.icon || "01d";
            const rainProb = Math.round(maxPop * 100);

            dailyForecasts.push({
              day: dayName,
              dateStr: dKey,
              condition: cond,
              description: desc,
              iconCode: icon,
              iconUrl: `https://openweathermap.org/img/wn/${icon}@2x.png`,
              high: Math.round(maxTemp),
              low: Math.round(minTemp),
              rainProb,
              advisory: generateAdvisory(cond, maxTemp, midItem.main?.humidity || 60, rainProb),
            });
          }
        }

        const rainValue = currentData.rain?.["1h"] || currentData.rain?.["3h"] || 0;
        const currentHum = Math.round(currentData.main?.humidity ?? 65);
        const currentT = Math.round(currentData.main?.temp ?? 28);

        return {
          locationName: resolvedName,
          campusInfo: campusAddress,
          isCampus,
          lat,
          lon,
          temp: currentT,
          feelsLike: Math.round(currentData.main?.feels_like ?? 30),
          tempMin: Math.round(currentData.main?.temp_min ?? 25),
          tempMax: Math.round(currentData.main?.temp_max ?? 32),
          condition: weatherMain,
          description: weatherDesc,
          iconCode,
          iconUrl,
          humidity: currentHum,
          windSpeed: Math.round((currentData.wind?.speed ?? 2) * 3.6),
          windDirection: degreesToCompass(currentData.wind?.deg ?? 90),
          surfacePressure: Math.round(currentData.main?.pressure ?? 1011),
          dewPoint: Math.round(currentT - (100 - currentHum) / 5),
          rainMm: Number(rainValue.toFixed(1)),
          rainProb: dailyForecasts[0]?.rainProb ?? 10,
          sunrise: formatUnixTime(currentData.sys?.sunrise ?? 1790554948, tz),
          sunset: formatUnixTime(currentData.sys?.sunset ?? 1790598287, tz),
          forecast: dailyForecasts,
          hourly: hourlyForecasts,
          dataSource: "OpenWeatherMap API",
          lastUpdated: new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        };
      }
    } catch {
      // Fallback to Open-Meteo below
    }
  }

  return fetchFromOpenMeteo(lat, lon, resolvedName, campusAddress);
}

export async function fetchWeatherData(
  locationQuery: string = SASI_CAMPUS.name,
): Promise<WeatherData> {
  const cleanQuery = locationQuery.split(",")[0].trim();
  const lowerQuery = cleanQuery.toLowerCase();

  // 1. Check if Sasi Campus
  if (
    lowerQuery.includes("sasi") ||
    lowerQuery.includes("site") ||
    lowerQuery.includes("einstein") ||
    lowerQuery.includes("mba") ||
    locationQuery.includes(SASI_CAMPUS.name)
  ) {
    return await fetchFromOpenMeteo(
      SASI_CAMPUS.lat,
      SASI_CAMPUS.lon,
      SASI_CAMPUS.name,
      SASI_CAMPUS.address,
    );
  }

  // 2. Check if Tadepalligudem
  if (lowerQuery.includes("tadepalligudem") || lowerQuery === "tadepalli") {
    return await fetchFromOpenMeteo(
      16.8147,
      81.5284,
      "Tadepalligudem, West Godavari, AP",
    );
  }

  // 3. Known coordinate lookup
  const knownLoc = LOCATION_COORDS[lowerQuery];
  if (knownLoc) {
    return await fetchFromOpenMeteo(
      knownLoc.lat,
      knownLoc.lon,
      knownLoc.name,
      knownLoc.campusInfo,
    );
  }

  // 4. Geocoding search fallback via Open-Meteo
  try {
    let lat = 16.8147;
    let lon = 81.5284;
    let resolvedName = cleanQuery;

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      if (Array.isArray(geoData.results) && geoData.results.length > 0) {
        const first = geoData.results[0];
        lat = first.latitude;
        lon = first.longitude;
        resolvedName = first.name ? `${first.name}, ${first.admin1 || first.country}` : cleanQuery;
      }
    }

    return await fetchFromOpenMeteo(lat, lon, resolvedName);
  } catch (err: any) {
    if (err instanceof WeatherError) throw err;
    throw new WeatherError("Unable to load live weather data for the specified location.", "FETCH_FAILED");
  }
}
