import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  CloudSun,
  Filter,
  GraduationCap,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  Award,
  Scale,
  Truck,
  Lock,
  MapPin,
  Sun,
  Droplets,
  Wind,
  Shield,
  Heart,
  Info,
  HelpCircle,
  MessageCircle,
  Leaf,
  User,
  Eye,
  EyeOff,
  LogIn,
  Sparkles,
  Sprout,
  Cpu,
  Activity,
  Globe,
} from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  ADMIN_STATS,
  COURSES,
  CROPS,
  FAQS,
  INSURANCE_SCHEMES,
  INTERNSHIPS,
  MANDI_PRICES,
  NOTIFICATIONS,
  SCHEMES,
  WEATHER,
} from "@/data/agriculture";
import { CATEGORIES, getProduct, PRODUCTS } from "@/data/products";
import { SITE, waLink } from "@/data/site";
import type { Category, NotificationItem, Product } from "@/data/types";
import { cardClass, PageShell } from "./AppShell";
import { getCartProducts, useCart } from "./CartContext";
import { useAuth, type UserRole } from "./AuthContext";
import { formatRupees, ProductCard } from "./ProductCard";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/12 p-4 text-white backdrop-blur">
      <p className="text-2xl font-black">{value}</p>
      <p className="text-sm text-white/78">{label}</p>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
      {children}
    </span>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
      <p className="text-lg font-black">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function AccessDenied({ requiredRoles }: { requiredRoles: string[] }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getDashboardDestination = () => {
    if (!user) return "/login";
    if (user.role === "farmer") return "/";
    if (user.role === "buyer") return "/marketplace";
    if (user.role === "seller") return "/seller";
    if (user.role === "admin") return "/admin";
    return "/";
  };

  return (
    <PageShell eyebrow="Security Alert" title="Access Restricted">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft space-y-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shadow-sm mx-auto">
          <Shield className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-foreground">Access Restricted</h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            You don't have permission to access this page. This area is restricted to{" "}
            <span className="font-bold text-[#1b4332]">{requiredRoles.join(", ")}</span> users.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void navigate({ to: getDashboardDestination() as "/" })}
          className="w-full h-11 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-black text-xs shadow-sm transition hover:scale-[1.01]"
        >
          Go to Dashboard
        </button>
      </div>
    </PageShell>
  );
}

export function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !allowedRoles.includes(user.role))) {
      void navigate({ to: "/login" });
    }
  }, [user, loading, navigate, allowedRoles]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground font-semibold">Checking authorization...</p>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <AccessDenied requiredRoles={allowedRoles} />;
  }

  return <>{children}</>;
}

