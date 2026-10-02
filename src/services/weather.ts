/**
 * OpenWeather API Service for PureFarm
 * Uses VITE_OPENWEATHER_API_KEY from environment.
 */

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
  advisory: string;
}

export interface WeatherData {
  locationName: string;
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
  rainMm: number;
  sunrise: string;
  sunset: string;
  forecast: ForecastDay[];
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

export const LOCATION_COORDS: Record<string, { lat: number; lon: number; name: string }> = {
  rajahmundry: { lat: 16.9833, lon: 81.7833, name: "Rajahmundry, AP" },
  tadepalligudem: { lat: 16.8333, lon: 81.5333, name: "Tadepalligudem, AP" },
  guntur: { lat: 16.3067, lon: 80.4365, name: "Guntur, AP" },
  vijayawada: { lat: 16.5062, lon: 80.6480, name: "Vijayawada, AP" },
  eluru: { lat: 16.7107, lon: 81.1035, name: "Eluru, AP" },
  visakhapatnam: { lat: 17.6868, lon: 83.2185, name: "Visakhapatnam, AP" },
  kakinada: { lat: 16.9891, lon: 82.2475, name: "Kakinada, AP" },
  kurnool: { lat: 15.8281, lon: 78.0373, name: "Kurnool, AP" },
  nellore: { lat: 14.4426, lon: 79.9865, name: "Nellore, AP" },
  anantapur: { lat: 14.6819, lon: 77.6006, name: "Anantapur, AP" },
  tirupati: { lat: 13.6288, lon: 79.4192, name: "Tirupati, AP" },
  hyderabad: { lat: 17.3850, lon: 78.4867, name: "Hyderabad, TS" },
  warangal: { lat: 17.9689, lon: 79.5941, name: "Warangal, TS" },
  karimnagar: { lat: 18.4386, lon: 79.1288, name: "Karimnagar, TS" },
  ludhiana: { lat: 30.9010, lon: 75.8573, name: "Ludhiana, Punjab" },
  nashik: { lat: 19.9975, lon: 73.7898, name: "Nashik, Maharashtra" },
  delhi: { lat: 28.6139, lon: 77.2090, name: "Delhi" },
  agra: { lat: 27.1767, lon: 78.0081, name: "Agra, UP" },
};

function generateAdvisory(condition: string, temp: number, humidity: number, rainProb: number): string {
  if (rainProb > 50 || condition.toLowerCase().includes("rain")) {
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

function formatTime(timestamp: number, timezoneOffsetSec: number = 19800): string {
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
  const hasRain = weather.rainMm > 1 || weather.forecast.some((f) => f.rainProb > 45);
  if (hasRain) {
    advisories.push({
      category: "Irrigation",
      title: "Hold Irrigation & Fertilization",
      status: "alert",
      recommendation: `Precipitation / rain probability detected. Postpone canal/groundwater irrigation and top-dressing urea to prevent nutrient leaching. Clear field drainage channels.`,
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
function parseWmoCode(code: number): { condition: string; description: string; iconCode: string } {
  if (code === 0) return { condition: "Clear", description: "clear sky", iconCode: "01d" };
  if (code === 1 || code === 2) return { condition: "Clouds", description: "partly cloudy", iconCode: "02d" };
  if (code === 3) return { condition: "Clouds", description: "overcast clouds", iconCode: "04d" };
  if (code === 45 || code === 48) return { condition: "Fog", description: "foggy weather", iconCode: "50d" };
  if (code >= 51 && code <= 57) return { condition: "Drizzle", description: "light drizzle", iconCode: "09d" };
  if (code >= 61 && code <= 67) return { condition: "Rain", description: "moderate rain", iconCode: "10d" };
  if (code >= 71 && code <= 77) return { condition: "Snow", description: "snowfall", iconCode: "13d" };
  if (code >= 80 && code <= 82) return { condition: "Rain", description: "rain showers", iconCode: "09d" };
  if (code >= 95 && code <= 99) return { condition: "Thunderstorm", description: "thunderstorm", iconCode: "11d" };
  return { condition: "Clear", description: "clear sky", iconCode: "01d" };
}

async function fetchFromOpenMeteo(lat: number, lon: number, locationName: string): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new WeatherError("Unable to fetch weather from Open-Meteo API.", "FETCH_FAILED");
  }
  const data = await res.json();
  const current = data.current || {};
  const daily = data.daily || {};

  const wmo = parseWmoCode(current.weather_code ?? 0);
  const iconUrl = `https://openweathermap.org/img/wn/${wmo.iconCode}@2x.png`;

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const forecast: ForecastDay[] = [];

  if (Array.isArray(daily.time)) {
    for (let i = 0; i < Math.min(5, daily.time.length); i++) {
      const dStr = daily.time[i];
      const dObj = new Date(dStr);
      const dayName = daysOfWeek[dObj.getDay()] || "Day";
      const code = daily.weather_code?.[i] ?? 0;
      const parsed = parseWmoCode(code);
      const maxTemp = Math.round(daily.temperature_2m_max?.[i] ?? 30);
      const minTemp = Math.round(daily.temperature_2m_min?.[i] ?? 22);
      const rainProb = Math.round(daily.precipitation_probability_max?.[i] ?? 10);

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
        advisory: generateAdvisory(parsed.condition, maxTemp, 65, rainProb),
      });
    }
  }

  return {
    locationName,
    temp: Math.round(current.temperature_2m ?? 28),
    feelsLike: Math.round(current.apparent_temperature ?? 30),
    tempMin: Math.round(daily.temperature_2m_min?.[0] ?? 24),
    tempMax: Math.round(daily.temperature_2m_max?.[0] ?? 33),
    condition: wmo.condition,
    description: wmo.description,
    iconCode: wmo.iconCode,
    iconUrl,
    humidity: Math.round(current.relative_humidity_2m ?? 65),
    windSpeed: Math.round(current.wind_speed_10m ?? 8),
    rainMm: Number((current.rain ?? current.precipitation ?? 0).toFixed(1)),
    sunrise: "06:00 AM",
    sunset: "06:30 PM",
    forecast,
  };
}

export async function fetchWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

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
        if (forecastData && Array.isArray(forecastData.list)) {
          const groupedByDay: Record<string, any[]> = {};
          for (const item of forecastData.list) {
            const dtTxt = item.dt_txt || "";
            const datePart = dtTxt.split(" ")[0] || new Date(item.dt * 1000).toISOString().split("T")[0];
            if (!groupedByDay[datePart]) groupedByDay[datePart] = [];
            groupedByDay[datePart].push(item);
          }
          const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const dayKeys = Object.keys(groupedByDay).slice(0, 5);
          for (const dKey of dayKeys) {
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
            const dayName = daysOfWeek[dateObj.getDay()] || "Day";
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
        return {
          locationName: currentData.name || "Your Location",
          temp: Math.round(currentData.main?.temp ?? 28),
          feelsLike: Math.round(currentData.main?.feels_like ?? 30),
          tempMin: Math.round(currentData.main?.temp_min ?? 25),
          tempMax: Math.round(currentData.main?.temp_max ?? 32),
          condition: weatherMain,
          description: weatherDesc,
          iconCode,
          iconUrl,
          humidity: Math.round(currentData.main?.humidity ?? 65),
          windSpeed: Math.round((currentData.wind?.speed ?? 2) * 3.6),
          rainMm: Number(rainValue.toFixed(1)),
          sunrise: formatTime(currentData.sys?.sunrise ?? 1790554948, tz),
          sunset: formatTime(currentData.sys?.sunset ?? 1790598287, tz),
          forecast: dailyForecasts,
        };
      } else {
        throw new Error(`OpenWeather response not ok: ${currentRes.status}`);
      }
    } catch {
      // Fallback to Open-Meteo below
    }
  }

  return fetchFromOpenMeteo(lat, lon, "Your Location");
}

export async function fetchWeatherData(locationQuery: string = "Rajahmundry"): Promise<WeatherData> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const cleanQuery = locationQuery.split(",")[0].trim();
  const lowerQuery = cleanQuery.toLowerCase();
  const knownLoc = LOCATION_COORDS[lowerQuery];

