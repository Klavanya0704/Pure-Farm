"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  type WeatherData,
  fetchWeatherData,
  fetchWeatherByCoords,
  searchLocations,
  type LocationResult,
  SASI_CAMPUS,
  type CampusLocation,
} from "@/services/weather";
import { useAuth } from "./AuthContext";
import { useTranslation } from "@/i18n/LanguageContext";
import {
  MapPin,
  Search,
  X,
  Compass,
  Check,
  Loader2,
  AlertCircle,
  CloudSun,
  ChevronRight,
  GraduationCap,
  Building2,
} from "lucide-react";

export interface WeatherContextType {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  refreshWeather: () => Promise<void>;
  isSelectorOpen: boolean;
  setIsSelectorOpen: (open: boolean) => void;
  selectCoordsLocation: (lat: number, lon: number, name: string) => Promise<void>;
  selectCampusLocation: () => void;
  isCampusActive: boolean;
  campusData: CampusLocation;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

const STORAGE_KEY = "purefarm_selected_location";
export const DEFAULT_LOCATION = SASI_CAMPUS.name;

export function WeatherProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocationState] = useState<string>(
    user?.location || DEFAULT_LOCATION,
  );

  // Read saved location on client mount to prevent SSR hydration mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved.trim()) {
        setSelectedLocationState(saved.trim());
      }
    } catch {}
  }, []);

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);

  const isCampusActive =
    selectedLocation === SASI_CAMPUS.name ||
    selectedLocation.toLowerCase().includes("sasi") ||
    selectedLocation.toLowerCase().includes("site");

  const fetchForLocation = useCallback(async (loc: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(loc);
      setWeatherData(data);
    } catch (err: any) {
      console.error("Failed to fetch weather for location:", loc, err);
      setError("Unable to load weather data for the selected location.");
    } finally {
      setLoading(false);
    }
  }, []);

  const setSelectedLocation = useCallback(
    (loc: string) => {
      const trimmed = loc.trim();
      if (!trimmed) return;
      setSelectedLocationState(trimmed);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, trimmed);
        } catch {}
      }
      fetchForLocation(trimmed);
    },
    [fetchForLocation],
  );

  const selectCampusLocation = useCallback(() => {
    setSelectedLocation(SASI_CAMPUS.name);
  }, [setSelectedLocation]);

  const selectCoordsLocation = useCallback(
    async (lat: number, lon: number, name: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWeatherByCoords(lat, lon);
        const resolvedName = name || data.locationName || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        const finalData = { ...data, locationName: resolvedName };
        setWeatherData(finalData);
        setSelectedLocationState(resolvedName);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(STORAGE_KEY, resolvedName);
          } catch {}
        }
      } catch (err: any) {
        console.error("Failed to fetch weather by coordinates:", err);
        setError("Unable to retrieve weather for your coordinates.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const refreshWeather = useCallback(async () => {
    await fetchForLocation(selectedLocation);
  }, [fetchForLocation, selectedLocation]);

  // Initial load
  useEffect(() => {
    fetchForLocation(selectedLocation);
  }, [selectedLocation, fetchForLocation]);

  return (
    <WeatherContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        weatherData,
        loading,
        error,
        refreshWeather,
        isSelectorOpen,
        setIsSelectorOpen,
        selectCoordsLocation,
        selectCampusLocation,
        isCampusActive,
        campusData: SASI_CAMPUS,
      }}
    >
      {children}
      <WeatherLocationModal />
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  return context;
}

const POPULAR_LOCATIONS = [
  "Tadepalligudem, AP",
  "Bhimavaram, AP",
  "Rajahmundry, AP",
  "Eluru, AP",
  "Vijayawada, AP",
  "Guntur, AP",
  "Visakhapatnam, AP",
  "Kakinada, AP",
  "Tirupati, AP",
  "Kurnool, AP",
  "Nellore, AP",
  "Hyderabad, TS",
  "Warangal, TS",
  "Karimnagar, TS",
  "Bengaluru, KA",
  "Pune, Maharashtra",
  "Nashik, Maharashtra",
  "Ludhiana, Punjab",
  "Delhi",
];