export function HomePage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const HERO_SLIDES = useMemo(
    () => [
      {
        badge: "SMART FARMING",
        title: "Powering Every Acre",
        subtitle: "Modern farm machinery helps farmers work smarter, faster and more efficiently.",
        img: "/hero-tractor.jpg",
        badgeColor: "bg-amber-500/20 text-amber-300",
        linkText: "Explore Farm Equipment",
        linkTo: "/marketplace",
        secLinkText: "Shop Marketplace",
        secLinkTo: "/marketplace",
      },
      {
        badge: "HEALTHY SOIL • HEALTHY CROPS",
        title: "Nourish Your Soil, Grow Better",
        subtitle:
          "Discover quality fertilizers and crop nutrients designed to support healthy soil and stronger harvests.",
        img: "/hero-fertilizer.jpg",
        badgeColor: "bg-emerald-500/20 text-emerald-300",
        linkText: "Shop Fertilizers",
        linkTo: "/marketplace",
        secLinkText: "Explore Products",
        secLinkTo: "/marketplace",
      },
      {
        badge: "NEXT-GEN AGRICULTURE",
        title: "Technology Taking Farming Higher",
        subtitle:
          "Explore modern agricultural technology that helps farmers monitor, protect and manage their crops efficiently.",
        img: "/hero-drone.jpg",
        badgeColor: "bg-teal-500/20 text-teal-300",
        linkText: "Explore Agri Technology",
        linkTo: "/marketplace",
        secLinkText: "Learn More",
        secLinkTo: "/learn",
      },
      {
        badge: "SMART WATER MANAGEMENT",
        title: "Every Drop Counts",
        subtitle:
          "Efficient irrigation helps conserve water while keeping crops healthy and productive.",
        img: "/hero-irrigation.jpg",
        badgeColor: "bg-blue-500/20 text-blue-300",
        linkText: "Explore Irrigation",
        linkTo: "/marketplace",
        secLinkText: "View Farm Tools",
        secLinkTo: "/marketplace",
      },
      {
        badge: "FROM FIELD TO FUTURE",
        title: "Grow More. Harvest Better.",
        subtitle:
          "Everything farmers need — from quality farm inputs and equipment to fresh agricultural products.",
        img: "/hero-harvest.jpg",
        badgeColor: "bg-amber-500/20 text-amber-300",
        linkText: "Shop Marketplace",
        linkTo: "/marketplace",
        secLinkText: "Explore Farm Inputs",
        secLinkTo: "/marketplace",
      },
    ],
    [],
  );

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [HERO_SLIDES.length, isHovered]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  // Find 6 products for Best Deals (customized to exact spec values: Tomatoes, Cucumber, Potatoes, Red Onions, Green Chillies, Oranges)
  const dealProducts = useMemo(() => {
    const keywords = ["tomato", "cucumber", "potato", "onion", "chilli", "marigold"];
    const matches: Product[] = [];
    keywords.forEach((kw) => {
      const found = PRODUCTS.find((p) => p.name.toLowerCase().includes(kw));
      if (found) {
        const customized = { ...found };
        if (kw === "tomato") {
          customized.name = "Fresh Tomatoes";
          customized.price = 18;
          customized.customOldPrice = 22;
          customized.customDiscount = "-20%";
          customized.customBadgeText = "HOT";
          customized.unit = "1 kg";
          customized.rating = 4.6;
          customized.customReviewCount = 238;
          customized.image = "/products/deals/fresh-tomatoes-farm.jpg";
        } else if (kw === "cucumber") {
          customized.name = "Cucumber";
          customized.price = 16;
          customized.customOldPrice = 19;
          customized.customDiscount = "-15%";
          customized.customBadgeText = "BEST SELLER";
          customized.unit = "500 g";
          customized.rating = 4.4;
          customized.customReviewCount = 192;
          customized.image = "/products/deals/cucumber-farm.jpg";
        } else if (kw === "potato") {
          customized.name = "Potatoes";
          customized.price = 14;
          customized.customOldPrice = 17;
          customized.customDiscount = "-18%";
          customized.unit = "1 kg";
          customized.rating = 4.5;
          customized.customReviewCount = 210;
          customized.image = "/products/deals/potatoes-farm.jpg";
        } else if (kw === "onion") {
          customized.name = "Red Onions";
          customized.price = 20;
          customized.customOldPrice = 24;
          customized.customDiscount = "-15%";
          customized.customBadgeText = "BEST SELLER";
          customized.unit = "1 kg";
          customized.rating = 4.6;
          customized.customReviewCount = 185;
          customized.image = "/products/deals/red-onions-farm.jpg";
        } else if (kw === "chilli") {
          customized.name = "Green Chillies";
          customized.price = 16;
          customized.customOldPrice = 20;
          customized.customDiscount = "-20%";
          customized.customBadgeText = "HOT";
          customized.unit = "250 g";
          customized.rating = 4.4;
          customized.customReviewCount = 188;
          customized.image = "/products/deals/green-chillies-farm.jpg";
        } else if (kw === "marigold") {
          customized.name = "Oranges";
          customized.price = 28;
          customized.customOldPrice = 33;
          customized.customDiscount = "-15%";
          customized.unit = "1 kg";
          customized.rating = 4.6;
          customized.customReviewCount = 176;
          customized.image = "/products/deals/oranges-farm.jpg";
        }
        matches.push(customized);
      }
    });
    return matches;
  }, []);

  // Deals Countdown Timer State: 02 Hours : 23 Mins : 47 Secs
  const [timeLeft, setTimeLeft] = useState(8627); // 02h 23m 47s
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 8627));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      hours: String(h).padStart(2, "0"),
      mins: String(m).padStart(2, "0"),
      secs: String(s).padStart(2, "0"),
    };
  };
  const countdownTime = formatTime(timeLeft);

  // 6 copies of the product list to support continuous seamless CSS marquee looping
  const marqueeProducts = useMemo(() => {
    return [
      ...dealProducts,
      ...dealProducts,
      ...dealProducts,
      ...dealProducts,
      ...dealProducts,
      ...dealProducts,
    ];
  }, [dealProducts]);

  // Map 5 Mandi prices with fallbacks
  const cropsToDisplay = [
    { name: "Tomato", fallbackPrice: 18, fallbackChange: -5.2 },
    { name: "Potato", fallbackPrice: 15, fallbackChange: 2.1 },
    { name: "Onion", fallbackPrice: 20, fallbackChange: -3.4 },
    { name: "Green Chilli", fallbackPrice: 30, fallbackChange: 4.3 },
    { name: "Brinjal", fallbackPrice: 25, fallbackChange: 1.6 },
  ];
  const mandiPrices = useMemo(() => {
    return cropsToDisplay.map((crop) => {
      const dbItem = MANDI_PRICES.find((m) => m.crop.toLowerCase() === crop.name.toLowerCase());
      return {
        crop: crop.name,
        price: dbItem ? Math.round(dbItem.price / 100) : crop.fallbackPrice,
        changePct: dbItem ? dbItem.changePct : crop.fallbackChange,
      };
    });
  }, []);

  // Map Weather forecast
  const weatherData = WEATHER.length >= 5 ? WEATHER : [];
  const forecastDays = ["Sat", "Sun", "Mon", "Tue"];
  const weatherForecast = useMemo(() => {
    return forecastDays.map((d, i) => {
      const dbItem = weatherData[i + 1];
      return {
        day: d,
        temp: dbItem ? `${dbItem.high}°/${dbItem.low}°` : `${29 + i}°/${22 + (i % 2)}°`,
        condition: dbItem ? dbItem.condition : "Sunny",
      };
    });
  }, []);

  // Map Schemes
  const displaySchemes = [
    {
      id: "pm-kisan",
      fallbackName: "PM Kisan Samman Nidhi",
      fallbackDesc: "Financial support to farmers",
    },
    {
      id: "soil-health",
      fallbackName: "Soil Health Card Scheme",
      fallbackDesc: "Improve soil health & productivity",
    },
    { id: "kcc", fallbackName: "Kisan Credit Card", fallbackDesc: "Easy credit for farmers" },
    {
      id: "pmfby",
      fallbackName: "Crop Insurance Scheme",
      fallbackDesc: "Protect your crops & income",
    },
  ];
  const schemesToRender = useMemo(() => {
    return displaySchemes.map((s) => {
      const dbScheme =
        SCHEMES.find((ds) => ds.id === s.id) || INSURANCE_SCHEMES.find((di) => di.code === s.id);
      return {
        name: dbScheme ? dbScheme.name : s.fallbackName,
        desc: dbScheme ? dbScheme.description : s.fallbackDesc,
      };
    });
  }, []);

  // Categories list
  const categoriesList = [
    {
      name: "Fruits",
      img: "/categories/fruits.jpg",
    },
    {
      name: "Vegetables",
      img: "/categories/vegetables.jpg",
    },
    {
      name: "Seeds",
      img: "/categories/seeds.jpg",
    },
    {
      name: "Fertilizers",
      img: "/categories/fertilizers.jpg",
    },
    {
      name: "Pesticides",
      img: "/categories/pesticides.jpg",
    },
    {
      name: "Farm Tools",
      img: "/categories/farm-tools.jpg",
    },
    {
      name: "Equipment",
      img: "/categories/equipment.jpg",
    },
  ];

  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* 2-Column Desktop Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_310px] items-start">
          {/* Left Column (Main content) */}
          <div className="space-y-8 min-w-0">
            {/* Hero Carousel Banner */}
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative overflow-hidden rounded-2xl bg-slate-950 text-white h-[200px] xs:h-[240px] sm:h-[280px] md:h-[320px] lg:h-[340px] shadow-soft"
            >
              {/* Carousel Slides */}
              <div
                className="flex h-full transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${currentSlide * 100}%)`,
                }}
              >
                {HERO_SLIDES.map((slide, index) => (
                  <div
                    key={index}
                    className="relative w-full h-full shrink-0 flex items-center px-6 sm:px-12 md:px-16 overflow-hidden"
                  >
                    {/* Full Background Image */}
                    <img
                      src={slide.img}
                      alt={slide.title}
                      className="absolute inset-0 w-full h-full object-cover object-center z-0"
                    />

                    {/* Subtle Left-Side Gradient Overlay for Text Readability */}
                    <div
                      className="absolute inset-0 z-10"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(0, 45, 30, 0.85) 0%, rgba(0, 45, 30, 0.6) 35%, rgba(0, 45, 30, 0.2) 60%, rgba(0, 45, 30, 0) 80%)",
                      }}
                    />

                    {/* Left Column Content */}
                    <div className="relative z-20 max-w-[65%] sm:max-w-[50%] space-y-2.5 sm:space-y-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider ${slide.badgeColor}`}
                      >
                        {slide.badge}
                      </span>
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight text-white drop-shadow-sm">
                        {slide.title}
                      </h1>
                      <p className="text-[11px] sm:text-xs text-emerald-100/90 leading-relaxed font-medium line-clamp-2 drop-shadow-sm">
                        {slide.subtitle}
                      </p>
                      <div className="pt-1 flex flex-wrap gap-2.5">
                        <Link
                          to={slide.linkTo}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 hover:scale-105 active:scale-95 transition px-3.5 py-2 text-xs font-black text-white shadow-sm duration-200"
                        >
                          {slide.linkText} <ArrowRight className="h-3 w-3" />
                        </Link>
                        {slide.secLinkText && slide.secLinkTo && (
                          <Link
                            to={slide.secLinkTo}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 transition px-3.5 py-2 text-xs font-black text-white duration-200"
                          >
                            {slide.secLinkText}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Prev/Next Navigation Controls */}
              <button
                type="button"
                onClick={prevSlide}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 h-7 w-7 rounded-full bg-black/20 text-white hover:bg-black/50 flex items-center justify-center transition text-sm font-bold shadow-sm"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 h-7 w-7 rounded-full bg-black/20 text-white hover:bg-black/50 flex items-center justify-center transition text-sm font-bold shadow-sm"
              >
                ›
              </button>

              {/* Pagination Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
                {HERO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentSlide === idx ? "w-4 bg-amber-500" : "w-1.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { title: "100% Organic", desc: "Healthy & Chemical Free", icon: Leaf },
                { title: "Best Quality", desc: "Carefully Handpicked", icon: Award },
                { title: "Fair Prices", desc: "Direct from Farmers", icon: Scale },
                { title: "Fast Delivery", desc: "Across India", icon: Truck },
                { title: "Secure Payments", desc: "100% Safe & Secure", icon: Lock },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-border bg-card p-4 text-center shadow-soft transition-all duration-200 hover:scale-[1.02] hover:shadow-card-lg"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground mb-3">
                      <Icon className="h-5 w-5 text-[#2d6a4f]" />
                    </span>
                    <p className="text-xs font-black text-[#1b4332]">{f.title}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground leading-normal">
                      {f.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Category Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#1b4332]">Shop by Category</h2>
                  <p className="text-xs text-muted-foreground">
                    Certified products and inputs for your crops
                  </p>
                </div>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#2d6a4f] hover:text-[#1b4332] transition"
                >
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Grid category cards */}
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4">
                {categoriesList.map((cat, idx) => (
                  <Link
                    key={idx}
                    to="/marketplace"
                    className="flex flex-col rounded-xl border border-border bg-white p-2.5 shadow-sm hover:shadow-md transition-all duration-200 text-center hover:scale-[1.02] aspect-square justify-between"
                  >
                    <div className="h-[65%] w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      <img
                        src={cat.img}
                        alt={cat.name}
                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-xs font-black text-[#1b4332] tracking-tight block py-1 line-clamp-1">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            {/* Product Section — Premium Animated Product Marquee */}
            <div className="space-y-4">
              {/* Header Container */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/40 pb-3 select-none">
                <div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 className="text-xl font-black text-[#1b4332]">Best Deals for You 🔥</h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-600 px-2 py-0.5 text-[10px] font-black border border-red-100/50 animate-pulse">
                      🔥 Deals ending soon · {countdownTime.hours}h {countdownTime.mins}m
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Handpicked products & inputs on discount
                  </p>
                </div>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#2d6a4f] hover:text-[#1b4332] transition group/viewall"
                >
                  View All{" "}
                  <span className="group-hover/viewall:translate-x-0.5 transition-transform duration-200">
                    →
                  </span>
                </Link>
              </div>

              {/* Product Carousel Slider Marquee Track */}
              <div className="deals-marquee overflow-hidden w-full py-2">
                <div className="deals-marquee-track flex gap-3 md:gap-4">
                  {marqueeProducts.map((product, idx) => (
                    <div
                      key={`${product.id}-${idx}`}
                      className="shrink-0 flex justify-center w-[145px] xs:w-[155px] sm:w-[160px] md:w-[165px] lg:w-[165px]"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* App download Banner */}
            <div className="rounded-2xl bg-gradient-to-br from-[#1b4332] to-[#0d1e16] text-white p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
              <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none hidden md:block">
                <Leaf className="h-48 w-48 text-white rotate-45 transform translate-x-12 translate-y-4" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-black">Stay Updated, Stay Ahead!</h3>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  Get the latest agriculture news, market updates, weather forecasts and expert tips
                  directly on your mobile device.
                </p>
                <div className="pt-2 flex flex-wrap gap-2.5">
                  <button className="h-9 px-3.5 rounded-lg bg-white text-[#1b4332] hover:bg-emerald-50 transition text-xs font-bold flex items-center gap-2">
                    <span>Google Play</span>
                  </button>
                  <button className="h-9 px-3.5 rounded-lg bg-emerald-900 border border-emerald-700 text-white hover:bg-emerald-800 transition text-xs font-bold flex items-center gap-2">
                    <span>App Store</span>
                  </button>
                </div>
              </div>
              <div className="shrink-0 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/5 border border-white/10 backdrop-blur shadow-inner">
                <div className="text-center">
                  <span className="block text-2xl font-black text-amber-400">App</span>
                  <span className="block text-[10px] uppercase font-bold tracking-widest">
                    PureFarm
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Widgets) */}
          <div className="space-y-6 lg:sticky lg:top-20">
            {/* Weather Widget */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Weather Update
                </p>
                <Sun className="h-5 w-5 text-amber-500 fill-amber-100" />
              </div>
              <div className="mt-3">
                <p className="text-sm font-black text-[#1b4332]">Rajahmundry, AP</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-[#1b4332]">28°C</span>
                  <span className="text-sm font-bold text-muted-foreground">Sunny</span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-b border-border/60 py-3 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold">Humidity</p>
                    <p className="text-xs font-black text-[#1b4332] mt-0.5">62%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold">Wind</p>
                    <p className="text-xs font-black text-[#1b4332] mt-0.5">12 km/h</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold">Rain</p>
                    <p className="text-xs font-black text-[#1b4332] mt-0.5">10%</p>
                  </div>
                </div>

                {/* 4-Day Forecast */}
                <div className="mt-4 space-y-2.5">
                  {weatherForecast.map((fc, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-muted-foreground w-10">{fc.day}</span>
                      <span className="text-foreground/80 font-medium text-center flex-1">
                        {fc.condition}
                      </span>
                      <span className="font-bold text-[#1b4332] w-12 text-right">{fc.temp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Today's Market Prices Widget */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Market Prices
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Today's Mandi Feeds</p>
                </div>
                <Link
                  to="/market"
                  className="text-xs font-bold text-[#2d6a4f] hover:text-[#1b4332] transition"
                >
                  View All
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {mandiPrices.map((p, idx) => {
                  const isPositive = p.changePct >= 0;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between border-b border-border/50 pb-2.5 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-xs font-black text-[#1b4332]">{p.crop}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Local Area Hub</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-[#1b4332]">₹{p.price} / kg</p>
                        <p
                          className={`mt-0.5 text-[10px] font-bold flex items-center justify-end gap-0.5 ${isPositive ? "text-emerald-600" : "text-rose-500"}`}
                        >
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {isPositive ? `+${p.changePct}%` : `${p.changePct}%`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Government Schemes Widget */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Govt Schemes
                </p>
                <Link
                  to="/schemes"
                  className="text-xs font-bold text-[#2d6a4f] hover:text-[#1b4332] transition"
                >
                  View All
                </Link>
              </div>

              <div className="mt-4 space-y-3.5">
                {schemesToRender.map((s, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 mt-0.5 border border-emerald-100">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-[#1b4332] line-clamp-1 leading-snug">
                        {s.name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground leading-normal mt-0.5 line-clamp-2">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Card / Support */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft relative overflow-hidden">
              <p className="text-sm font-black text-[#1b4332]">Need Help?</p>
              <p className="mt-1 text-xs text-muted-foreground leading-normal">
                Chat with our support team on WhatsApp for quick farm consulting.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100"
                  alt="Support representative"
                  className="h-10 w-10 rounded-full object-cover border border-border"
                />
                <div>
                  <p className="text-xs font-bold text-foreground">Advisor Pooja</p>
                  <p className="text-[10px] text-emerald-600 font-bold">Online Now</p>
                </div>
              </div>
              <a
                href={waLink("Hello PureFarm, I need help with my farm.")}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#25d366] hover:bg-[#1ebd55] text-white py-2.5 text-xs font-black shadow-sm transition hover:scale-105 duration-200"
              >
                <MessageCircle className="mr-1.5 h-4 w-4" /> Chat Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}

export function MarketplacePage() {
  // Read search query from URL search parameters on initialization
  const initialQuery = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URL(window.location.href).searchParams.get("query") || "";
  }, []);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<Category | "all">("all");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(200000);

  const urlQuery =
    typeof window !== "undefined" ? new URL(window.location.href).searchParams.get("query") : null;
  useEffect(() => {
    if (urlQuery !== null) {
      setQuery(urlQuery);
    }
  }, [urlQuery]);

  const filtered = useMemo(() => {
    const next = PRODUCTS.filter((product) => {
      const matchesQuery = `${product.name} ${product.brand} ${product.description}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return (
        matchesQuery &&
        (category === "all" || product.category === category) &&
        product.price <= maxPrice
      );
    });
    return next.sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return Number(Boolean(b.badge)) - Number(Boolean(a.badge));
    });
  }, [category, maxPrice, query, sort]);

  return (
    <RoleGuard allowedRoles={["buyer", "farmer", "admin"]}>
      <PageShell
        eyebrow="Marketplace"
        title="Farm input marketplace"
        intro="Search the full 100-product catalogue, compare prices, filter categories, and add products to your cart."
      >
        <div className="mb-6 grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft lg:grid-cols-[1fr_12rem_12rem_14rem]">
          <label className="relative block">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#2d6a4f]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search seeds, fertiliser, tools..."
              className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
            />
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | "all")}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
          >
            <option value="featured">Featured first</option>
            <option value="rating">Top rated</option>
            <option value="price-low">Price low to high</option>
            <option value="price-high">Price high to low</option>
          </select>
          <label className="flex items-center gap-3 text-sm">
            <Filter className="h-4 w-4 text-primary" />
            <span className="shrink-0">Max</span>
            <input
              type="range"
              min="500"
              max="200000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="min-w-0 flex-1"
            />
            <span className="w-16 text-right font-bold">{formatRupees(maxPrice)}</span>
          </label>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">{filtered.length} products found</p>
        {filtered.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No matching products"
            body="Try another crop input, category, or raise the max price filter."
          />
        )}
      </PageShell>
    </RoleGuard>
  );
}

export function ProductDetailPage({ id }: { id: string }) {
  const product = getProduct(id);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const navigate = useNavigate();

  if (!product) {
    return (
      <RoleGuard allowedRoles={["buyer", "farmer", "admin"]}>
        <PageShell
          title="Product not found"
          intro="This product ID does not match the current PureFarm catalogue."
        >
          <EmptyState
            title="Invalid product"
            body="Return to the marketplace to find active products."
            action={
              <Link
                to="/marketplace"
                className="rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground"
              >
                Browse marketplace
              </Link>
            }
          />
        </PageShell>
      </RoleGuard>
    );
  }

  const related = PRODUCTS.filter(
    (item) => item.category === product.category && item.id !== product.id,
  ).slice(0, 4);

  return (
    <RoleGuard allowedRoles={["buyer", "farmer", "admin"]}>
      <PageShell eyebrow={product.category} title={product.name} intro={product.description}>
        <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <img
            src={product.image}
            alt={product.name}
            className="h-80 w-full rounded-2xl object-cover shadow-soft lg:h-[32rem]"
          />
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                {product.brand}
              </span>
              {product.badge ? (
                <span className="rounded-lg bg-amber-50 border border-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                  {product.badge}
                </span>
              ) : null}
              <span className="rounded-lg bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
                {product.rating} ★ rating
              </span>
            </div>
            <p className="text-4xl font-black text-[#1b4332]">
              {formatRupees(product.price)}{" "}
              <span className="text-base font-semibold text-muted-foreground">/{product.unit}</span>
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [
                  "Availability",
                  product.stock > 0 ? `${product.stock} units ready` : "Out of stock",
                ],
                ["Seller", product.brand],
                ["Category", product.category],
                ["Delivery", "Local hub dispatch in 1-3 days"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl bg-[#f4f9f6]/70 border border-emerald-50/50 p-4"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-black text-[#1b4332]">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/60">
              <div className="inline-flex items-center rounded-xl border border-border bg-background">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-black text-foreground">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => addItem(product.id, qty)}
                className="rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white px-6 py-3 font-black text-sm shadow-sm transition hover:scale-105 duration-200"
              >
                Add to cart
              </button>
              <button
                type="button"
                onClick={() => {
                  addItem(product.id, qty);
                  void navigate({ to: "/order" });
                }}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 font-black text-sm shadow-sm transition hover:scale-105 duration-200"
              >
                Buy now
              </button>
            </div>
          </div>
        </div>
        <h2 className="mt-12 text-2xl font-black">Related products</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </PageShell>
    </RoleGuard>
  );
}

export function CartPage() {
  const { items, subtotal, updateQty, removeItem } = useCart();
  const rows = getCartProducts(items);
  const delivery = subtotal > 0 && subtotal < 2000 ? 120 : 0;
  const total = subtotal + delivery;

  return (
    <RoleGuard allowedRoles={["buyer", "farmer", "admin"]}>
      <PageShell
        eyebrow="Cart"
        title="Your cart"
        intro="Review quantities before placing a mock local fulfilment order."
      >
        {rows.length ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
            <div className="space-y-4">
              {rows.map(({ product, qty }) => (
                <div
                  key={product.id}
                  className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-card sm:grid-cols-[7rem_1fr_auto]"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-28 w-full rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-black">{product.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {product.brand} · {formatRupees(product.price)} / {product.unit}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-destructive"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="inline-flex items-center rounded-lg border border-border">
                      <button
                        type="button"
                        onClick={() => updateQty(product.id, qty - 1)}
                        className="h-9 w-9"
                        aria-label={`Decrease ${product.name} quantity`}
                      >
                        <Minus className="mx-auto h-4 w-4" />
                      </button>
                      <span className="w-10 text-center font-black">{qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(product.id, qty + 1)}
                        className="h-9 w-9"
                        aria-label={`Increase ${product.name} quantity`}
                      >
                        <Plus className="mx-auto h-4 w-4" />
                      </button>
                    </div>
                    <p className="font-black">{formatRupees(product.price * qty)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className={`${cardClass} h-fit`}>
              <p className="text-lg font-black">Order summary</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <strong>{formatRupees(subtotal)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <strong>{delivery ? formatRupees(delivery) : "Free"}</strong>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-lg">
                  <span>Total</span>
                  <strong>{formatRupees(total)}</strong>
                </div>
              </div>
              <Link
                to="/order"
                className="mt-5 block rounded-lg bg-primary px-4 py-3 text-center font-black text-primary-foreground"
              >
                Proceed to order
              </Link>
            </div>
          </div>
        ) : (
          <EmptyState
            title="Your cart is empty"
            body="Add seeds, fertilisers, or tools from the marketplace."
            action={
              <Link
                to="/marketplace"
                className="rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground"
              >
                Continue shopping
              </Link>
            }
          />
        )}
      </PageShell>
    </RoleGuard>
  );
}

export function OrderPage() {
  const { items, subtotal, clearCart } = useCart();
  const rows = getCartProducts(items);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    village: "",
    payment: "Cash on delivery",
  });
  const ready =
    form.name.trim().length > 2 &&
    form.phone.trim().length >= 10 &&
    form.village.trim().length > 2 &&
    rows.length > 0;

  if (submitted) {
    return (
      <RoleGuard allowedRoles={["buyer", "farmer", "admin"]}>
        <PageShell
          title="Order confirmed"
          intro="A PureFarm advisor would confirm stock and delivery timing by phone or WhatsApp."
        >
          <div className={cardClass}>
            <CheckCircle2 className="h-12 w-12 text-success" />
            <p className="mt-4 text-2xl font-black">Order PF-{Math.floor(2000 + subtotal)}</p>
            <p className="mt-2 text-muted-foreground">
              Status: confirmation pending · Payment: {form.payment}
            </p>
            <Link
              to="/marketplace"
              onClick={() => clearCart()}
              className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground"
            >
              Back to marketplace
            </Link>
          </div>
        </PageShell>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["buyer", "farmer", "admin"]}>
      <PageShell
        eyebrow="Checkout"
        title="Place order"
        intro="Complete a safe mock order flow. No real payment is processed."
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
          <form
            className={`${cardClass} space-y-4`}
            onSubmit={(e) => {
              e.preventDefault();
              if (ready) setSubmitted(true);
            }}
          >
            {["name", "phone", "village"].map((field) => (
              <label key={field} className="block text-sm font-bold capitalize">
                {field}
                <input
                  value={form[field as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal"
                />
              </label>
            ))}
            <label className="block text-sm font-bold">
              Payment
              <select
                value={form.payment}
                onChange={(e) => setForm({ ...form, payment: e.target.value })}
                className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal"
              >
                <option>Cash on delivery</option>
                <option>UPI on delivery</option>
                <option>Advisor callback</option>
              </select>
            </label>
            {!rows.length ? (
              <p className="text-sm font-bold text-destructive">
                Add products to the cart before ordering.
              </p>
            ) : null}
            <button
              disabled={!ready}
              className="rounded-lg bg-primary px-5 py-3 font-black text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Confirm order
            </button>
          </form>
          <div className={`${cardClass} h-fit`}>
            <p className="font-black">Summary</p>
            <div className="mt-3 space-y-3">
              {rows.map(({ product, qty }) => (
                <div key={product.id} className="flex justify-between gap-3 text-sm">
                  <span>
                    {product.name} x {qty}
                  </span>
                  <strong>{formatRupees(product.price * qty)}</strong>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-4 flex justify-between text-lg font-black">
              <span>Total</span>
              <span>{formatRupees(subtotal)}</span>
            </div>
          </div>
        </div>
      </PageShell>
    </RoleGuard>
  );
}

export function MarketPage() {
  const [query, setQuery] = useState("");
  const rows = MANDI_PRICES.filter((item) =>
    `${item.crop} ${item.mandi} ${item.state}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <PageShell
        eyebrow="Mandi"
        title="Market prices"
        intro="Track local crop prices, arrivals, and trend movement for better selling decisions."
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search crop, mandi, state..."
          className="mb-5 h-11 w-full max-w-xl rounded-lg border border-input bg-card px-4"
        />
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-3 border-b border-border bg-muted p-4 text-sm font-black sm:grid-cols-[1fr_1fr_1fr_1fr_1fr]">
            <span>Crop</span>
            <span>Mandi</span>
            <span className="hidden sm:block">Arrival</span>
            <span>Price</span>
            <span>Trend</span>
          </div>
          {rows.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_1fr_1fr] gap-3 border-b border-border p-4 text-sm last:border-b-0 sm:grid-cols-[1fr_1fr_1fr_1fr_1fr]"
            >
              <strong>{item.crop}</strong>
              <span>
                {item.mandi}, {item.state}
              </span>
              <span className="hidden sm:block">{item.arrival}</span>
              <span>{formatRupees(item.price)}/qtl</span>
              <span
                className={
                  item.changePct >= 0 ? "font-bold text-success" : "font-bold text-destructive"
                }
              >
                {item.changePct >= 0 ? (
                  <TrendingUp className="mr-1 inline h-4 w-4" />
                ) : (
                  <TrendingDown className="mr-1 inline h-4 w-4" />
                )}
                {item.changePct}%
              </span>
            </div>
          ))}
        </div>
      </PageShell>
    </RoleGuard>
  );
}

export function SchemesPage() {
  const [query, setQuery] = useState("");
  const rows = SCHEMES.filter((s) =>
    `${s.name} ${s.category} ${s.eligibility}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <CardGridPage
        eyebrow="Schemes"
        title="Government schemes"
        intro="Find farmer support programmes, eligibility, and official application links."
        query={query}
        setQuery={setQuery}
        items={rows.map((s) => ({
          title: s.name,
          meta: `${s.issuer} · ${s.category}`,
          body: s.description,
          footer: `${s.deadline} · ${s.eligibility}`,
          url: s.url,
        }))}
      />
    </RoleGuard>
  );
}

export function InsurancePage() {
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <CardGridPage
        eyebrow="Insurance"
        title="Crop insurance"
        intro="Compare crop, weather, and allied farming insurance options."
        items={INSURANCE_SCHEMES.map((s) => ({
          title: s.name,
          meta: `${s.type} · ${s.premium}`,
          body: s.description,
          footer: `${s.coverage || ""} Crops: ${(s.crops || []).join(", ")}`,
        }))}
      />
    </RoleGuard>
  );
}

export function WeatherPage() {
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <PageShell
        eyebrow="Weather"
        title="Farm weather advisory"
        intro="Five-day local forecast with field action notes."
      >
        <div className="grid gap-4 md:grid-cols-5">
          {WEATHER.map((day) => (
            <div key={day.day} className={cardClass}>
              <CloudSun className="h-8 w-8 text-primary" />
              <p className="mt-3 font-black">{day.day}</p>
              <p className="text-sm text-muted-foreground">{day.condition}</p>
              <p className="mt-3 text-2xl font-black">
                {day.high}° / {day.low}°
              </p>
              <p className="mt-1 text-sm font-bold text-primary">{day.rain}% rain</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{day.advisory}</p>
            </div>
          ))}
        </div>
      </PageShell>
    </RoleGuard>
  );
}

export function CropCalendarPage() {
  const [selected, setSelected] = useState(CROPS[0]?.name || "");
  const crop = CROPS.find((item) => item.name === selected) || CROPS[0];
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <PageShell
        eyebrow="Crop calendar"
        title="Season planner"
        intro="Select a crop to see its sowing window, harvest timing, and activity timeline."
      >
        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          <div className={cardClass}>
            {CROPS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setSelected(item.name)}
                className={`mb-2 block w-full rounded-lg px-3 py-2 text-left font-bold ${selected === item.name ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                {item.name}
              </button>
            ))}
          </div>
          {crop ? (
            <div className={cardClass}>
              <p className="text-2xl font-black">
                {crop.name} · {crop.season}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                {[
                  ["Sowing", crop.sowing],
                  ["Harvest", crop.harvest],
                  ["Duration", crop.duration],
                  ["Water", crop.water],
                ].map(([a, b]) => (
                  <div key={a} className="rounded-lg bg-muted p-3">
                    <p className="text-xs font-bold uppercase text-muted-foreground">{a}</p>
                    <p className="font-black">{b}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-muted-foreground">{crop.tip}</p>
              <div className="mt-6 grid gap-2 sm:grid-cols-5">
                {(crop.tasks || []).map((task, index) => (
                  <div key={task} className="rounded-lg border border-border p-3">
                    <p className="text-xs font-bold text-primary">Step {index + 1}</p>
                    <p className="font-bold">{task}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </PageShell>
    </RoleGuard>
  );
}

export function LearnPage() {
  const [query, setQuery] = useState("");
  const rows = COURSES.filter((c) =>
    `${c.title} ${c.topic} ${c.level}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <CardGridPage
        eyebrow="Learning"
        title="Farmer learning hub"
        intro="Short, practical modules for field operations and farm business."
        query={query}
        setQuery={setQuery}
        items={rows.map((c) => ({
          title: c.title,
          meta: `${c.level} · ${c.hours} hrs · ${c.lessons} lessons`,
          body: c.description || "",
          footer: `${c.instructor} · ${c.progress}% progress`,
          icon: <GraduationCap className="h-5 w-5" />,
        }))}
      />
    </RoleGuard>
  );
}

export function InternshipsPage() {
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <CardGridPage
        eyebrow="Internships"
        title="Agri internships"
        intro="Field, operations, content, and lab roles for agriculture learners."
        items={INTERNSHIPS.map((i) => ({
          title: i.org,
          meta: `${i.title} · ${i.location} · ${i.type}`,
          body: i.description || "",
          footer: `${i.stipend} · Apply by ${i.deadline} · ${i.skills.join(", ")}`,
        }))}
      />
    </RoleGuard>
  );
}

export function NotificationsPage() {
  const [items, setItems] = useState(NOTIFICATIONS);
  const unread = items.filter((n) => !n.read).length;
  return (
    <RoleGuard allowedRoles={["buyer", "farmer", "seller", "admin"]}>
      <PageShell
        eyebrow="Notifications"
        title="Farm alerts"
        intro={`${unread} unread advisories across market, weather, schemes, and orders.`}
      >
        <div className="space-y-3">
          {items.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              onToggle={() =>
                setItems((current) =>
                  current.map((n) => (n.id === item.id ? { ...n, read: !n.read } : n)),
                )
              }
            />
          ))}
        </div>
      </PageShell>
    </RoleGuard>
  );
}

function NotificationRow({ item, onToggle }: { item: NotificationItem; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`block w-full rounded-xl border p-4 text-left shadow-card ${item.read ? "border-border bg-card" : "border-primary/35 bg-accent"}`}
    >
      <div className="flex items-start gap-3">
        <Bell className="mt-1 h-5 w-5 text-primary" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-black">{item.title}</p>
            <Pill>{item.category || item.tone}</Pill>
            <span className="text-xs text-muted-foreground">{item.time}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
        </div>
      </div>
    </button>
  );
}

export function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="Built around everyday farm decisions"
      intro="PureFarm is modelled as a farmer-first digital agriculture platform combining commerce, advisory, learning, and support."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {["Reliable inputs", "Local intelligence", "Human support"].map((title) => (
          <div key={title} className={cardClass}>
            <Users className="h-7 w-7 text-primary" />
            <p className="mt-3 text-xl font-black">{title}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              A cohesive experience for ordering, planning, learning, and contacting advisors.
            </p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export function SupportPage() {
  return (
    <FormPage
      eyebrow="Support"
      title="How can PureFarm help?"
      intro="Send a support request and review common answers."
      button="Create support ticket"
    />
  );
}

export function ContactPage() {
  return (
    <FormPage
      eyebrow="Contact"
      title="Contact PureFarm"
      intro={`Reach the PureFarm team at ${SITE.phone} or submit a callback request.`}
      button="Request callback"
    />
  );
}

function FormPage({
  eyebrow,
  title,
  intro,
  button,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  button: string;
}) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const valid = form.name.length > 2 && form.phone.length >= 10 && form.message.length > 8;
  return (
    <PageShell eyebrow={eyebrow} title={title} intro={intro}>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <form
          className={`${cardClass} space-y-4`}
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) setSent(true);
          }}
        >
          {sent ? (
            <p className="rounded-lg bg-accent p-3 font-bold text-accent-foreground">
              Thanks. This demo request has been recorded locally.
            </p>
          ) : null}
          {(["name", "phone", "message"] as const).map((field) => (
            <label key={field} className="block text-sm font-bold capitalize">
              {field}
              {field === "message" ? (
                <textarea
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="mt-2 min-h-32 w-full rounded-lg border border-input bg-background p-3 font-normal"
                />
              ) : (
                <input
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal"
                />
              )}
            </label>
          ))}
          <button
            disabled={!valid}
            className="rounded-lg bg-primary px-5 py-3 font-black text-primary-foreground disabled:opacity-50"
          >
            {button}
          </button>
        </form>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <div key={faq.question} className={cardClass}>
              <p className="font-black">{faq.question}</p>
              <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isPhone = (val: string) => /^\d{10}$/.test(val);

  const isValid = useMemo(() => {
    return (
      (isEmail(phoneOrEmail) || isPhone(phoneOrEmail) || phoneOrEmail.trim().length >= 3) &&
      password.length >= 6
    );
  }, [phoneOrEmail, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setErrorMessage("");

    const success = await login(phoneOrEmail, password);
    if (success) {
      const key = phoneOrEmail.trim().toLowerCase();
      let dest = "/";
      if (key.includes("buyer")) dest = "/marketplace";
      else if (key.includes("seller")) dest = "/seller";
      else if (key.includes("admin")) dest = "/admin";

      void navigate({ to: dest as "/" });
    } else {
      setErrorMessage("Invalid credentials. Try admin@purefarm.test / password123");
      setLoading(false);
    }
  };

  const handleDemoFill = (email: string) => {
    setPhoneOrEmail(email);
    setPassword("password123");
    if (errorMessage) setErrorMessage("");
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden select-none bg-slate-950">
      {/* 1. Cinematic Farm Fullscreen Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/login-bg.jpg"
          alt="Cinematic Smart Farm at Sunrise"
          className="w-full h-full object-cover object-center scale-[1.02] transform transition-transform duration-1000 ease-out"
        />
        {/* Subtle atmospheric dark overlay to retain warm cinematic colors */}
        <div className="absolute inset-0 bg-[#00140f]/[0.10] backdrop-brightness-[0.98]" />
      </div>

      {/* Top Bar / Header Branding */}
      <header className="relative z-20 w-full px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl glass-card-dark text-[#19C37D] shadow-md group-hover:scale-105 transition duration-200 border border-white/40">
            <Leaf className="h-5 w-5 text-[#19C37D]" />
          </span>
          <div>
            <span className="block text-lg font-extrabold text-[#FFFFFF] drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] leading-none">
              Pure Farm
            </span>
            <span className="block text-[9px] font-bold text-[#E8F5EE] tracking-wider uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] mt-1">
              Agri Portal
            </span>
          </div>
        </Link>

        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass-btn-google-white text-[#FFFFFF] text-xs font-extrabold transition shadow-sm hover:scale-105"
        >
          <span>Explore Marketplace</span>
          <ArrowRight className="h-3.5 w-3.5 text-[#B7F34A]" />
        </Link>
      </header>

      {/* Main Center Area with Translucent Glassmorphism Login Card & Floating Badges */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT SIDE: Decorative Floating Smart Farming Badges (Desktop) */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 animate-subtle-float-1">
            <div className="glass-card-dark p-4 rounded-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#19C37D]/20 text-[#19C37D] border border-[#19C37D]/40 shadow-[0_0_12px_rgba(25,195,125,0.3)]">
                  <Cpu className="h-5 w-5 text-[#19C37D]" />
                </span>
                <div>
                  <h4
                    className="text-sm font-extrabold text-[#FFFFFF]"
                    style={{ textShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
                  >
                    Smart Farming
                  </h4>
                  <p className="text-xs font-medium text-[#E8F5EE]">Smarter decisions</p>
                </div>
              </div>
            </div>

            <div className="glass-card-dark p-4 rounded-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#19C37D]/20 text-[#19C37D] border border-[#19C37D]/40 shadow-[0_0_12px_rgba(25,195,125,0.3)]">
                  <Droplets className="h-5 w-5 text-[#19C37D]" />
                </span>
                <div>
                  <h4
                    className="text-sm font-extrabold text-[#FFFFFF]"
                    style={{ textShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
                  >
                    Water Efficient
                  </h4>
                  <p className="text-xs font-medium text-[#E8F5EE]">Save every drop</p>
                </div>
              </div>
            </div>

            <div className="glass-card-dark p-4 rounded-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#19C37D]/20 text-[#19C37D] border border-[#19C37D]/40 shadow-[0_0_12px_rgba(25,195,125,0.3)]">
                  <Sprout className="h-5 w-5 text-[#19C37D]" />
                </span>
                <div>
                  <h4
                    className="text-sm font-extrabold text-[#FFFFFF]"
                    style={{ textShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
                  >
                    Healthy Crop
                  </h4>
                  <p className="text-xs font-medium text-[#E8F5EE]">Better yield</p>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER: Main Translucent Glassmorphic Login Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[440px] rounded-[28px] glass-panel p-7 sm:p-9 transition-all">
              {/* Brand Icon & Heading */}
              <div className="text-center space-y-1.5 pb-2">
                <div className="flex justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#087A50] to-[#064B38] text-white shadow-lg border border-white/40">
                    <Leaf className="h-6 w-6 text-[#B7F34A]" />
                  </span>
                </div>
                <h1
                  className="text-3xl sm:text-[42px] font-extrabold tracking-tight text-[#FFFFFF] leading-tight"
                  style={{ textShadow: "0 3px 12px rgba(0,0,0,0.30)" }}
                >
                  Pure Farm
                </h1>
                <p className="text-xs font-bold text-[#E8F5EE]">
                  Nurturing Nature, Growing Future
                </p>
                <p className="text-[11px] font-medium text-[#FFFFFF]/85">
                  Chain Address, Mark Two, Pure Farm
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 mt-3">
                {/* Username / Email */}
                <div className="space-y-1">
                  <label
                    className="text-[14px] font-bold text-[#FFFFFF] block"
                    style={{ textShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
                  >
                    Username or Email
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-[#FFFFFF]/90">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      disabled={loading}
                      value={phoneOrEmail}
                      onChange={(e) => {
                        setPhoneOrEmail(e.target.value);
                        if (errorMessage) setErrorMessage("");
                      }}
                      placeholder="Username or Email"
                      className="h-11 w-full rounded-xl glass-input-white pl-10 pr-4 text-sm font-semibold text-[#FFFFFF] placeholder:text-white/70 outline-none transition"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label
                    className="text-[14px] font-bold text-[#FFFFFF] block"
                    style={{ textShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
                  >
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-[#FFFFFF]/90">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={loading}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage("");
                      }}
                      placeholder="Password"
                      className="h-11 w-full rounded-xl glass-input-white pl-10 pr-11 text-sm font-semibold text-[#FFFFFF] placeholder:text-white/70 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-[#FFFFFF] hover:text-[#B7F34A] transition p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage ? (
                  <p className="text-xs font-extrabold text-rose-200 bg-rose-950/70 backdrop-blur-md p-2 rounded-lg border border-rose-500/50">
                    {errorMessage}
                  </p>
                ) : null}

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label
                    className="flex items-center gap-2 cursor-pointer select-none font-bold text-[#FFFFFF] text-[14px]"
                    style={{ textShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
                  >
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      disabled={loading}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-[#19C37D] focus:ring-[#19C37D] border-white/60 bg-white/30"
                    />
                    Remember me
                  </label>
                  <Link
                    to="/support"
                    className="font-bold text-[14px] text-[#FFFFFF] hover:text-[#B7F34A] hover:underline transition"
                    style={{ textShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Main Submit Button */}
                <button
                  type="submit"
                  disabled={!isValid || loading}
                  className="w-full h-11 sm:h-12 rounded-xl glass-btn-primary-agri disabled:opacity-50 text-[#FFFFFF] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Login</span>
                      <LogIn className="h-4 w-4 text-[#B7F34A]" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="w-full border-t border-white/30" />
                <span className="absolute bg-black/40 backdrop-blur-md px-3 py-0.5 text-[11px] font-bold text-[#E8F5EE] uppercase tracking-wider rounded-full border border-white/40 shadow-sm">
                  or continue with
                </span>
              </div>

              {/* Social Login & Demo Quick-Login */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleDemoFill("farmer@purefarm.test")}
                  className="w-full h-10 rounded-xl glass-btn-google-white flex items-center justify-center gap-2.5 text-xs font-bold text-[#FFFFFF] shadow-sm"
                >
                  {/* Google SVG Icon */}
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Demo Accounts Quick-Select Pills */}
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-center text-[#E8F5EE] uppercase tracking-wider mb-1.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                    Demo Profiles (Click to prefill)
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { role: "Farmer", email: "farmer@purefarm.test" },
                      { role: "Buyer", email: "buyer@purefarm.test" },
                      { role: "Seller", email: "seller@purefarm.test" },
                      { role: "Admin", email: "admin@purefarm.test" },
                    ].map((demo) => (
                      <button
                        key={demo.role}
                        type="button"
                        onClick={() => handleDemoFill(demo.email)}
                        className="py-1 px-1.5 rounded-lg glass-pill-demo text-[11px] font-bold text-[#FFFFFF] transition text-center"
                      >
                        {demo.role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Sign-Up Link */}
              <div className="text-center text-xs pt-3 font-medium text-[#E8F5EE]">
                <span>Don't have an account? </span>
                <Link
                  to="/register"
                  className="font-extrabold text-[#B7F34A] hover:underline transition drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Decorative Floating Farm Tomorrow Badge (Desktop) */}
          <div className="hidden lg:flex lg:col-span-3 justify-end animate-subtle-float-2">
            <div className="glass-card-dark p-5 rounded-3xl max-w-[220px] space-y-3 transition-all duration-300 hover:scale-105">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#087A50] text-[#B7F34A] shadow-md border border-white/40">
                <Sparkles className="h-5 w-5 text-[#B7F34A]" />
              </span>
              <div>
                <h4
                  className="text-sm font-extrabold text-[#FFFFFF]"
                  style={{ textShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
                >
                  Better Farming
                </h4>
                <p className="text-xs font-extrabold text-[#B7F34A]">Better Tomorrow</p>
                <p className="text-[10px] font-medium text-[#E8F5EE] mt-1 leading-normal">
                  Empowering Indian agriculture with connected smart solutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM BAR: Wide Subtle Glass Information Bar */}
      <footer className="relative z-20 w-full px-4 py-3 glass-bar-dark text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-around gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#19C37D]" />
            <div>
              <span className="block text-xs font-extrabold leading-tight text-[#FFFFFF]">
                Secure & Reliable
              </span>
              <span className="block text-[10px] text-[#E8F5EE] font-medium leading-tight">
                Your data is protected
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#19C37D]" />
            <div>
              <span className="block text-xs font-extrabold leading-tight text-[#FFFFFF]">
                Real-time Insights
              </span>
              <span className="block text-[10px] text-[#E8F5EE] font-medium leading-tight">
                Data-driven farming
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#B7F34A]" />
            <div>
              <span className="block text-xs font-extrabold leading-tight text-[#FFFFFF]">
                Sustainable Future
              </span>
              <span className="block text-[10px] text-[#E8F5EE] font-medium leading-tight">
                For a better tomorrow
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = useMemo(() => {
    return name.length > 2 && /^\d{10}$/.test(phone) && password.length >= 6;
  }, [name, phone, password]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const session = {
        id: "u-registered-" + Date.now(),
        name: name,
        email: phone + "@purefarm.test",
        role: "farmer" as const,
      };
      if (typeof window !== "undefined") {
        window.localStorage.setItem("purefarm_session", JSON.stringify(session));
      }

      void navigate({ to: "/" });
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center overflow-hidden font-sans">
      {/* 1. FULL-SCREEN AGRICULTURE BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1920"
          alt="Realistic Indian agricultural farm field"
          className="h-full w-full object-cover"
        />
        {/* Subtle dark/green overlay for text readability */}
        <div className="absolute inset-0 bg-[#0A2617]/50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
      </div>

      {/* 4. PUREFARM BRANDING (Top Left) */}
      <div className="absolute top-6 left-6 lg:top-10 lg:left-12 z-10 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-lg">
          <Leaf className="h-6 w-6" />
        </span>
        <div>
          <span className="block text-2xl font-black tracking-wide leading-none text-white drop-shadow-md">PureFarm</span>
          <span className="block text-[10px] font-bold text-white/90 uppercase tracking-widest leading-none mt-1.5 drop-shadow-md">
            Connect � Grow � Prosper
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center justify-between p-6 lg:p-12 mt-16 lg:mt-0">
        
        {/* 5. LEFT-SIDE CONTENT */}
        <div className="w-full lg:w-1/2 text-white mb-10 lg:mb-0 lg:pr-12 hidden md:block">
          <h2 className="text-4xl lg:text-6xl font-black leading-tight drop-shadow-lg mb-6">
            Join the Digital<br />Agri Revolution
          </h2>
          <p className="text-lg text-white/90 leading-relaxed font-medium max-w-md mb-10 drop-shadow-md">
            Register your farmer profile today to unlock crop guidance, Mandi price trackers, government scheme applications, and premium seed/fertiliser listings.
          </p>
          
          <div className="space-y-4">
            {/* Feature 1 */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-[16px] p-4 max-w-sm">
              <div className="bg-[#145A43] p-2 rounded-lg"><Leaf className="h-5 w-5 text-white" /></div>
              <div>
                <h4 className="font-bold text-white text-sm">Smart Farming</h4>
                <p className="text-white/80 text-xs">Smarter decisions</p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-[16px] p-4 max-w-sm">
              <div className="bg-[#145A43] p-2 rounded-lg"><svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div>
              <div>
                <h4 className="font-bold text-white text-sm">Water Efficient</h4>
                <p className="text-white/80 text-xs">Every drop counts</p>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-[16px] p-4 max-w-sm">
              <div className="bg-[#145A43] p-2 rounded-lg"><svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
              <div>
                <h4 className="font-bold text-white text-sm">Healthy Crop</h4>
                <p className="text-white/80 text-xs">Better yield</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2 & 3. GLASSMORPHISM CREATE ACCOUNT PANEL */}
        <div className="w-full max-w-md lg:ml-auto">
          <div className="bg-white/30 backdrop-blur-[24px] border border-white/40 rounded-[28px] p-8 lg:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
            
            {/* 6. CREATE ACCOUNT PANEL CONTENT */}
            <div className="mb-8">
              <div className="flex justify-center mb-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#145A43]/10 backdrop-blur-md border border-[#145A43]/20 text-[#0A2617] shadow-sm">
                  <Leaf className="h-7 w-7" />
                </span>
              </div>
              {/* 7. TEXT VISIBILITY (High Contrast) */}
              <h3 className="text-[28px] font-black text-center text-[#0A2617] leading-tight">
                Create Account 🌱
              </h3>
              <p className="text-center text-[#11311F] text-sm font-semibold mt-2">
                Register your farmer profile to get started
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              
              {/* 8. INPUT DESIGN (Frosted) */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#0A2617] block">Full Name</label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="h-12 w-full rounded-[14px] border border-white/50 bg-white/40 backdrop-blur-sm px-4 text-[15px] font-semibold text-[#0A2617] placeholder:text-[#11311F]/60 outline-none focus:ring-2 focus:ring-[#145A43] focus:bg-white/60 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#0A2617] block">Mobile Number</label>
                <input
                  type="tel"
                  required
                  disabled={loading}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="h-12 w-full rounded-[14px] border border-white/50 bg-white/40 backdrop-blur-sm px-4 text-[15px] font-semibold text-[#0A2617] placeholder:text-[#11311F]/60 outline-none focus:ring-2 focus:ring-[#145A43] focus:bg-white/60 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#0A2617] block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min. 6 chars)"
                    className="h-12 w-full rounded-[14px] border border-white/50 bg-white/40 backdrop-blur-sm pl-4 pr-14 text-[15px] font-semibold text-[#0A2617] placeholder:text-[#11311F]/60 outline-none focus:ring-2 focus:ring-[#145A43] focus:bg-white/60 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-xs font-bold text-[#145A43] hover:text-[#0A2617] transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {!isValid && (name.length > 0 || phone.length > 0 || password.length > 0) && (
                <p className="text-[11px] font-semibold leading-relaxed text-[#145A43] bg-white/30 backdrop-blur-sm p-3 rounded-xl border border-[#145A43]/20">
                  � Name should be at least 3 characters.<br />
                  � Mobile number must be exactly 10 digits.<br />
                  � Password must be at least 6 characters.
                </p>
              )}

              {/* 9. CREATE ACCOUNT BUTTON (Premium) */}
              <button
                type="submit"
                disabled={!isValid || loading}
                className="group relative w-full h-12 mt-4 rounded-[14px] bg-gradient-to-r from-[#145A43] to-[#0D3B2E] hover:from-[#0D3B2E] hover:to-[#0A2617] disabled:from-white/30 disabled:to-white/30 disabled:text-[#11311F]/40 disabled:cursor-not-allowed text-white font-bold text-[15px] shadow-[0_4px_14px_rgba(20,90,67,0.3)] transition-all hover:shadow-[0_6px_20px_rgba(20,90,67,0.4)] hover:-translate-y-0.5 flex items-center justify-center gap-2 overflow-hidden"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-sm font-semibold mt-6">
              <span className="text-[#11311F]">Already have an account? </span>
              <Link
                to="/login"
                className="text-[#145A43] hover:text-[#0A2617] transition-colors hover:underline"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SellerPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Authentication check for Route Protection
  useEffect(() => {
    if (!loading && (!user || (user.role !== "seller" && user.role !== "admin"))) {
      void navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking authorization...</p>
      </div>
    );
  }

  if (!user || (user.role !== "seller" && user.role !== "admin")) {
    return <AccessDenied requiredRoles={["seller", "admin"]} />;
  }

  // Get a few mock products for Kiran's inventory
  const sellerProducts = PRODUCTS.slice(5, 10);

  return (
    <PageShell
      eyebrow="Seller Hub"
      title="Seller Dashboard"
      intro="Manage your farm produce listings, update inventory levels, and process customer orders."
    >
      {/* Seller KPI Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          {
            label: "Total Sales",
            value: "₹1,42,800",
            delta: "+12.4% this week",
            color: "text-[#2d6a4f]",
          },
          {
            label: "Active Listings",
            value: "18 Products",
            delta: "Synced live",
            color: "text-[#1b4332]",
          },
          {
            label: "Pending Orders",
            value: "5 Orders",
            delta: "Requires dispatch",
            color: "text-amber-600",
          },
          {
            label: "Seller Rating",
            value: "4.8 ★",
            delta: "From 120 reviews",
            color: "text-amber-500",
          },
        ].map((stat, idx) => (
          <div key={idx} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {stat.label}
            </p>
            <p className={`mt-2 text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="mt-1 text-[10px] font-bold text-muted-foreground">{stat.delta}</p>
          </div>
        ))}
      </div>

      {/* Grid: Listings + Orders */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Inventory Column */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#1b4332]">Product Inventory</h3>
            <button
              onClick={() => alert("Add Product mock action clicked!")}
              className="rounded-lg bg-[#2d6a4f] hover:bg-[#1b4332] text-white px-3 py-1.5 text-xs font-bold transition shadow-sm"
            >
              + Add Product
            </button>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-bold">
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Stock Level</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sellerProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 font-bold text-[#1b4332]">{p.name}</td>
                    <td className="py-3">
                      ₹{p.price} / {p.unit}
                    </td>
                    <td className="py-3">
                      <span
                        className={`font-semibold ${p.stock > 10 ? "text-emerald-600" : "text-rose-500"}`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => alert(`Edit mock action for: ${p.name}`)}
                        className="text-xs font-bold text-[#2d6a4f] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => alert(`Restock mock action for: ${p.name}`)}
                        className="text-xs font-bold text-amber-500 hover:underline"
                      >
                        Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders Column */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
          <h3 className="text-base font-black text-[#1b4332]">Recent Orders</h3>

          <div className="space-y-3.5">
            {[
              {
                id: "PF-2049",
                customer: "Suresh Rao",
                items: "Certified Seed Potatoes",
                total: "₹4,500",
                status: "Pending",
                date: "10 mins ago",
              },
              {
                id: "PF-2048",
                customer: "M. Naidu",
                items: "Organic Vermicompost",
                total: "₹2,250",
                status: "Processing",
                date: "2 hrs ago",
              },
              {
                id: "PF-2047",
                customer: "V. Reddy",
                items: "Premium NPK Blend",
                total: "₹8,100",
                status: "Dispatched",
                date: "Yesterday",
              },
            ].map((o, idx) => (
              <div
                key={idx}
                className="border-b border-border/50 pb-3 last:border-0 last:pb-0 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-[#1b4332]">{o.items}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Order {o.id} · Customer: {o.customer} · {o.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">{o.total}</p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold ${
                      o.status === "Pending"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : o.status === "Processing"
                          ? "bg-blue-50 text-blue-700 border border-blue-100"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export function AdminPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <PageShell
        eyebrow="Admin"
        title="Operations dashboard"
        intro="Mock management view for products, orders, farmers, and support workload."
      >
        <div className="grid gap-4 md:grid-cols-4">
          {ADMIN_STATS.map((stat) => (
            <div key={stat.label} className={cardClass}>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-3xl font-black">{stat.value}</p>
              <p className="mt-1 text-sm font-bold text-primary">{stat.delta}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className={cardClass}>
            <p className="font-black">Recent orders</p>
            {[
              "PF-2048 · Drip kit · Pending",
              "PF-2047 · Wheat seed · Dispatched",
              "PF-2046 · Vermicompost · Delivered",
            ].map((row) => (
              <p key={row} className="mt-3 rounded-lg bg-muted p-3 text-sm">
                {row}
              </p>
            ))}
          </div>
          <div className={cardClass}>
            <p className="font-black">Catalogue health</p>
            {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
              <p key={cat.id} className="mt-3 rounded-lg bg-muted p-3 text-sm">
                {cat.label}: {PRODUCTS.filter((p) => p.category === cat.id).length} active listings
              </p>
            ))}
          </div>
        </div>
      </PageShell>
    </RoleGuard>
  );
}

function CardGridPage({
  eyebrow,
  title,
  intro,
  query,
  setQuery,
  items,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  query?: string;
  setQuery?: (value: string) => void;
  items: {
    title: string;
    meta: string;
    body: string;
    footer: string;
    url?: string;
    icon?: React.ReactNode;
  }[];
}) {
  return (
    <PageShell eyebrow={eyebrow} title={title} intro={intro}>
      {setQuery ? (
        <input
          value={query || ""}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="mb-5 h-11 w-full max-w-xl rounded-lg border border-input bg-card px-4"
        />
      ) : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const content = (
            <div className={`${cardClass} h-full`}>
              <div className="flex items-start gap-3">
                {item.icon}
                <div>
                  <p className="text-lg font-black">{item.title}</p>
                  <p className="mt-1 text-sm font-bold text-primary">{item.meta}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.body}</p>
              <p className="mt-4 text-xs font-bold text-muted-foreground">{item.footer}</p>
            </div>
          );
          return item.url ? (
            <a
              key={item.title}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="block transition hover:-translate-y-0.5"
            >
              {content}
            </a>
          ) : (
            <div key={item.title}>{content}</div>
          );
        })}
      </div>
    </PageShell>
  );
}