  // If API key is available, attempt OpenWeather API
  if (apiKey && typeof apiKey === "string" && apiKey.trim() !== "") {
    let currentUrl = "";
    let forecastUrl = "";

    if (knownLoc) {
      currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${knownLoc.lat}&lon=${knownLoc.lon}&units=metric&appid=${apiKey}`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${knownLoc.lat}&lon=${knownLoc.lon}&units=metric&appid=${apiKey}`;
    } else {
      const encodedQuery = encodeURIComponent(cleanQuery);
      currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodedQuery}&units=metric&appid=${apiKey}`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodedQuery}&units=metric&appid=${apiKey}`;
    }

    try {
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
        if (forecastData && Array.isArray(forecastData.list)) {
          const groupedByDay: Record<string, any[]> = {};
          for (const item of forecastData.list) {
            const dtTxt = item.dt_txt || "";
            const datePart = dtTxt.split(" ")[0] || new Date(item.dt * 1000).toISOString().split("T")[0];
            if (!groupedByDay[datePart]) groupedByDay[datePart] = [];
            groupedByDay[datePart].push(item);
          }

          const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const dayKeys = Object.keys(groupedByDay).slice(0, 5);

          for (const dKey of dayKeys) {
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
            const dayName = daysOfWeek[dateObj.getDay()] || "Day";
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

        return {
          locationName: knownLoc?.name || currentData.name || cleanQuery,
          temp: Math.round(currentData.main?.temp ?? 28),
          feelsLike: Math.round(currentData.main?.feels_like ?? 30),
          tempMin: Math.round(currentData.main?.temp_min ?? 25),
          tempMax: Math.round(currentData.main?.temp_max ?? 32),
          condition: weatherMain,
          description: weatherDesc,
          iconCode,
          iconUrl,
          humidity: Math.round(currentData.main?.humidity ?? 65),
          windSpeed: Math.round((currentData.wind?.speed ?? 2) * 3.6),
          rainMm: Number(rainValue.toFixed(1)),
          sunrise: formatTime(currentData.sys?.sunrise ?? 1790554948, tz),
          sunset: formatTime(currentData.sys?.sunset ?? 1790598287, tz),
          forecast: dailyForecasts,
        };
      } else {
        throw new Error(`OpenWeather response not ok: ${currentRes.status}`);
      }
    } catch (err) {
      console.warn("OpenWeather API call failed, falling back to Open-Meteo:", err);
      // Fall back to Open-Meteo below
    }
  }

  // Open-Meteo fallback when OpenWeather is unavailable or fails
  try {
    let lat = knownLoc?.lat || 16.9833;
    let lon = knownLoc?.lon || 81.7833;
    let resolvedName = knownLoc?.name || cleanQuery;

    if (!knownLoc) {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=1&language=en&format=json`;
      const geoRes = await fetch(geoUrl);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (Array.isArray(geoData.results) && geoData.results.length > 0) {
          const first = geoData.results[0];
          lat = first.latitude;
          lon = first.longitude;
          resolvedName = first.name || cleanQuery;
        }
      }
    }

    return await fetchFromOpenMeteo(lat, lon, resolvedName);
  } catch (err: any) {
    if (err instanceof WeatherError) throw err;
    throw new WeatherError("Unable to load live weather data for the specified location.", "FETCH_FAILED");
  }
}

