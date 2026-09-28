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

// Known coordinates mapping for agricultural hubs to guarantee precise weather resolution
const LOCATION_COORDS: Record<string, { lat: number; lon: number; name: string }> = {
  tadepalligudem: { lat: 16.8333, lon: 81.5333, name: "Tadepalligudem" },
  rajahmundry: { lat: 16.9833, lon: 81.7833, name: "Rajahmundry" },
  guntur: { lat: 16.3067, lon: 80.4365, name: "Guntur" },
  vijayawada: { lat: 16.5062, lon: 80.648, name: "Vijayawada" },
  eluru: { lat: 16.7107, lon: 81.1035, name: "Eluru" },
  visakhapatnam: { lat: 17.6868, lon: 83.2185, name: "Visakhapatnam" },
  kakinada: { lat: 16.9891, lon: 82.2475, name: "Kakinada" },
  ludhiana: { lat: 30.901, lon: 75.8573, name: "Ludhiana" },
  nashik: { lat: 20.0059, lon: 73.7898, name: "Nashik" },
  hyderabad: { lat: 17.385, lon: 78.4867, name: "Hyderabad" },
  delhi: { lat: 28.6139, lon: 77.209, name: "Delhi" },
};

function formatTime(unixSec: number, timezoneSec: number = 19800): string {
  const date = new Date((unixSec + timezoneSec) * 1000);
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minsStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${minsStr} ${ampm}`;
}

function generateAdvisory(condition: string, temp: number, humidity: number, rainProb: number): string {
  const condLower = condition.toLowerCase();
  if (rainProb > 50 || condLower.includes("rain") || condLower.includes("drizzle") || condLower.includes("thunderstorm")) {
    return "Heavy rain probability. Postpone pesticide/fertilizer spraying and ensure field drainage.";
  }
  if (humidity > 75) {
    return "High humidity alert. Monitor standing crops for fungal diseases and leaf spot.";
  }
  if (temp > 35) {
    return "High temperature notice. Schedule light irrigation in early morning or late evening.";
  }
  if (condLower.includes("cloud")) {
    return "Cloudy weather window. Good conditions for paddy transplanting and weeding.";
  }
  return "Favorable dry weather. Ideal for harvesting, threshing, and crop spraying.";
}

export async function fetchWeatherData(locationQuery: string = "Rajahmundry"): Promise<WeatherData> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
    throw new WeatherError("Weather service is not configured.", "MISSING_KEY");
  }

  const cleanQuery = locationQuery.split(",")[0].trim();
  const lowerQuery = cleanQuery.toLowerCase();
  
  let currentUrl = "";
  let forecastUrl = "";

  const knownLoc = LOCATION_COORDS[lowerQuery];
  if (knownLoc) {
    currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${knownLoc.lat}&lon=${knownLoc.lon}&units=metric&appid=${apiKey}`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${knownLoc.lat}&lon=${knownLoc.lon}&units=metric&appid=${apiKey}`;
  } else {
    const encodedQuery = encodeURIComponent(cleanQuery);
    currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodedQuery}&units=metric&appid=${apiKey}`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodedQuery}&units=metric&appid=${apiKey}`;
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ]);

    if (!currentRes.ok) {
      if (currentRes.status === 404 && !knownLoc) {
        // Fallback to Rajahmundry if custom location string fails
        return fetchWeatherData("Rajahmundry");
      }
      throw new WeatherError("Unable to load weather data. Please try again.", "FETCH_FAILED");
    }

    const currentData = await currentRes.json();
    const forecastData = forecastRes.ok ? await forecastRes.json() : null;

    const weatherMain = currentData.weather?.[0]?.main || "Clear";
    const weatherDesc = currentData.weather?.[0]?.description || "clear sky";
    const iconCode = currentData.weather?.[0]?.icon || "01d";
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    const tz = currentData.timezone ?? 19800;

    // Process 5-day forecast
    const dailyForecasts: ForecastDay[] = [];
    if (forecastData && Array.isArray(forecastData.list)) {
      const groupedByDay: Record<string, any[]> = {};
      
      for (const item of forecastData.list) {
        const dtTxt = item.dt_txt || ""; // "YYYY-MM-DD HH:mm:ss"
        const datePart = dtTxt.split(" ")[0] || new Date(item.dt * 1000).toISOString().split("T")[0];
        if (!groupedByDay[datePart]) {
          groupedByDay[datePart] = [];
        }
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
      windSpeed: Math.round((currentData.wind?.speed ?? 2) * 3.6), // convert m/s to km/h
      rainMm: Number(rainValue.toFixed(1)),
      sunrise: formatTime(currentData.sys?.sunrise ?? 1790554948, tz),
      sunset: formatTime(currentData.sys?.sunset ?? 1790598287, tz),
      forecast: dailyForecasts,
    };
  } catch (err: any) {
    if (err instanceof WeatherError) {
      throw err;
    }
    throw new WeatherError("Unable to load weather data. Please try again.", "FETCH_FAILED");
  }
}