export function WeatherLocationModal() {
  const {
    selectedLocation,
    setSelectedLocation,
    isSelectorOpen,
    setIsSelectorOpen,
    selectCoordsLocation,
    isCampusActive,
  } = useWeather();
  const { t } = useTranslation();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Focus and populate default search
  useEffect(() => {
    if (isSelectorOpen) {
      setQuery("");
      setGeoError(null);
      searchLocations("").then((res) => setResults(res));
    }
  }, [isSelectorOpen]);

  // Debounced search
  useEffect(() => {
    if (!isSelectorOpen) return;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const matches = await searchLocations(query);
        setResults(matches);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isSelectorOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSelectorOpen) {
        setIsSelectorOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelectorOpen, setIsSelectorOpen]);

  if (!isSelectorOpen) return null;

  const handleSelect = (name: string, lat?: number, lon?: number) => {
    if (lat !== undefined && lon !== undefined) {
      selectCoordsLocation(lat, lon, name);
    } else {
      setSelectedLocation(name);
    }
    setIsSelectorOpen(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await selectCoordsLocation(
            pos.coords.latitude,
            pos.coords.longitude,
            "My Current Location",
          );
          setIsLocating(false);
          setIsSelectorOpen(false);
        } catch {
          setGeoError("Unable to fetch weather for your GPS position.");
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setGeoError("Location permission denied. Please choose a city below.");
        } else {
          setGeoError("Failed to retrieve current location. Please choose a city below.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="weather-location-modal-title"
      onClick={() => setIsSelectorOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border bg-muted/30 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-[#1b4332] dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CloudSun className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="weather-location-modal-title"
                className="text-lg font-black text-foreground leading-tight"
              >
                {t("Choose Weather Location")}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("Live meteorological forecast, 24h timeline & agronomic advisories")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSelectorOpen(false)}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input Bar & GPS */}
        <div className="p-4 border-b border-border space-y-3 bg-background">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Search city, town, or agricultural mandi (e.g. Tadepalligudem, Guntur)...")}
              className="w-full h-11 pl-10 pr-10 rounded-xl border border-border bg-muted/20 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* GPS Location Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="w-full flex items-center justify-center gap-2 h-9 px-4 rounded-xl border border-dashed border-[#2d6a4f]/50 bg-emerald-50/60 dark:bg-emerald-950/20 text-[#1b4332] dark:text-emerald-300 hover:bg-emerald-100/60 transition text-xs font-bold cursor-pointer disabled:opacity-50"
          >
            {isLocating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#2d6a4f]" />
                <span>{t("Detecting GPS position...")}</span>
              </>
            ) : (
              <>
                <Compass className="h-4 w-4 text-[#2d6a4f]" />
                <span>{t("Use My Current Location (GPS Coordinates)")}</span>
              </>
            )}
          </button>

          {geoError && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{geoError}</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[55vh]">
          {/* SECTION 1: PRIMARY CAMPUS LOCATION CARD */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                <span>{t("1. Official Campus Location")}</span>
              </p>
              {isCampusActive && (
                <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  {t("Currently Selected")}
                </span>
              )}
            </div>

            <div
              onClick={() => handleSelect(SASI_CAMPUS.name, SASI_CAMPUS.lat, SASI_CAMPUS.lon)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isCampusActive
                  ? "bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white dark:from-emerald-950/40 dark:to-background border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-muted/30 border-border hover:border-emerald-500/50 hover:bg-muted/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-[#1b4332] dark:text-emerald-300">
                      {SASI_CAMPUS.shortName}
                    </span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-md">
                      MBA Block
                    </span>
                  </div>

                  {/* 3-Line Address Hierarchy */}
                  <div className="text-xs text-foreground/80 space-y-0.5 pt-1">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                      • {SASI_CAMPUS.address.line1}
                    </p>
                    <p className="font-medium text-muted-foreground">
                      • {SASI_CAMPUS.address.line2}
                    </p>
                    <p className="font-medium text-muted-foreground">
                      • {SASI_CAMPUS.address.line3}
                    </p>
                  </div>

                  <p className="text-[10px] text-muted-foreground pt-1.5 flex items-center gap-2 font-mono">
                    <span>GPS: {SASI_CAMPUS.lat}° N, {SASI_CAMPUS.lon}° E</span>
                    <span>·</span>
                    <span>Elevation: ~{SASI_CAMPUS.elevation}m</span>
                  </p>
                </div>

                <button
                  type="button"
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    isCampusActive
                      ? "bg-[#1b4332] text-white shadow-xs"
                      : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200"
                  }`}
                >
                  {isCampusActive ? <Check className="h-3.5 w-3.5" /> : null}
                  <span>{isCampusActive ? t("Active Campus") : t("Select Campus")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: WEATHER AREA (TADEPALLIGUDEM) */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-[#2d6a4f]" />
              <span>{t("2. Weather Area (Local District / Sub-division)")}</span>
            </p>

            <div
              onClick={() => handleSelect("Tadepalligudem, West Godavari, AP", 16.8147, 81.5284)}
              className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                selectedLocation.includes("Tadepalligudem, West Godavari")
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 font-bold"
                  : "bg-background border-border hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-[#2d6a4f]" />
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Tadepalligudem, West Godavari, Andhra Pradesh
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Regional weather area & agricultural mandi zone · 16.8147° N, 81.5284° E
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* SECTION 3: POPULAR AGRICULTURE HUBS & MANDIS */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-2">
              {t("3. Major Agriculture Hubs & Mandis")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_LOCATIONS.map((loc) => {
                const isSelected = selectedLocation.toLowerCase() === loc.toLowerCase();
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleSelect(loc)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? "bg-[#2d6a4f] text-white shadow-xs font-bold"
                        : "bg-muted/70 hover:bg-muted text-foreground border border-border/60 hover:border-border"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    <span>{loc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Results List */}
          {query.trim().length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("Search Results")}
                </p>
                {searching && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </div>

              {results.length > 0 ? (
                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-background">
                  {results.map((loc, idx) => {
                    const isSelected =
                      selectedLocation.toLowerCase() === loc.name.toLowerCase() ||
                      selectedLocation.toLowerCase().includes(loc.name.toLowerCase());

                    return (
                      <button
                        key={`${loc.name}-${idx}`}
                        type="button"
                        onClick={() => handleSelect(loc.name, loc.lat, loc.lon)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/60 transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <MapPin
                            className={`h-4 w-4 shrink-0 ${
                              isSelected ? "text-[#2d6a4f]" : "text-muted-foreground group-hover:text-[#2d6a4f]"
                            }`}
                          />
                          <div className="min-w-0">
                            <p className={`text-xs font-bold truncate ${isSelected ? "text-[#2d6a4f]" : "text-foreground"}`}>
                              {loc.name}
                            </p>
                            {loc.state && (
                              <p className="text-[10px] text-muted-foreground">{loc.state}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSelected ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-[#2d6a4f] bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                              <Check className="h-3 w-3" />
                              {t("Active")}
                            </span>
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 px-4 rounded-xl border border-dashed border-border bg-muted/20 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {t("No specific match found for")} <span className="font-bold">"{query}"</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSelect(query.trim())}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <MapPin className="h-3 w-3" />
                    <span>{t("Use \"{{query}}\" anyway", { query: query.trim() })}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-muted/30 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="truncate max-w-[280px]">
            {t("Active:")} <span className="font-bold text-foreground">{selectedLocation}</span>
          </span>
          <button
            type="button"
            onClick={() => setIsSelectorOpen(false)}
            className="px-3.5 py-1.5 rounded-xl border border-border bg-background hover:bg-muted font-bold text-foreground transition cursor-pointer"
          >
            {t("Close")}
          </button>
        </div>
      </div>
    </div>
  );
}
