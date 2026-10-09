import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useTranslation } from "@/i18n/LanguageContext";
import { LanguageSelector } from "./AppShell";
import { getColdStorageFacilities, updateFacilityCapacity, type ColdStorageFacility } from "@/services/coldStorage";
import { getMarketPrices, syncLiveMarketPrices, INITIAL_AGMARKNET_PRICES, type SyncResult } from "@/services/marketPrices";
import { getMachines, createMachine, getEquipmentImage } from "@/services/machines";
import {
  fetchWeatherData,
  fetchWeatherByCoords,
  CROP_PROFILES,
  getCropWeatherAdvisories,
  WeatherError,
  type WeatherData,
  type CropAdvisory,
} from "@/services/weather";
import type {
  MarketPrice,
  DbMachine,
  MachineCategory,
  MachineCondition,
  MachineRateUnit,
  MachineAvailability,
} from "@/types/database";
import {
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Bell,
  CalendarDays,
  Clock,
  LineChart,
  CheckCircle2,
  Cloud,
  CloudRain,
  CloudSun,
  Filter,
  GraduationCap,
  Briefcase,
  BookOpen,
  FileText,
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
  ExternalLink,
  EyeOff,
  LogIn,
  Sparkles,
  Sprout,
  Cpu,
  Activity,
  Globe,
  Package,
  RefreshCw,
  Navigation,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Snowflake,
  Building2,
  Phone,
  Wrench,
  PlusCircle,
  DollarSign,
  X,
  Video,
} from "lucide-react";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
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
import { AGRICULTURE_LESSONS } from "@/data/lessons";
import { CATEGORIES, getProduct, PRODUCTS } from "@/data/products";
import { SITE, waLink } from "@/data/site";
import type { Category, Course, NotificationItem, Product } from "@/data/types";
import { cardClass, glassCardClass, PageShell } from "./AppShell";
import { getCartProducts, useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { useToast } from "./ToastContext";
import { useAuth, type UserRole } from "./AuthContext";
import { formatRupees, ProductCard, NEUTRAL_PRODUCT_FALLBACK } from "./ProductCard";
import {
  getProducts,
  getFarmerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/products";
import {
  createRealBuyerOrder,
  getOrdersByBuyer,
  getOrdersByFarmer,
  type OrderWithItems,
} from "@/services/orders";
import type { DbProduct, ProductCategory, ProductStatus } from "@/types/database";

function Stat({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-white/20 bg-white/12 p-4 text-white backdrop-blur">
      <p className="text-2xl font-black">{value}</p>
      <p className="text-sm text-white/78">{t(label)}</p>
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
  const { t } = useTranslation();

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
          <h2 className="text-xl font-black text-foreground">{t("Access Restricted")}</h2>
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
          {t("Go to Dashboard")}
        </button>
      </div>
    </PageShell>
  );
}

export function RoleGuard({
  allowedRoles,
  allowGuest = false,
  children,
}: {
  allowedRoles: UserRole[];
  allowGuest?: boolean;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading) {
      if (!user && !allowGuest) {
        void navigate({ to: "/login" });
      } else if (user && !allowedRoles.includes(user.role)) {
        void navigate({ to: "/login" });
      }
    }
  }, [user, loading, navigate, allowedRoles, allowGuest]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground font-semibold">
          {t("Checking authorization...")}
        </p>
      </div>
    );
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <AccessDenied requiredRoles={allowedRoles} />;
  }

  if (!user && !allowGuest) {
    return <AccessDenied requiredRoles={allowedRoles} />;
  }

  return <>{children}</>;
}

export function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (user?.role === "buyer") {
    return <BuyerHomePage />;
  }

  if (user?.role === "student") {
    return <StudentHomePage />;
  }

  return <FarmerHomePage />;
}

export function BuyerHomePage() {
  const { t } = useTranslation();
  const categoriesList = [
    { name: "Fruits", img: "/categories/fruits.jpg", href: "/category/fruits" },
    { name: "Vegetables", img: "/categories/vegetables.jpg", href: "/category/vegetables" },
    { name: "Seeds", img: "/categories/seeds.jpg", href: "/category/seeds" },
    { name: "Fertilizers", img: "/categories/fertilizers.jpg", href: "/category/fertilizers" },
    { name: "Pesticides", img: "/categories/pesticides.jpg", href: "/category/pesticides" },
    { name: "Farm Tools", img: "/categories/farm-tools.jpg", href: "/category/farm-tools" },
    { name: "Equipment", img: "/categories/equipment.jpg", href: "/category/equipment" },
  ];

  const featuredProducts = useMemo(() => PRODUCTS.slice(0, 8), []);

  return (
    <RoleGuard allowedRoles={["buyer", "admin"]}>
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* Buyer Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] text-white p-8 sm:p-12 shadow-soft">
          <div className="max-w-xl space-y-4 relative z-10">
            <span className="inline-flex rounded-full bg-amber-500/20 text-amber-300 px-3 py-1 text-xs font-black uppercase tracking-wider">
              PUREFARM MARKETPLACE
            </span>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight text-white">
              Fresh Produce & Quality Agri Products Delivered
            </h1>
            <p className="text-sm text-emerald-100/90 leading-relaxed font-medium">
              Browse directly from verified local farmers and certified suppliers. High quality,
              fair prices, direct sourcing.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 transition px-5 py-3 text-xs font-black text-white shadow-md"
              >
                Browse Marketplace <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/order"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 transition px-5 py-3 text-xs font-black text-white"
              >
                My Orders <ShoppingBag className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { title: "100% Fresh", desc: "Handpicked Produce", icon: Leaf },
            { title: "Direct Sourcing", desc: "Direct from Farmers", icon: Scale },
            { title: "Best Quality", desc: "Certified Products", icon: Award },
            { title: "Fast Delivery", desc: "Express Door Delivery", icon: Truck },
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
                <p className="mt-1 text-[10px] text-muted-foreground leading-normal">{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#1b4332]">Explore Categories</h2>
              <p className="text-xs text-muted-foreground">
                Find fresh crops, fruits, seeds, and equipment
              </p>
            </div>
            <Link to="/marketplace" className="text-xs font-bold text-[#2d6a4f] hover:underline">
              View Catalog →
            </Link>
          </div>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4">
            {categoriesList.map((cat, idx) => (
              <Link
                key={idx}
                to={cat.href}
                className="flex flex-col rounded-xl border border-border bg-white p-2.5 shadow-sm hover:shadow-md transition-all duration-200 text-center hover:scale-[1.02] aspect-square justify-between"
              >
                <div className="h-[65%] w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="h-full w-full object-cover hover:scale-105 transition duration-300"
                  />
                </div>
                <span className="text-xs font-black text-[#1b4332] tracking-tight block py-1 line-clamp-1">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#1b4332]">Featured Products</h2>
              <p className="text-xs text-muted-foreground">
                Top quality products available for order
              </p>
            </div>
            <Link to="/marketplace" className="text-xs font-bold text-[#2d6a4f] hover:underline">
              See All Products →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}

export function StudentHomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={["student", "admin"]}>
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* Student Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1e16] via-[#1b4332] to-[#2d6a4f] text-white p-8 sm:p-10 shadow-soft">
          <div className="max-w-2xl space-y-3 relative z-10">
            <span className="inline-flex rounded-full bg-emerald-400/20 text-emerald-300 px-3 py-1 text-xs font-black uppercase tracking-wider">
              STUDENT DASHBOARD
            </span>
            <h1 className="text-2xl sm:text-3xl font-black leading-tight text-white">
              Welcome Back, {user?.name || "Student"} 👋
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
              {t(
                "Advance your skills in Web Development, Python, AI/ML, and AgriTech. Explore active internship opportunities and track course progress.",
              )}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 transition px-4 py-2.5 text-xs font-black text-white shadow-sm"
              >
                {t("Browse All Courses")}
                <GraduationCap className="h-4 w-4" />
              </Link>
              <Link
                to="/internships"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 transition px-4 py-2.5 text-xs font-black text-white"
              >
                View Internships <Briefcase className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-[#1b4332]">6</p>
            <p className="text-xs font-semibold text-muted-foreground mt-0.5">
              {t("Enrolled Courses")}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-[#1b4332]">2</p>
            <p className="text-xs font-semibold text-muted-foreground mt-0.5">
              {t("Active Applications")}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-[#1b4332]">2</p>
            <p className="text-xs font-semibold text-muted-foreground mt-0.5">
              {t("Certificates Earned")}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-[#1b4332]">{t("35 hrs")}</p>
            <p className="text-xs font-semibold text-muted-foreground mt-0.5">
              {t("Learning Time")}
            </p>
          </div>
        </div>

        {/* 6 Sample Courses Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#1b4332]">My Learning Courses</h2>
              <p className="text-xs text-muted-foreground">
                {t("Continue learning your active tech & AgriTech modules")}
              </p>
            </div>
            <Link to="/courses" className="text-xs font-bold text-[#2d6a4f] hover:underline">
              Explore All Courses →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {COURSES.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-soft flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex rounded-full bg-emerald-50 text-[#1b4332] px-2.5 py-0.5 text-[10px] font-bold border border-emerald-200">
                      {c.level}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {c.hours} hrs · {c.lessons} lessons
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#1b4332] leading-snug">{c.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {c.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-border/60">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-[#2d6a4f]">{c.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-[#2d6a4f] rounded-full transition-all duration-300"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    to="/courses"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] py-2 text-xs font-black text-white transition shadow-sm"
                  >
                    {c.progress > 0 ? "Continue Learning" : "Start Course"}{" "}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Internship Listings Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#1b4332]">
                {t("Featured Internship Opportunities")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("Apply for tech and research internships")}
              </p>
            </div>
            <Link to="/internships" className="text-xs font-bold text-[#2d6a4f] hover:underline">
              View All Listings →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INTERNSHIPS.slice(0, 4).map((i) => (
              <div
                key={i.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-[#1b4332]">{i.title}</h3>
                    <p className="text-xs font-bold text-[#2d6a4f] mt-0.5">
                      {i.org} · {i.type} ({i.location})
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-50 text-amber-700 px-2.5 py-1 text-[10px] font-extrabold border border-amber-200">
                    {i.stipend}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{i.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {i.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Apply by {i.deadline}
                  </span>
                  <Link
                    to="/internships"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#2d6a4f] hover:text-[#1b4332]"
                  >
                    Apply Now →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}

export function FarmerHomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const HERO_SLIDES = useMemo(
    () => [
      {
        badge: t("SMART FARMING"),
        title: t("Powering Every Acre"),
        subtitle: t(
          "Modern farm machinery helps farmers work smarter, faster and more efficiently.",
        ),
        img: "/hero-tractor.jpg",
        badgeColor: "bg-amber-500/20 text-amber-300",
        linkText: t("Explore Farm Equipment"),
        linkTo: "/marketplace",
        secLinkText: t("Shop Marketplace"),
        secLinkTo: "/marketplace",
      },
      {
        badge: t("HEALTHY SOIL • HEALTHY CROPS"),
        title: t("Nourish Your Soil, Grow Better"),
        subtitle: t(
          "Discover quality fertilizers and crop nutrients designed to support healthy soil and stronger harvests.",
        ),
        img: "/hero-fertilizer.jpg",
        badgeColor: "bg-emerald-500/20 text-emerald-300",
        linkText: t("Shop Fertilizers"),
        linkTo: "/marketplace",
        secLinkText: t("Explore Products"),
        secLinkTo: "/marketplace",
      },
      {
        badge: t("NEXT-GEN AGRICULTURE"),
        title: t("Technology Taking Farming Higher"),
        subtitle: t(
          "Explore modern agricultural technology that helps farmers monitor, protect and manage their crops efficiently.",
        ),
        img: "/hero-drone.jpg",
        badgeColor: "bg-teal-500/20 text-teal-300",
        linkText: t("Explore Agri Technology"),
        linkTo: "/marketplace",
        secLinkText: t("Learn More"),
        secLinkTo: "/learn",
      },
      {
        badge: t("SMART WATER MANAGEMENT"),
        title: t("Every Drop Counts"),
        subtitle: t(
          "Efficient irrigation helps conserve water while keeping crops healthy and productive.",
        ),
        img: "/hero-irrigation.jpg",
        badgeColor: "bg-blue-500/20 text-blue-300",
        linkText: t("Explore Irrigation"),
        linkTo: "/marketplace",
        secLinkText: t("View Farm Tools"),
        secLinkTo: "/marketplace",
      },
      {
        badge: t("FROM FIELD TO FUTURE"),
        title: t("Grow More. Harvest Better."),
        subtitle: t(
          "Everything farmers need — from quality farm inputs and equipment to fresh agricultural products.",
        ),
        img: "/hero-harvest.jpg",
        badgeColor: "bg-amber-500/20 text-amber-300",
        linkText: t("Shop Marketplace"),
        linkTo: "/marketplace",
        secLinkText: t("Explore Farm Inputs"),
        secLinkTo: "/marketplace",
      },
    ],
    [t],
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
        matches.push(customized as Product);
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
  const marqueeProducts = useMemo((): Product[] => {
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
      id: "fruits",
      name: "Fruits",
      img: "/categories/fruits.jpg",
      href: "/category/fruits",
    },
    {
      id: "vegetables",
      name: "Vegetables",
      img: "/categories/vegetables.jpg",
      href: "/category/vegetables",
    },
    {
      id: "seeds",
      name: "Seeds",
      img: "/categories/seeds.jpg",
      href: "/category/seeds",
    },
    {
      id: "fertilizers",
      name: "Fertilizers",
      img: "/categories/fertilizers.jpg",
      href: "/category/fertilizers",
    },
    {
      id: "pesticides",
      name: "Pesticides",
      img: "/categories/pesticides.jpg",
      href: "/category/pesticides",
    },
    {
      id: "farm-tools",
      name: "Farm Tools",
      img: "/categories/farm-tools.jpg",
      href: "/category/farm-tools",
    },
    {
      id: "equipment",
      name: "Equipment",
      img: "/categories/equipment.jpg",
      href: "/category/equipment",
    },
  ];

  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "student", "seller", "admin"]} allowGuest={true}>
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
                { title: t("100% Organic"), desc: t("Healthy & Chemical Free"), icon: Leaf },
                { title: t("Best Quality"), desc: t("Carefully Handpicked"), icon: Award },
                { title: t("Fair Prices"), desc: t("Direct from Farmers"), icon: Scale },
                { title: t("Fast Delivery"), desc: t("Across India"), icon: Truck },
                { title: t("Secure Payments"), desc: t("100% Safe & Secure"), icon: Lock },
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
                  <h2 className="text-xl font-black text-[#1b4332]">{t("Shop by Category")}</h2>
                  <p className="text-xs text-muted-foreground">
                    {t("Certified products and inputs for your crops")}
                  </p>
                </div>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#2d6a4f] hover:text-[#1b4332] transition"
                >
                  {t("View All")} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Grid category cards */}
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4">
                {categoriesList.map((cat, idx) => (
                  <Link
                    key={idx}
                    to={cat.href}
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
                      {t(cat.name)}
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
                    <h2 className="text-xl font-black text-[#1b4332]">
                      {t("Best Deals for You 🔥")}
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-600 px-2 py-0.5 text-[10px] font-black border border-red-100/50 animate-pulse">
                      🔥 {t("Deals ending soon")} · {countdownTime.hours}h {countdownTime.mins}m
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("Handpicked products & inputs on discount")}
                  </p>
                </div>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#2d6a4f] hover:text-[#1b4332] transition group/viewall"
                >
                  {t("View All")}{" "}
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
                <h3 className="text-xl font-black">{t("Stay Updated, Stay Ahead!")}</h3>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  {t(
                    "Get the latest agriculture news, market updates, weather forecasts and expert tips directly on your mobile device.",
                  )}
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
              <div className="shrink-0 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#f7f4ed] border border-white/20 shadow-inner overflow-hidden p-1.5">
                <img
                  src="/images/pure-farm-logo.png"
                  alt="Pure Farm"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Right Column (Widgets) */}
          <div className="space-y-6 lg:sticky lg:top-20">
            {/* Weather Widget */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("Weather Update")}
                </p>
                <Sun className="h-5 w-5 text-amber-500 fill-amber-100" />
              </div>
              <div className="mt-3">
                <p className="text-sm font-black text-[#1b4332]">{t("Rajahmundry, AP")}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-[#1b4332]">28{"\u00B0"}C</span>
                  <span className="text-sm font-bold text-muted-foreground">{t("Sunny")}</span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-b border-border/60 py-3 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      {t("Humidity")}
                    </p>
                    <p className="text-xs font-black text-[#1b4332] mt-0.5">62%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold">{t("Wind")}</p>
                    <p className="text-xs font-black text-[#1b4332] mt-0.5">{t("12 km/h")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold">{t("Rain")}</p>
                    <p className="text-xs font-black text-[#1b4332] mt-0.5">10%</p>
                  </div>
                </div>

                {/* 4-Day Forecast */}
                <div className="mt-4 space-y-2.5">
                  {weatherForecast.map((fc, i) => {
                    const cond = fc.condition.toLowerCase();
                    let IconComponent = Sun;
                    let iconColor = "text-amber-500";
                    if (cond.includes("rain") || cond.includes("shower")) {
                      IconComponent = CloudRain;
                      iconColor = "text-blue-500";
                    } else if (cond.includes("partly")) {
                      IconComponent = CloudSun;
                      iconColor = "text-amber-500";
                    } else if (cond.includes("cloud") || cond.includes("interval")) {
                      IconComponent = Cloud;
                      iconColor = "text-slate-400";
                    }
                    return (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-muted-foreground w-10">
                          {t(fc.day)}
                        </span>
                        <div className="flex items-center justify-center gap-1.5 flex-1">
                          <IconComponent className={`h-3.5 w-3.5 ${iconColor}`} />
                          <span className="text-foreground/80 font-medium">{t(fc.condition)}</span>
                        </div>
                        <span className="font-bold text-[#1b4332] w-12 text-right">{fc.temp}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Today's Market Prices Widget */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t("Market Prices")}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {t("Today's Mandi Feeds")}
                  </p>
                </div>
                <Link
                  to="/market-prices"
                  className="text-xs font-bold text-[#2d6a4f] hover:text-[#1b4332] transition"
                >
                  {t("View All")}
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
                        <p className="text-xs font-black text-[#1b4332]">{t(p.crop)}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {t("Local Area Hub")}
                        </p>
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
                  {t("Govt Schemes")}
                </p>
                <Link
                  to="/schemes"
                  className="text-xs font-bold text-[#2d6a4f] hover:text-[#1b4332] transition"
                >
                  {t("View All")}
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
                        {t(s.name)}
                      </h4>
                      <p className="text-[10px] text-muted-foreground leading-normal mt-0.5 line-clamp-2">
                        {t(s.desc)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Card / Support */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft relative overflow-hidden">
              <p className="text-sm font-black text-[#1b4332]">{t("Need Help?")}</p>
              <p className="mt-1 text-xs text-muted-foreground leading-normal">
                {t("Chat with our support team on WhatsApp for quick farm consulting.")}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100"
                  alt="Support representative"
                  className="h-10 w-10 rounded-full object-cover border border-border"
                />
                <div>
                  <p className="text-xs font-bold text-foreground">Advisor Pooja</p>
                  <p className="text-[10px] text-emerald-600 font-bold">{t("Online Now")}</p>
                </div>
              </div>
              <a
                href={waLink("Hello PureFarm, I need help with my farm.")}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#25d366] hover:bg-[#1ebd55] text-white py-2.5 text-xs font-black shadow-sm transition hover:scale-105 duration-200"
              >
                <MessageCircle className="mr-1.5 h-4 w-4" /> {t("Chat Now")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}

export function normalizeCategoryParam(param?: string | null): Category | "all" {
  if (!param) return "all";
  const p = param.toLowerCase().trim();
  if (p === "all") return "all";
  if (p === "fruits" || p === "fruit") return "fruits";
  if (p === "vegetables" || p === "vegetable" || p === "veggies") return "vegetables";
  if (p === "seeds" || p === "seed") return "seeds";
  if (p === "fertilizers" || p === "fertilizer" || p === "fertilisers" || p === "fertiliser") return "fertilizers";
  if (p === "pesticides" || p === "pesticide" || p === "crop-protection") return "pesticides";
  if (p === "farm-tools" || p === "farm tools" || p === "farm_tools" || p === "tools" || p === "tool") return "farm-tools";
  if (p === "equipment" || p === "equipments" || p === "machinery") return "equipment";
  return "all";
}

export function MarketplacePage() {
  const { language, t } = useTranslation();
  const isTelugu = language === "te";
  const navigate = useNavigate();

  // Read search query parameters reactively from TanStack Router search state
  let searchState: { category?: string; cat?: string; query?: string } = {};
  try {
    searchState = useSearch({ strict: false }) as any;
  } catch {
    // fallback if outside router context
  }

  const routeCategoryParam = searchState?.category || searchState?.cat;
  const routeQueryParam = searchState?.query;

  const [query, setQuery] = useState(() => {
    if (routeQueryParam !== undefined) return routeQueryParam;
    if (typeof window === "undefined") return "";
    return new URL(window.location.href).searchParams.get("query") || "";
  });

  const [category, setCategory] = useState<Category | "all">(() => {
    if (routeCategoryParam !== undefined) return normalizeCategoryParam(routeCategoryParam);
    if (typeof window === "undefined") return "all";
    const sp = new URL(window.location.href).searchParams;
    return normalizeCategoryParam(sp.get("category") || sp.get("cat"));
  });

  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(200000);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Sync category state whenever TanStack Router search state OR window URL search parameters change
  useEffect(() => {
    const syncFromUrl = () => {
      let rawCat: string | null = null;
      let rawQuery: string | null = null;

      if (routeCategoryParam !== undefined) {
        rawCat = routeCategoryParam;
      } else if (typeof window !== "undefined") {
        const sp = new URL(window.location.href).searchParams;
        rawCat = sp.get("category") || sp.get("cat");
      }

      if (routeQueryParam !== undefined) {
        rawQuery = routeQueryParam;
      } else if (typeof window !== "undefined") {
        rawQuery = new URL(window.location.href).searchParams.get("query");
      }

      setCategory(normalizeCategoryParam(rawCat));
      if (rawQuery !== null && rawQuery !== undefined) {
        setQuery(rawQuery);
      }
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [routeCategoryParam, routeQueryParam]);

  const handleCategoryChange = (newCat: Category | "all") => {
    setCategory(newCat);
    if (typeof window !== "undefined") {
      const catObj = CATEGORIES.find((c) => c.id === newCat);
      const catLabel = newCat === "all" ? undefined : (catObj ? catObj.label : newCat);

      try {
        navigate({
          to: "/marketplace",
          search: (prev: any) => ({
            ...(prev || {}),
            category: catLabel,
            cat: undefined,
          }),
          replace: true,
        });
      } catch {
        const url = new URL(window.location.href);
        if (newCat === "all") {
          url.searchParams.delete("category");
          url.searchParams.delete("cat");
        } else {
          url.searchParams.set("category", catLabel || newCat);
        }
        window.history.replaceState({}, "", url.toString());
      }
    }
  };

  const handleClearFilters = () => {
    setQuery("");
    setCategory("all");
    setSort("featured");
    setMaxPrice(200000);
    if (typeof window !== "undefined") {
      try {
        navigate({
          to: "/marketplace",
          search: () => ({}),
          replace: true,
        });
      } catch {
        // fallback
      }
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, "", url.pathname);
    }
  };

  useEffect(() => {
    async function loadMarketplaceProducts() {
      setLoadingProducts(true);
      try {
        const data = await getProducts();
        const mapped: Product[] = data.map((p) => ({
          id: p.id,
          name: p.name,
          category: (p.category as Category) || "other",
          description: p.description || "",
          price: p.price,
          unit: p.unit,
          stock: p.available_quantity,
          image:
            p.image_url ||
            "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600",
          rating: p.rating || 4.5,
          brand: p.location ? `Farmer (${p.location})` : "PureFarm Direct",
          ...(p.badge ? { badge: p.badge as any } : {}),
        }));
        setDbProducts(mapped);
      } catch (err) {
        console.error("Error loading marketplace products:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadMarketplaceProducts();
  }, []);

  const allProducts = dbProducts.length > 0 ? dbProducts : PRODUCTS;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const next = allProducts.filter((product) => {
      const locationText = (product as any).location || "";
      const searchableText = `${product.name} ${product.category} ${product.brand || ""} ${product.description || ""} ${locationText}`.toLowerCase();
      const matchesQuery = !q || searchableText.includes(q);

      const normProductCat = normalizeCategoryParam(product.category);
      const matchesCat = category === "all" || normProductCat === category;

      return (
        matchesQuery &&
        matchesCat &&
        product.price <= maxPrice
      );
    });

    return next.sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      if (sort === "newest") {
        const numA = parseInt(a.id.replace(/\D/g, ""), 10) || 0;
        const numB = parseInt(b.id.replace(/\D/g, ""), 10) || 0;
        return numB - numA;
      }
      return Number(Boolean(b.badge)) - Number(Boolean(a.badge));
    });
  }, [allProducts, category, maxPrice, query, sort]);

  const hasActiveFilters = query.trim() !== "" || category !== "all" || maxPrice < 200000 || sort !== "featured";

  return (
    <RoleGuard allowedRoles={["buyer", "farmer", "admin"]} allowGuest={true}>
      <PageShell
        eyebrow={t("Marketplace")}
        title={t("Farm input marketplace")}
        intro={t(
          "Browse our full 143-product verified agricultural catalogue. Search crops, seeds, fertilisers or machinery, filter categories, compare prices, and order direct.",
        )}
      >
        <div className="mb-6 grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft lg:grid-cols-[1fr_12rem_12rem_14rem]">
          <label className="relative block">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#2d6a4f]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Search seeds, fertiliser, tools, location...")}
              className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
            />
          </label>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value as Category | "all")}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {t(cat.label)}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
          >
            <option value="featured">{t("Featured first")}</option>
            <option value="rating">{t("Top rated")}</option>
            <option value="price-low">{t("Price low to high")}</option>
            <option value="price-high">{t("Price high to low")}</option>
            <option value="newest">{t("Newest first")}</option>
            <option value="name-asc">{t("Name: A to Z")}</option>
          </select>
          <label className="flex items-center gap-3 text-sm">
            <Filter className="h-4 w-4 text-primary" />
            <span className="shrink-0">{t("Max")}</span>
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

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-bold text-[#1b4332]">
            {isTelugu
              ? `${filtered.length} ఉత్పత్తులు కనుగొనబడ్డాయి`
              : category === "all"
              ? `${filtered.length} products found`
              : `${filtered.length} ${CATEGORIES.find((c) => c.id === category)?.label || category} products found`}
          </p>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>✕</span> {t("Clear All Filters")}
            </button>
          )}
        </div>

        {filtered.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-12 text-center max-w-xl mx-auto my-8 space-y-4">
            <Filter className="h-12 w-12 text-[#087F5B] mx-auto opacity-80" />
            <h3 className="text-xl font-bold text-[#073B2A]">{t("No matching products found")}</h3>
            <p className="text-sm text-emerald-800/80">
              {t("Try clearing your search query, selecting another category, or adjusting your price limit.")}
            </p>
            <button
              onClick={handleClearFilters}
              className="px-5 py-2.5 rounded-xl bg-[#087F5B] text-white font-bold text-xs shadow-md transition"
            >
              {t("Clear All Filters")}
            </button>
          </div>
        )}
      </PageShell>
    </RoleGuard>
  );
}

export const CATEGORY_DETAILS: Record<
  Category,
  { title: string; subtitle: string; teTitle: string; teSubtitle: string }
> = {
  fruits: {
    title: "Fruits",
    subtitle: "Fresh fruits and fruit-related products for your farm and home",
    teTitle: "పండ్లు",
    teSubtitle: "మీ తోట మరియు ఇంటికి తాజా పండ్లు మరియు ఉత్పత్తులు",
  },
  vegetables: {
    title: "Vegetables",
    subtitle: "Fresh vegetables and produce for your daily farming and household needs",
    teTitle: "కూరగాయలు",
    teSubtitle: "తాజా కూరగాయలు మరియు కూరగాయల సాగు ఉత్పత్తులు",
  },
  seeds: {
    title: "Seeds",
    subtitle: "Quality seeds and planting materials for better crop production",
    teTitle: "విత్తనాలు",
    teSubtitle: "అధిక దిగుబడినిచ్చే ప్రమాణిక విత్తనాలు మరియు హైబ్రిడ్ రకాలు",
  },
  fertilizers: {
    title: "Fertilizers",
    subtitle: "Fertilizers and nutrients to support healthy soil and stronger crops",
    teTitle: "ఎరువులు",
    teSubtitle: "భూమిసారం మరియు దిగుబడి పెంపొందించే సేంద్రీయ ఎరువులు",
  },
  pesticides: {
    title: "Pesticides",
    subtitle: "Crop protection products to help manage pests, diseases, and weeds",
    teTitle: "పురుగుమందులు",
    teSubtitle: "పంట సంరక్షణ, కీటక నాశినులు మరియు తెగుళ్ల నివారణ ఉత్పత్తులు",
  },
  "farm-tools": {
    title: "Farm Tools",
    subtitle: "Essential tools for planting, cultivation, maintenance, and harvesting",
    teTitle: "వ్యవసాయ పరికరాలు",
    teSubtitle: "అవసరమైన చేతి వ్యవసాయ పరికరాలు మరియు క్షేత్ర సామగ్రి",
  },
  equipment: {
    title: "Equipment",
    subtitle: "Farm machinery and equipment to make agricultural work easier and more efficient",
    teTitle: "యంత్రాలు & సామగ్రి",
    teSubtitle: "ట్రాక్టర్లు, హార్వెస్టర్లు, పంపులు మరియు నీటి పారుదల పరికరాలు",
  },
  tools: {
    title: "Farm Tools",
    subtitle: "Essential farming tools and equipment",
    teTitle: "వ్యవసాయ పరికరాలు",
    teSubtitle: "అవసరమైన వ్యవసాయ పరికరాలు",
  },
  grains: { title: "Grains", subtitle: "Quality grains", teTitle: "ధాన్యాలు", teSubtitle: "నాణ్యమైన ధాన్యాలు" },
  pulses: { title: "Pulses", subtitle: "Quality pulses", teTitle: "పప్పుధాన్యాలు", teSubtitle: "నాణ్యమైన పప్పుధాన్యాలు" },
  oilseeds: { title: "Oilseeds", subtitle: "Quality oilseeds", teTitle: "నూనెగింజలు", teSubtitle: "నాణ్యమైన నూనెగింజలు" },
  spices: { title: "Spices", subtitle: "Quality spices", teTitle: "మసాలా దినుసులు", teSubtitle: "నాణ్యమైన మసాలా దినుసులు" },
  other: { title: "Farm Inputs", subtitle: "Quality farm inputs", teTitle: "వ్యవసాయ ఉత్పత్తులు", teSubtitle: "నాణ్యమైన ఉత్పత్తులు" },
};

export function CategoryProductsPage({ categorySlug }: { categorySlug: string }) {
  const { language, t } = useTranslation();
  const isTelugu = language === "te";
  const canonicalCategory = normalizeCategoryParam(categorySlug);
  
  const catKey = canonicalCategory === "all" ? "fruits" : canonicalCategory;
  const info = CATEGORY_DETAILS[catKey as Category] || CATEGORY_DETAILS.fruits;

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(200000);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    async function loadCategoryProducts() {
      setLoadingProducts(true);
      try {
        const data = await getProducts();
        const mapped: Product[] = data.map((p) => ({
          id: p.id,
          name: p.name,
          category: (p.category as Category) || "other",
          description: p.description || "",
          price: p.price,
          unit: p.unit,
          stock: p.available_quantity,
          image:
            p.image_url ||
            "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600",
          rating: p.rating || 4.5,
          brand: p.location ? `Farmer (${p.location})` : "PureFarm Direct",
          ...(p.badge ? { badge: p.badge as any } : {}),
        }));
        setDbProducts(mapped);
      } catch (err) {
        console.error("Error loading category products:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadCategoryProducts();
  }, []);

  const allProducts = dbProducts.length > 0 ? dbProducts : PRODUCTS;

  // Filter ONLY products in this specific category
  const categoryProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const normCat = normalizeCategoryParam(product.category);
      return normCat === canonicalCategory;
    });
  }, [allProducts, canonicalCategory]);

  // Further filter within category by search query & maxPrice, then sort
  const filtered = useMemo(() => {
    const next = categoryProducts.filter((product) => {
      const matchesQuery = `${product.name} ${product.brand} ${product.description}`
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesQuery && product.price <= maxPrice;
    });

    return next.sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return Number(Boolean(b.badge)) - Number(Boolean(a.badge));
    });
  }, [categoryProducts, maxPrice, query, sort]);

  const displayTitle = isTelugu ? info.teTitle : info.title;
  const displaySubtitle = isTelugu ? info.teSubtitle : info.subtitle;

  return (
    <RoleGuard allowedRoles={["buyer", "farmer", "admin", "student", "seller"]} allowGuest={true}>
      <PageShell
        eyebrow={t("Category Catalogue")}
        title={t(displayTitle)}
        intro={t(displaySubtitle)}
      >
        <div className="mb-6 grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft lg:grid-cols-[1fr_12rem_14rem]">
          <label className="relative block">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#2d6a4f]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`${t("Search within")} ${t(displayTitle)}...`}
              className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
            />
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
          >
            <option value="featured">{t("Featured first")}</option>
            <option value="rating">{t("Top rated")}</option>
            <option value="price-low">{t("Price low to high")}</option>
            <option value="price-high">{t("Price high to low")}</option>
          </select>
          <label className="flex items-center gap-3 text-sm">
            <Filter className="h-4 w-4 text-primary" />
            <span className="shrink-0">{t("Max")}</span>
            <input
              type="range"
              min="100"
              max="200000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="min-w-0 flex-1"
            />
            <span className="w-16 text-right font-bold">{formatRupees(maxPrice)}</span>
          </label>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-bold text-[#1b4332]">
            {isTelugu
              ? `${filtered.length} ${displayTitle} ఉత్పత్తులు కనుగొనబడ్డాయి`
              : `${filtered.length} ${displayTitle} products found`}
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#2d6a4f] hover:underline"
          >
            {t("View All Categories")} →
          </Link>
        </div>

        {filtered.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={t("No matching products")}
            body={t("No products found matching your search within this category.")}
          />
        )}
      </PageShell>
    </RoleGuard>
  );
}

export function ProductDetailPage({ id }: { id: string }) {
  const { t } = useTranslation();
  const product = getProduct(id);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showCartSuccessToast, showToast } = useToast();
  const navigate = useNavigate();

  if (!product) {
    return (
      <RoleGuard allowedRoles={["buyer", "farmer", "admin"]}>
        <PageShell
          title={t("Product not found")}
          intro={t("This product ID does not match the current PureFarm catalogue.")}
        >
          <EmptyState
            title={t("Invalid product")}
            body={t("Return to the marketplace to find active products.")}
            action={
              <Link
                to="/marketplace"
                className="rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground"
              >
                {t("Browse Marketplace")}
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

  const activeWishlist = isInWishlist(product.id);

  return (
    <RoleGuard allowedRoles={["buyer", "farmer", "admin"]}>
      <PageShell
        eyebrow={t(product.category)}
        title={t(product.name)}
        intro={t(product.description)}
      >
        <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <img
            src={product.image}
            alt={product.name}
            className="h-80 w-full rounded-2xl object-cover shadow-soft lg:h-[32rem]"
          />
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                  {t(product.brand)}
                </span>
                {product.badge ? (
                  <span className="rounded-lg bg-amber-50 border border-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                    {t(product.badge)}
                  </span>
                ) : null}
                <span className="rounded-lg bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
                  {product.rating} ★ {t("rating")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 rounded-xl flex items-center gap-1.5 transition border cursor-pointer ${
                  activeWishlist
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:text-red-500"
                }`}
                aria-label={activeWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`h-4.5 w-4.5 ${activeWishlist ? "fill-red-500 text-red-500" : ""}`} />
                <span className="text-xs font-bold">
                  {activeWishlist ? t("Saved in Wishlist") : t("Save to Wishlist")}
                </span>
              </button>
            </div>
            <p className="text-4xl font-black text-[#1b4332]">
              {formatRupees(product.price)}{" "}
              <span className="text-base font-semibold text-muted-foreground">/{product.unit}</span>
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [
                  t("Availability"),
                  product.stock > 0 ? `${product.stock} ${t("units ready")}` : t("Out of Stock"),
                ],
                [t("Seller"), t(product.brand)],
                [t("Category"), t(product.category)],
                [t("Delivery"), t("Local hub dispatch in 1-3 days")],
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
                disabled={product.stock <= 0}
                onClick={() => {
                  const res = addItem(product.id, qty, {
                    name: product.name,
                    price: product.price,
                    unit: product.unit,
                    imageUrl: product.image,
                    farmerId: (product as any).farmer_id,
                    availableQuantity: product.stock,
                  });
                  if (res.success) {
                    showCartSuccessToast(product.name, product.image);
                  } else {
                    showToast({
                      type: "error",
                      title: t("Unable to Add to Cart"),
                      message: res.message || t("Product is currently unavailable."),
                    });
                  }
                }}
                className="rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white px-6 py-3 font-black text-sm shadow-sm transition hover:scale-105 duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock <= 0 ? t("Out of Stock") : t("Add to Cart")}
              </button>
              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={() => {
                  const res = addItem(product.id, qty, {
                    name: product.name,
                    price: product.price,
                    unit: product.unit,
                    imageUrl: product.image,
                    farmerId: (product as any).farmer_id,
                    availableQuantity: product.stock,
                  });
                  if (res.success) {
                    showCartSuccessToast(product.name, product.image);
                    void navigate({ to: "/order" });
                  } else {
                    showToast({
                      type: "error",
                      title: t("Unable to Add to Cart"),
                      message: res.message || t("Product is currently unavailable."),
                    });
                  }
                }}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 font-black text-sm shadow-sm transition hover:scale-105 duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("Buy now")}
              </button>
            </div>
          </div>
        </div>
        <h2 className="mt-12 text-2xl font-black">{t("Related products")}</h2>
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
  const { t } = useTranslation();
  const { items, subtotal, updateQty, removeItem, syncCartWithDatabase } = useCart();
  const rows = getCartProducts(items);
  const [stockWarning, setStockWarning] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    async function initCartSync() {
      setSyncing(true);
      const { warnings } = await syncCartWithDatabase();
      if (warnings && warnings.length > 0) {
        setStockWarning(warnings.join(" "));
      }
      setSyncing(false);
    }
    initCartSync();
  }, []);

  const hasSoldOutItem = useMemo(() => {
    return items.some(
      (i) => i.isSoldOut || (i.availableQuantity !== undefined && i.availableQuantity <= 0),
    );
  }, [items]);

  const handleQtyChange = (
    productId: string,
    currentQty: number,
    delta: number,
    availStock?: number,
  ) => {
    setStockWarning(null);
    const newQty = currentQty + delta;
    const res = updateQty(productId, newQty, availStock);
    if (!res.success && res.message) {
      setStockWarning(res.message);
    }
  };

  return (
    <RoleGuard allowedRoles={["buyer", "farmer", "admin"]}>
      <PageShell
        eyebrow={t("Shopping Cart")}
        title={t("Your Cart & Produce Items")}
        intro={t("Review your items and selected quantities before proceeding to checkout.")}
      >
        {stockWarning && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold flex items-center justify-between">
            <span>⚠️ {stockWarning}</span>
            <button
              onClick={() => setStockWarning(null)}
              className="text-xs font-bold text-amber-900 underline"
            >
              {t("Dismiss")}
            </button>
          </div>
        )}

        {rows.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
            <div className="space-y-4">
              {rows.map(({ product, qty, cartItem }) => {
                const availStock = cartItem?.availableQuantity ?? product.stock;
                const unitPrice = cartItem?.price ?? product.price;

                return (
                  <div
                    key={product.id}
                    className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:grid-cols-[7rem_1fr_auto] items-center"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = NEUTRAL_PRODUCT_FALLBACK;
                      }}
                      className="h-24 w-full rounded-xl object-cover bg-muted"
                    />
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{t(product.name)}</h3>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">
                        {formatRupees(unitPrice)} / {product.unit}
                      </p>
                      {availStock !== undefined && (
                        <p className="mt-1 text-xs font-medium text-emerald-700">
                          {t("Stock Available")}: {availStock} {product.unit}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> {t("Remove Item")}
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <div className="inline-flex items-center rounded-xl border bg-background shadow-sm">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(product.id, qty, -1, availStock)}
                          className="h-9 w-9 flex items-center justify-center font-bold hover:bg-muted transition rounded-l-xl"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-10 text-center font-black text-sm">{qty}</span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(product.id, qty, 1, availStock)}
                          className="h-9 w-9 flex items-center justify-center font-bold hover:bg-muted transition rounded-r-xl"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="font-black text-lg text-[#087F5B]">
                        {formatRupees(unitPrice * qty)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Box */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm h-fit space-y-4">
              <h3 className="text-lg font-bold text-foreground">{t("Order Summary")}</h3>
              <div className="space-y-3 text-sm border-t pt-4">
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>
                    {t("Subtotal")} ({items.reduce((s, i) => s + i.qty, 0)} items)
                  </span>
                  <span className="font-bold text-foreground">{formatRupees(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>{t("Delivery Fee")}</span>
                  <span className="font-bold text-emerald-600">{t("FREE")}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-black text-foreground">
                  <span>{t("Total Amount")}</span>
                  <span className="text-[#087F5B]">{formatRupees(subtotal)}</span>
                </div>
              </div>

              {hasSoldOutItem ? (
                <div className="w-full mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold text-center">
                  {t("Some items in your cart are sold out. Remove them to proceed.")}
                </div>
              ) : null}

              <Link
                to="/order"
                onClick={(e) => {
                  if (hasSoldOutItem) e.preventDefault();
                }}
                className={`w-full mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-center font-bold text-white shadow-md transition ${
                  hasSoldOutItem
                    ? "bg-gray-400 cursor-not-allowed opacity-60"
                    : "bg-[#087F5B] hover:bg-[#073B2A]"
                }`}
              >
                {t("Proceed to Checkout")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-12 text-center max-w-xl mx-auto my-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#087F5B] flex items-center justify-center mx-auto mb-2">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-[#073B2A]">{t("Your cart is empty.")}</h3>
            <p className="text-sm text-emerald-800/80 leading-relaxed">
              {t("Add farm produce from the marketplace to get started with direct purchasing.")}
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#087F5B] hover:bg-[#073B2A] text-white font-bold text-sm shadow-md transition"
            >
              {t("Browse Marketplace")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </PageShell>
    </RoleGuard>
  );
}

export function WishlistPage() {
  const { t } = useTranslation();
  const { items, wishlistCount, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const { showCartSuccessToast, showToast } = useToast();

  // Retrieve products for all wishlist items (merging static data if present or fallback to stored details)
  const wishlistProducts = useMemo(() => {
    return items.map((item) => {
      const staticProduct = getProduct(item.id);
      if (staticProduct) {
        return {
          ...staticProduct,
          stock: item.stock !== undefined ? item.stock : staticProduct.stock,
        };
      }
      return {
        id: item.id,
        name: item.name || "Produce Item",
        brand: item.brand || "PureFarm Direct",
        category: (item.category || "vegetables") as Category,
        unit: item.unit || "kg",
        price: item.price || 0,
        rating: 4.8,
        stock: item.stock !== undefined ? item.stock : 99,
        description: item.description || "Saved produce item from PureFarm marketplace.",
        image: item.image || NEUTRAL_PRODUCT_FALLBACK,
      };
    });
  }, [items]);

  return (
    <RoleGuard allowedRoles={["buyer", "farmer", "student", "seller", "admin"]} allowGuest={true}>
      <PageShell
        eyebrow={t("Saved Products")}
        title={t("My Wishlist")}
        intro={t("Manage products you've saved for later or quick purchase.")}
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            <h2 className="text-xl font-black text-[#1b4332]">{t("Wishlist Items")}</h2>
            <span className="ml-1 rounded-full bg-red-100 text-red-700 px-3 py-0.5 text-xs font-bold border border-red-200">
              {wishlistCount} {t("Items")}
            </span>
          </div>

          {wishlistCount > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 transition cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              {t("Clear Wishlist")}
            </button>
          )}
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="rounded-2xl border border-white/60 bg-white/85 backdrop-blur-md p-12 text-center space-y-4 max-w-md mx-auto shadow-soft my-8">
            <div className="h-16 w-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto border border-red-100 shadow-xs">
              <Heart className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-[#1b4332]">{t("Your Wishlist is Empty")}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("You haven't saved any items to your wishlist yet. Explore our marketplace to find fresh produce, high-quality seeds, fertilizers, and modern farm tools.")}
            </p>
            <div className="pt-2">
              <Link
                to="/marketplace"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[#145A43] hover:bg-[#0D3B2E] text-white text-xs font-black transition shadow-md cursor-pointer"
              >
                <Store className="h-4 w-4" />
                {t("Browse Marketplace")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlistProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-white/70 bg-white/90 backdrop-blur-md p-4 shadow-soft flex flex-col justify-between space-y-3 hover:shadow-md transition group"
              >
                <div className="space-y-3">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
                    <Link to="/product/$id" params={{ id: product.id }} className="block h-full w-full">
                      <img
                        src={product.image}
                        alt={product.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = NEUTRAL_PRODUCT_FALLBACK;
                        }}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute right-2.5 top-2.5 p-1.5 rounded-full bg-white/90 text-slate-400 hover:text-red-500 hover:bg-white transition shadow-xs cursor-pointer"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <span className="absolute left-2.5 top-2.5 rounded-md bg-emerald-700 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                      {t(product.category)}
                    </span>
                  </div>

                  <div>
                    <Link
                      to="/product/$id"
                      params={{ id: product.id }}
                      className="font-black text-sm text-[#1b4332] hover:text-[#2d6a4f] transition line-clamp-2 leading-snug"
                    >
                      {t(product.name)}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground font-semibold">
                      {product.brand}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-[#145A43]">
                      ₹{product.price} <span className="text-xs font-normal text-muted-foreground">/{product.unit}</span>
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        product.stock > 0
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                      }`}
                    >
                      {product.stock > 0 ? `${product.stock} ${t("in stock")}` : t("Out of stock")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(product.id)}
                      className="h-10 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                      {t("Remove")}
                    </button>

                    <button
                      type="button"
                      disabled={product.stock <= 0}
                      onClick={() => {
                        const res = addItem(product.id, 1, {
                          name: product.name,
                          price: product.price,
                          unit: product.unit,
                          imageUrl: product.image,
                          farmerId: (product as any).farmer_id,
                          availableQuantity: product.stock,
                        });
                        if (res.success) {
                          showCartSuccessToast(product.name, product.image);
                        } else {
                          showToast({
                            type: "error",
                            title: t("Unable to Add to Cart"),
                            message: res.message || t("Product is currently unavailable."),
                          });
                        }
                      }}
                      className="h-10 rounded-xl bg-[#145A43] hover:bg-[#0D3B2E] text-white text-xs font-black transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      {t("Add to Cart")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageShell>
    </RoleGuard>
  );
}

export function OrderPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { items, subtotal, clearCart, syncCartWithDatabase } = useCart();
  const rows = getCartProducts(items);

  const [activeTab, setActiveTab] = useState<"checkout" | "my_orders">(
    items.length > 0 ? "checkout" : "my_orders",
  );
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  // Buyer Form State
  const [buyerName, setBuyerName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [deliveryLocation, setDeliveryLocation] = useState(
    user?.location || "Rajahmundry, Andhra Pradesh",
  );
  const [notes, setNotes] = useState("");

  // My Orders State
  const [buyerOrders, setBuyerOrders] = useState<OrderWithItems[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchBuyerOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const data = await getOrdersByBuyer(user.id);
      setBuyerOrders(data);
    } catch (err: any) {
      console.error("Failed to load buyer orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user && (activeTab === "my_orders" || orderSuccess)) {
      fetchBuyerOrders();
    }
  }, [user, activeTab, orderSuccess]);

  const handlePlaceOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);

    if (!user) {
      setOrderError("Please sign in to place an order.");
      return;
    }

    if (rows.length === 0) {
      setOrderError("Your cart is empty. Please add products before placing an order.");
      return;
    }

    if (!deliveryLocation.trim()) {
      setOrderError("Delivery location address is required.");
      return;
    }

    setSubmitting(true);

    try {
      const { warnings } = await syncCartWithDatabase();
      if (warnings && warnings.length > 0) {
        setOrderError(warnings.join(" ") + " Please review your cart before placing the order.");
        setSubmitting(false);
        return;
      }

      const hasSoldOut = items.some(
        (i) => i.isSoldOut || (i.availableQuantity !== undefined && i.availableQuantity <= 0),
      );
      if (hasSoldOut) {
        setOrderError("One or more items in your cart are sold out or unavailable.");
        setSubmitting(false);
        return;
      }

      const orderPayloadItems = items.map((item) => ({
        productId: item.productId,
        qty: item.qty,
      }));

      await createRealBuyerOrder({
        buyer_id: user.id,
        delivery_location: deliveryLocation.trim(),
        notes: notes.trim() || null,
        items: orderPayloadItems,
      });

      clearCart();
      setOrderSuccess(true);
      setActiveTab("my_orders");
      await fetchBuyerOrders();
    } catch (err: any) {
      console.error("Order placement error:", err);
      setOrderError(err.message || "Failed to place order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["buyer", "farmer", "admin"]}>
      <PageShell
        eyebrow="Order Console"
        title={activeTab === "checkout" ? "Checkout & Place Order" : "My Orders"}
        intro={
          activeTab === "checkout"
            ? "Confirm delivery location and place your direct farmer produce order."
            : "Track your past purchases, order statuses, and delivery details."
        }
      >
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 mb-8 border-b pb-4">
          <button
            onClick={() => setActiveTab("checkout")}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
              activeTab === "checkout"
                ? "bg-[#087F5B] text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Checkout ({rows.length})
          </button>
          <button
            onClick={() => setActiveTab("my_orders")}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
              activeTab === "my_orders"
                ? "bg-[#087F5B] text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            My Orders ({buyerOrders.length})
          </button>
        </div>

        {activeTab === "checkout" ? (
          <div>
            {orderError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold">
                ⚠️ {orderError}
              </div>
            )}

            {rows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-12 text-center max-w-xl mx-auto my-8 space-y-4">
                <ShoppingBag className="h-12 w-12 text-[#087F5B] mx-auto mb-2" />
                <h3 className="text-xl font-bold text-[#073B2A]">Your cart is empty.</h3>
                <p className="text-sm text-emerald-800/80">
                  {t("Add products to the cart before checking out.")}
                </p>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#087F5B] text-white font-bold text-sm shadow-md"
                >
                  {t("Start Shopping")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
                {/* Delivery & Contact Details Form */}
                <form
                  onSubmit={handlePlaceOrderSubmit}
                  className="rounded-2xl border bg-card p-6 shadow-sm space-y-4"
                >
                  <h3 className="text-lg font-bold text-foreground">
                    {t("Delivery & Contact Information")}
                  </h3>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      {t("Full Name")}
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      {t("Delivery Location / Address *")}
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      placeholder="Village/City, Landmark, District, State, Pincode"
                      className="w-full p-3 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      {t("Order Notes (Optional)")}
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special delivery instructions, timing, etc."
                      className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
                    />
                  </div>

                  {/* Payment Disclaimer */}
                  <div className="p-4 rounded-xl bg-muted border text-xs text-muted-foreground space-y-1">
                    <p className="font-bold text-foreground">{t("Payment Method")}</p>
                    <p>
                      💳 <strong>Payment integration coming soon (Cash on Delivery)</strong>
                    </p>
                    <p className="text-xs">
                      {t(
                        "No online payment is processed today. Pay cash or UPI upon crop inspection & delivery.",
                      )}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-xl bg-[#087F5B] hover:bg-[#073B2A] text-white font-bold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? "Placing Order..." : "Place Order Now"}
                  </button>
                </form>

                {/* Order Summary Sidebar */}
                <div className="rounded-2xl border bg-card p-6 shadow-sm h-fit space-y-4">
                  <h3 className="text-lg font-bold text-foreground">Order Items ({rows.length})</h3>

                  <div className="space-y-3 divide-y">
                    {rows.map(({ product, qty, cartItem }) => {
                      const price = cartItem?.price ?? product.price;
                      return (
                        <div
                          key={product.id}
                          className="pt-3 first:pt-0 flex items-center justify-between text-sm"
                        >
                          <div>
                            <p className="font-bold text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {qty} {product.unit} × {formatRupees(price)}
                            </p>
                          </div>
                          <span className="font-bold text-foreground">
                            {formatRupees(price * qty)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground font-medium">
                      <span>{t("Subtotal")}</span>
                      <span className="font-bold text-foreground">{formatRupees(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground font-medium">
                      <span>Delivery</span>
                      <span className="font-bold text-emerald-600">{t("FREE")}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg font-black text-foreground">
                      <span>Total</span>
                      <span className="text-[#087F5B]">{formatRupees(subtotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* My Orders View */
          <div>
            {loadingOrders ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className="rounded-2xl border p-6 bg-card animate-pulse space-y-3">
                    <div className="h-5 bg-muted rounded w-1/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : buyerOrders.length === 0 ? (
              /* Empty My Orders State */
              <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-12 text-center max-w-xl mx-auto my-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#087F5B] flex items-center justify-center mx-auto mb-2">
                  <Package className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[#073B2A]">
                  {t("You haven't placed any orders yet.")}
                </h3>
                <p className="text-sm text-emerald-800/80 leading-relaxed">
                  Explore fresh produce from local farmers across India and place your first direct
                  order.
                </p>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#087F5B] hover:bg-[#073B2A] text-white font-bold text-sm shadow-md transition"
                >
                  {t("Start Shopping")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              /* Orders List */
              <div className="space-y-6">
                {buyerOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border bg-card p-6 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-lg text-foreground">
                            Order #PF-{order.id.substring(0, 8).toUpperCase()}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Placed on{" "}
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            dateStyle: "medium",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block font-medium">
                          {t("Total Amount")}
                        </span>
                        <span className="text-xl font-black text-[#087F5B]">
                          {formatRupees(order.total_amount)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.order_items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm py-1"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#087F5B] flex items-center justify-center font-bold text-xs">
                              📦
                            </div>
                            <div>
                              <p className="font-bold text-foreground">
                                {item.products?.name || "Farm Produce"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.quantity} {item.products?.unit || "units"} ×{" "}
                                {formatRupees(item.unit_price)}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-foreground">
                            {formatRupees(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Location */}
                    <div className="pt-3 border-t flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-[#087F5B]" />
                      <span>
                        {t("Delivery Location:")}
                        <strong>{order.delivery_location}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </PageShell>
    </RoleGuard>
  );
}
function getCropIcon(cropName: string): string {
  if (!cropName) return "🌱";
  const name = cropName.toLowerCase();
  if (name.includes("chilli")) return "🌶️";
  if (name.includes("turmeric")) return "🟡";
  if (name.includes("cotton")) return "☁️";
  if (name.includes("paddy") || name.includes("rice")) return "🌾";
  if (name.includes("wheat")) return "🌾";
  if (name.includes("maize") || name.includes("corn")) return "🌽";
  if (name.includes("onion")) return "🧅";
  if (name.includes("potato")) return "🥔";
  if (name.includes("tomato")) return "🍅";
  if (name.includes("groundnut") || name.includes("peanut")) return "🥜";
  if (name.includes("sweet lemon") || name.includes("mosambi")) return "🍊";
  if (name.includes("lemon")) return "🍋";
  if (name.includes("mango")) return "🥭";
  if (name.includes("pomegranate")) return "🍎";
  if (name.includes("banana")) return "🍌";
  if (name.includes("soybean")) return "🫘";
  if (name.includes("gram") || name.includes("pulse") || name.includes("dal")) return "🫘";
  if (name.includes("mustard")) return "🌼";
  return "🌱";
}

export function MarketPage() {
  const { t } = useTranslation();
  const [dbRecords, setDbRecords] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Filter & Search Controls
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [cropFilter, setCropFilter] = useState("all");
  const [marketFilter, setMarketFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"recently_updated" | "price_low_high" | "price_high_low" | "crop_asc" | "market_asc">("recently_updated");

  // Detail Modal
  const [selectedDetailItem, setSelectedDetailItem] = useState<MarketPrice | null>(null);

  const fetchPrices = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      if (isManualRefresh) {
        await syncLiveMarketPrices({});
      }
      const data = await getMarketPrices({
        state: stateFilter,
        cropName: cropFilter,
        marketName: marketFilter,
        sortOrder: sortOrder,
        search: search,
      });
      setDbRecords(data);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (isManualRefresh) {
        setRefreshToast("Mandi prices successfully updated from AGMARKNET!");
        setTimeout(() => setRefreshToast(null), 4000);
      }
    } catch (err: any) {
      console.error("Failed to load market prices:", err);
      setError(err.message || "Unable to load live mandi prices.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [stateFilter, cropFilter, marketFilter, sortOrder]);

  // Derived filter dropdown options from total records
  const cropsList = useMemo(() => {
    const crops = new Set<string>();
    INITIAL_AGMARKNET_PRICES.forEach(r => crops.add(r.crop_name));
    dbRecords.forEach(r => crops.add(r.crop_name));
    return ["all", ...Array.from(crops).sort()];
  }, [dbRecords]);

  const marketsList = useMemo(() => {
    const markets = new Set<string>();
    INITIAL_AGMARKNET_PRICES.forEach(r => markets.add(r.market_name));
    dbRecords.forEach(r => markets.add(r.market_name));
    return ["all", ...Array.from(markets).sort()];
  }, [dbRecords]);

  // Live client filtered records
  const filteredRecords = useMemo(() => {
    return dbRecords.filter((r) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        r.crop_name.toLowerCase().includes(q) ||
        r.market_name.toLowerCase().includes(q) ||
        (r.location && r.location.toLowerCase().includes(q)) ||
        (r.state && r.state.toLowerCase().includes(q));

      const matchState =
        stateFilter === "all" || r.state.toLowerCase() === stateFilter.toLowerCase();
      const matchCrop =
        cropFilter === "all" || r.crop_name.toLowerCase() === cropFilter.toLowerCase();
      const matchMarket =
        marketFilter === "all" || r.market_name.toLowerCase() === marketFilter.toLowerCase();

      return matchSearch && matchState && matchCrop && matchMarket;
    });
  }, [dbRecords, search, stateFilter, cropFilter, marketFilter]);

  const apCount = useMemo(() => filteredRecords.filter(r => r.state === "Andhra Pradesh").length, [filteredRecords]);
  const tsCount = useMemo(() => filteredRecords.filter(r => r.state === "Telangana").length, [filteredRecords]);

  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "admin", "student", "seller"]} allowGuest={true}>
      <div className="min-h-screen bg-[#f3f9f5] p-4 sm:p-6 lg:p-8 relative">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* HERO BANNER */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#dcfce7] via-[#f0fdf4] to-[#ecfdf5] border border-emerald-200/80 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4 z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center text-emerald-800 shrink-0 shadow-inner">
                <BarChart2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-3 py-0.5 text-xs font-bold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
                    AGMARKNET Live Feeds
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 text-[11px] font-bold">
                    Andhra Pradesh & Telangana
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] tracking-tight">
                  {t("Market Prices")}
                </h1>
                <p className="text-xs sm:text-sm font-medium text-[#047857] mt-0.5">
                  {t("Authentic daily wholesale mandi prices across AP & Telangana districts")}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 z-10 w-full md:w-auto justify-end">
              <div className="text-xs text-emerald-900 font-semibold bg-emerald-100/60 border border-emerald-200 rounded-xl px-3 py-1.5 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <span>Last updated: {lastSyncTime}</span>
              </div>

              <button
                onClick={() => fetchPrices(true)}
                disabled={isRefreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white px-4 py-2.5 text-xs font-extrabold transition-all shadow-sm active:scale-95 disabled:opacity-70 cursor-pointer w-full sm:w-auto"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? t("Updating Prices...") : t("Refresh Prices")}
              </button>
            </div>
          </div>

          {/* Toast Alert */}
          {refreshToast && (
            <div className="rounded-2xl bg-emerald-600 text-white px-4 py-3 text-xs font-bold flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>{refreshToast}</span>
              </div>
              <button onClick={() => setRefreshToast(null)} className="text-emerald-100 hover:text-white font-bold">✕</button>
            </div>
          )}

          {/* MAIN CONTAINER */}
          <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-emerald-100 space-y-6">
            {/* SEARCH & FILTERS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Search Bar */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("Search crop, mandi, district, state...")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-emerald-200 text-xs sm:text-sm font-medium bg-emerald-50/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              {/* State Filter Dropdown */}
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5 pointer-events-none" />
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-2xl border border-emerald-200 text-xs sm:text-sm font-medium bg-emerald-50/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="all">{t("All States (AP & TS)")}</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>

              {/* Crop Filter Dropdown */}
              <div className="relative">
                <Sprout className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5 pointer-events-none" />
                <select
                  value={cropFilter}
                  onChange={(e) => setCropFilter(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-2xl border border-emerald-200 text-xs sm:text-sm font-medium bg-emerald-50/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="all">{t("All Crops")}</option>
                  {cropsList.filter(c => c !== "all").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>

              {/* Sort Order Dropdown */}
              <div className="relative">
                <BarChart2 className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5 pointer-events-none" />
                <select
                  value={sortOrder}
                  onChange={(e: any) => setSortOrder(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-2xl border border-emerald-200 text-xs sm:text-sm font-medium bg-emerald-50/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="recently_updated">{t("Latest Updated")}</option>
                  <option value="price_low_high">{t("Price: Low → High")}</option>
                  <option value="price_high_low">{t("Price: High → Low")}</option>
                  <option value="crop_asc">{t("Crop: A → Z")}</option>
                  <option value="market_asc">{t("Market: A → Z")}</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* STATS / FILTER SUMMARY BADGES */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#1b4332]">
                  Showing {filteredRecords.length} Mandi Records
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 font-bold text-[11px]">
                  AP: {apCount}
                </span>
                <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 font-bold text-[11px]">
                  TS: {tsCount}
                </span>
              </div>
              <div className="text-muted-foreground font-semibold text-[11px]">
                Source: AGMARKNET — Directorate of Marketing & Inspection, Govt. of India
              </div>
            </div>

            {/* LOADING STATE */}
            {loading && (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-muted-foreground">Loading authentic AGMARKNET mandi prices...</p>
              </div>
            )}

            {/* ERROR STATE */}
            {error && !loading && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => fetchPrices()} className="underline cursor-pointer">Retry</button>
              </div>
            )}

            {/* DATA TABLE */}
            {!loading && (
              <div className="overflow-x-auto rounded-2xl border border-emerald-100 shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-emerald-50/70 border-b border-emerald-100 text-xs font-black text-[#1b4332] uppercase tracking-wider">
                      <th className="py-3.5 px-4">🌱 Crop & Variety</th>
                      <th className="py-3.5 px-4">📍 Market / Mandi</th>
                      <th className="py-3.5 px-4">🏢 Location & State</th>
                      <th className="py-3.5 px-4">💰 Modal Price</th>
                      <th className="py-3.5 px-4">📈 24h Trend</th>
                      <th className="py-3.5 px-4">🛡️ Source</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-50 text-xs font-medium">
                    {filteredRecords.map((row) => {
                      const isPositive = row.change_pct >= 0;
                      const isAP = row.state === "Andhra Pradesh";
                      return (
                        <tr key={row.id} className="hover:bg-emerald-50/40 transition-colors">
                          {/* Crop Name */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl shrink-0">{getCropIcon(row.crop_name)}</span>
                              <div>
                                <span className="font-extrabold text-[#1b4332] text-sm block">{row.crop_name}</span>
                                <span className="text-[10px] text-muted-foreground font-semibold">Wholesale Mandi Grade</span>
                              </div>
                            </div>
                          </td>

                          {/* Mandi Name */}
                          <td className="py-3.5 px-4 whitespace-nowrap font-bold text-foreground">
                            {row.market_name}
                          </td>

                          {/* Location & State */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-600">{row.location}</span>
                              <span
                                className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                  isAP
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                    : "bg-blue-100 text-blue-800 border-blue-300"
                                }`}
                              >
                                {isAP ? "AP" : "TS"}
                              </span>
                            </div>
                          </td>

                          {/* Price */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-extrabold text-sm text-[#1b4332]">
                              ₹{Number(row.price).toLocaleString()}
                            </span>
                            <span className="text-muted-foreground text-[11px] font-semibold"> / {row.unit || "Quintal"}</span>
                          </td>

                          {/* Trend */}
                          <td className="py-3.5 px-4 whitespace-nowrap font-bold">
                            {isPositive ? (
                              <span className="text-emerald-700 inline-flex items-center gap-1 bg-emerald-100/60 px-2 py-0.5 rounded-md text-[11px]">
                                <TrendingUp className="w-3.5 h-3.5" /> +{row.change_pct}%
                              </span>
                            ) : (
                              <span className="text-rose-700 inline-flex items-center gap-1 bg-rose-100/60 px-2 py-0.5 rounded-md text-[11px]">
                                <TrendingDown className="w-3.5 h-3.5" /> {row.change_pct}%
                              </span>
                            )}
                          </td>

                          {/* Data Source */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-gray-700">
                                {row.source || "AGMARKNET"}
                              </span>
                              <span className="text-[9px] text-emerald-700 font-extrabold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Live Verified
                              </span>
                            </div>
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setSelectedDetailItem(row)}
                              className="rounded-xl bg-emerald-100 hover:bg-emerald-700 hover:text-white text-[#1b4332] font-bold px-3 py-1.5 text-xs transition-colors cursor-pointer"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredRecords.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-500 text-xs font-bold">
                          No matching market prices found. Try adjusting your search query or filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* FOOTER FEATURE RIBBON */}
            <div className="pt-6 border-t border-emerald-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                  <Sprout className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{t("Official AGMARKNET Data")}</h4>
                  <p className="text-[11px] text-gray-500">{t("Direct APMC market feeds")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{t("AP & TS District Mandis")}</h4>
                  <p className="text-[11px] text-gray-500">{t("Guntur, Nizamabad, Eluru, etc.")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{t("Transparent Pricing")}</h4>
                  <p className="text-[11px] text-gray-500">{t("Zero manufactured prices")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{t("Empowering Farmers")}</h4>
                  <p className="text-[11px] text-gray-500">{t("Fair sell value insights")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VIEW DETAILS MODAL */}
        {selectedDetailItem && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-emerald-100 space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{getCropIcon(selectedDetailItem.crop_name)}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedDetailItem.crop_name}</h3>
                    <p className="text-xs text-gray-500">{selectedDetailItem.location}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDetailItem(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 py-2 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Mandi / APMC Market</span>
                  <span className="font-extrabold text-gray-900">{selectedDetailItem.market_name}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">State</span>
                  <span className="font-bold text-gray-900">{selectedDetailItem.state}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Current Wholesale Price</span>
                  <span className="font-extrabold text-emerald-800 text-base">
                    ₹{Number(selectedDetailItem.price).toLocaleString()} / {selectedDetailItem.unit || "Quintal"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Price Trend</span>
                  <span
                    className={`font-bold ${selectedDetailItem.change_pct >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {selectedDetailItem.change_pct >= 0
                      ? `↗ +${selectedDetailItem.change_pct}%`
                      : `↘ ${selectedDetailItem.change_pct}%`}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Data Freshness</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Fresh / Updated Today
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-gray-500 font-medium">Official Data Source</span>
                  <span className="font-bold text-gray-800">
                    {selectedDetailItem.source || "AGMARKNET (Govt. of India)"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedDetailItem(null)}
                className="w-full py-2.5 rounded-2xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}

export function SchemesPage() {
  const { language, t } = useTranslation();
  const isTelugu = language === "te";
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  const categories = [
    "all",
    "Crop Insurance",
    "Financial Support",
    "Agriculture",
    "Irrigation",
    "Soil & Fertilizer",
    "Seeds",
    "Farm Mechanization",
    "Horticulture",
    "Farmer Welfare",
    "Livestock",
    "Fisheries",
    "Other Support",
  ];

  const states = [
    { value: "all", label: isTelugu ? "అన్ని ప్రాంతాలు" : "All Coverage" },
    { value: "Central Government", label: isTelugu ? "కేంద్ర ప్రభుత్వం" : "Central Government" },
    { value: "Andhra Pradesh", label: isTelugu ? "ఆంధ్రప్రదేశ్" : "Andhra Pradesh" },
    { value: "Telangana", label: isTelugu ? "తెలంగాణ" : "Telangana" },
  ];

  const departments = [
    { value: "all", label: isTelugu ? "అన్ని ప్రభుత్వ శాఖలు" : "All Government Departments" },
    { value: "Ministry of Agriculture & Farmers Welfare", label: "Ministry of Agriculture & Farmers Welfare" },
    { value: "Ministry of Finance / NABARD", label: "Ministry of Finance / NABARD" },
    { value: "Ministry of New and Renewable Energy", label: "Ministry of New and Renewable Energy" },
    { value: "Ministry of Fisheries, Animal Husbandry & Dairying", label: "Ministry of Fisheries & Animal Husbandry" },
    { value: "Ministry of Food Processing Industries", label: "Ministry of Food Processing Industries" },
    { value: "Government of Andhra Pradesh", label: "Government of Andhra Pradesh" },
    { value: "Government of Telangana", label: "Government of Telangana" },
  ];

  const filteredSchemes = SCHEMES.filter((s) => {
    const searchTarget = `${s.name} ${s.category} ${s.eligibility} ${s.description} ${s.issuer} ${s.department || ""} ${s.state || ""} ${s.benefit || ""}`.toLowerCase();
    const matchesQuery = searchTarget.includes(query.toLowerCase());
    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
    const matchesState = stateFilter === "all" || s.state === stateFilter;
    const matchesDepartment =
      departmentFilter === "all" ||
      (s.department && s.department.toLowerCase().includes(departmentFilter.toLowerCase())) ||
      (s.issuer && s.issuer.toLowerCase().includes(departmentFilter.toLowerCase()));
    return matchesQuery && matchesCategory && matchesState && matchesDepartment;
  });

  const hasActiveFilters = query !== "" || categoryFilter !== "all" || stateFilter !== "all" || departmentFilter !== "all";

  const clearFilters = () => {
    setQuery("");
    setCategoryFilter("all");
    setStateFilter("all");
    setDepartmentFilter("all");
  };

  const pageSubtitle = isTelugu
    ? "రైతులకు సహాయపడే అధికారిక ప్రభుత్వ పథకాలు, అర్హతలు మరియు అధికారిక వెబ్‌సైట్ లింక్‌లు."
    : "Verified directory of real government agricultural schemes, eligibility criteria, and official application portals.";
  const searchPlaceholder = isTelugu
    ? "పథకాల పేరు, శాఖ, లేదా అర్హతల ద్వారా వెతకండి..."
    : "Search schemes by name, department, category, or eligibility...";

  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "student", "seller", "admin"]} allowGuest={true}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2000"
        lightTheme={true}
        eyebrow="Government Schemes"
        title="Government Schemes"
        intro={pageSubtitle}
      >
        <div className="mx-auto max-w-6xl space-y-7">
          {/* PureFarm Disclaimer Banner */}
          <div className="rounded-3xl border border-[#1E6446]/25 bg-emerald-50/95 p-5 shadow-lg backdrop-blur-md">
            <div className="flex items-start gap-3.5">
              <Info className="h-6 w-6 text-[#0D6E48] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-[#123F2D] text-base">
                  {isTelugu ? "అధికారిక ప్రభుత్వ పథకాల మార్గదర్శి" : "Verified Government Schemes Directory"}
                </h4>
                <p className="text-xs sm:text-sm text-[#315A49] font-semibold leading-relaxed">
                  {isTelugu
                    ? "ప్యూర్ ఫార్మ్ రైతుల అవగాహన కోసం ఈ సరిచూసిన ప్రభుత్వ పథకాల సమాచారాన్ని అందిస్తుంది. అన్ని దరఖాస్తులు, అర్హత పరిశీలన మరియు లబ్ధిని అధికారిక ప్రభుత్వ వెబ్‌సైట్‌లు (.gov.in / .nic.in లేదా రాష్ట్ర ప్రభుత్వ శాఖల ద్వారా) నేరుగా సమర్పించాలి. ప్యూర్ ఫార్మ్ ఎలాంటి రుసుములను వసూలు చేయదు."
                    : "PureFarm provides this verified directory for farmer informational guidance. All applications, eligibility verification, and benefit claims must be submitted directly through official government portals (.gov.in / .nic.in or State Agriculture portals). PureFarm does not collect application fees or process third-party submissions."}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar & Filter Controls Card */}
          <div className="flex flex-col gap-5 rounded-3xl border border-[#1E6446]/20 bg-white/96 p-5 sm:p-6 shadow-xl shadow-emerald-950/5 backdrop-blur-md">
            {/* Search Input */}
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#10B981]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-2xl border border-[#1E6446]/25 bg-slate-50/90 py-3.5 pl-12 pr-4 text-base font-semibold text-[#123F2D] placeholder-[#527064] transition-all focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#0D6E48] hover:text-[#10B981]"
                >
                  {isTelugu ? "స్పష్టంచేయి" : "Clear"}
                </button>
              )}
            </div>

            {/* State & Department Dropdowns Row */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* State / Coverage Filter */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#0D6E48] flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {isTelugu ? "ప్రాంతం / కవరేజ్:" : "State / Coverage:"}
                </label>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full rounded-xl border border-[#1E6446]/25 bg-slate-50 py-2.5 px-3 text-sm font-semibold text-[#123F2D] focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
                >
                  {states.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#0D6E48] flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {isTelugu ? "ప్రభుత్వ శాఖ:" : "Department:"}
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full rounded-xl border border-[#1E6446]/25 bg-slate-50 py-2.5 px-3 text-sm font-semibold text-[#123F2D] focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
                >
                  {departments.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Filters button */}
              {hasActiveFilters && (
                <div className="flex items-end sm:col-span-2 lg:col-span-1">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 px-4 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
                  >
                    {isTelugu ? "ఫిల్టర్లు రీసెట్ చేయండి" : "Reset All Filters"}
                  </button>
                </div>
              )}
            </div>

            {/* Category Filter Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#1E6446]/10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D6E48] mr-1">
                {isTelugu ? "వర్గాలు:" : "Categories:"}
              </span>
              {categories.map((cat) => {
                const count = cat === "all" ? SCHEMES.length : SCHEMES.filter((s) => s.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                      categoryFilter === cat
                        ? "bg-[#123F2D] text-white shadow-md shadow-emerald-950/20"
                        : "bg-white border border-[#1E6446]/20 text-[#123F2D] hover:bg-emerald-50 hover:text-[#10B981]"
                    }`}
                  >
                    <span>{cat === "all" ? (isTelugu ? "అన్నీ" : "All") : t(cat)}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        categoryFilter === cat ? "bg-emerald-500 text-white" : "bg-emerald-100 text-[#0D6E48]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scheme Cards Grid */}
          {filteredSchemes.length === 0 ? (
            <div className="rounded-3xl border border-[#1E6446]/20 bg-white/96 p-10 text-center shadow-xl">
              <Search className="mx-auto h-12 w-12 text-emerald-600/40" />
              <p className="mt-3 text-lg font-bold text-[#123F2D]">
                {isTelugu ? "పథకాలు ఏవీ కనుగొనబడలేదు" : "No government schemes match your criteria"}
              </p>
              <p className="mt-1 text-sm font-medium text-[#315A49]">
                {isTelugu
                  ? "మీ సెర్చ్ లేదా ఫిల్టర్లకు సరిపోలే పథకాలు ఏవీ లేవు. దయచేసి రీసెట్ చేయండి."
                  : "Try adjusting your search query, state selection, or department filter."}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex items-center rounded-xl bg-[#123F2D] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#0D6E48]"
              >
                {isTelugu ? "అన్ని పథకాలను చూపించు" : "Show All Verified Schemes"}
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {filteredSchemes.map((scheme) => (
                <SchemeCard
                  key={scheme.id}
                  scheme={scheme}
                  isTelugu={isTelugu}
                  onViewDetails={() => setSelectedScheme(scheme)}
                />
              ))}
            </div>
          )}

          {/* Modal for Scheme Details */}
          {selectedScheme && (
            <SchemeDetailsModal
              scheme={selectedScheme}
              isTelugu={isTelugu}
              onClose={() => setSelectedScheme(null)}
            />
          )}
        </div>
      </PageShell>
    </RoleGuard>
  );
}

function SchemeCard({
  scheme,
  isTelugu,
  onViewDetails,
}: {
  scheme: Scheme;
  isTelugu: boolean;
  onViewDetails: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border transition-all duration-300 p-6 sm:p-7 bg-white/96 border-[#1E6446]/20 shadow-xl shadow-emerald-950/5 hover:bg-white hover:border-[#1E6446]/40 hover:-translate-y-1">
      <div>
        {/* Header Badges: Category & State */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center rounded-full border border-[#1E6446]/30 bg-[#E6F4ED] px-3 py-1 font-bold text-[#0D6E48] text-xs">
            {t(scheme.category)}
          </span>
          {scheme.state && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#10B981]/30 bg-emerald-50 px-2.5 py-0.5 font-bold text-[#0D6E48] text-[11px]">
              <MapPin className="h-3 w-3" />
              {scheme.state}
            </span>
          )}
        </div>

        {/* Icon & Department */}
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1E6446]/30 bg-[#F0FDF4] text-2xl shadow-sm flex-shrink-0">
            {scheme.icon || "🌾"}
          </span>
          <div className="min-w-0">
            <h3 className="font-bold text-[#123F2D] text-lg sm:text-xl leading-snug group-hover:text-[#0D6E48] transition-colors">
              {scheme.name}
            </h3>
            <p className="mt-0.5 text-xs font-semibold text-[#527064] flex items-center gap-1 truncate">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-[#10B981]" />
              <span className="truncate">{scheme.issuer}</span>
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-[#315A49] font-medium text-xs sm:text-sm leading-relaxed line-clamp-2">
          {scheme.description}
        </p>

        {/* Eligibility & Benefit Box */}
        <div className="mt-4 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-3.5 space-y-2">
          {scheme.benefit && (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center rounded-md bg-[#10B981]/15 px-2.5 py-0.5 text-xs font-bold text-[#0D6E48] border border-[#10B981]/30">
                ✨ {scheme.benefit}
              </span>
            </div>
          )}
          <p className="text-[#123F2D] font-semibold text-xs sm:text-sm leading-normal line-clamp-2">
            <strong className="text-[#0D6E48]">{isTelugu ? "అర్హత: " : "Eligibility: "}</strong>
            {scheme.eligibility}
          </p>
        </div>
      </div>

      {/* Footer & Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[#1E6446]/10 pt-4">
        <button
          type="button"
          onClick={onViewDetails}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#123F2D] bg-white px-4 py-2 text-xs sm:text-sm font-bold text-[#123F2D] hover:bg-[#F0FDF4] hover:text-[#0D6E48] transition-all"
        >
          <FileText className="h-4 w-4" />
          <span>{isTelugu ? "వివరాలు చూడండి" : "View Details"}</span>
        </button>

        <a
          href={scheme.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#10B981] px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-[#0D9668] hover:shadow-lg hover:shadow-emerald-900/20"
        >
          <span>{isTelugu ? "అధికారిక వెబ్‌సైట్" : "Visit Official Website"}</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function SchemeDetailsModal({
  scheme,
  isTelugu,
  onClose,
}: {
  scheme: Scheme;
  isTelugu: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-emerald-900/10 bg-white p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Modal Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1E6446]/30 bg-[#F0FDF4] text-2xl shadow-sm">
              {scheme.icon || "🌾"}
            </span>
            <span className="inline-flex items-center rounded-full border border-[#1E6446]/30 bg-[#E6F4ED] px-3 py-1 font-bold text-[#0D6E48] text-xs">
              {scheme.category}
            </span>
            {scheme.state && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#10B981]/30 bg-emerald-50 px-2.5 py-1 font-bold text-[#0D6E48] text-xs">
                <MapPin className="h-3.5 w-3.5" />
                {scheme.state}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#123F2D] leading-tight">
            {scheme.name}
          </h2>

          <div className="flex items-center gap-2 text-sm font-semibold text-[#527064]">
            <Building2 className="h-4 w-4 text-[#10B981] shrink-0" />
            <span>{scheme.issuer}</span>
          </div>
        </div>

        {/* Benefit Highlight */}
        {scheme.benefit && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-[#10B981] shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#0D6E48]">
                {isTelugu ? "ప్రధాన ప్రయోజనం" : "Key Benefit"}
              </p>
              <p className="text-sm font-bold text-[#123F2D]">{scheme.benefit}</p>
            </div>
          </div>
        )}

        {/* Scheme Details Grid */}
        <div className="space-y-4 divide-y divide-slate-100">
          {/* Description */}
          <div className="pt-2 space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D6E48]">
              {isTelugu ? "పథకం వివరణ" : "Scheme Description"}
            </h4>
            <p className="text-sm text-[#315A49] font-medium leading-relaxed">
              {scheme.description}
            </p>
          </div>

          {/* Eligibility */}
          <div className="pt-4 space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D6E48] flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              {isTelugu ? "అర్హత నిబంధనలు" : "Eligibility Criteria"}
            </h4>
            <p className="text-sm text-[#123F2D] font-semibold leading-relaxed">
              {scheme.eligibility}
            </p>
          </div>

          {/* Application Mode */}
          {scheme.applicationMode && (
            <div className="pt-4 space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D6E48] flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-[#10B981]" />
                {isTelugu ? "దరఖాస్తు విధానం" : "Application Channel"}
              </h4>
              <p className="text-sm text-[#123F2D] font-semibold leading-relaxed">
                {scheme.applicationMode}
              </p>
            </div>
          )}

          {/* Deadline / Application Window */}
          <div className="pt-4 space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D6E48]">
              {isTelugu ? "దరఖాస్తు గడువు / సమయం" : "Application Deadline / Calendar"}
            </h4>
            <p className="text-sm text-[#315A49] font-semibold">{scheme.deadline}</p>
          </div>
        </div>

        {/* Modal Footer / Official Link Button */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-semibold text-slate-500 truncate max-w-xs">
            🌐 {scheme.url}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              {isTelugu ? "మూసివేయి" : "Close"}
            </button>
            <a
              href={scheme.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-[#10B981] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#0D9668]"
            >
              <span>{isTelugu ? "అధికారిక పోర్టల్‌ని సందర్శించండి" : "Visit Official Website"}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InsurancePage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Crop Insurance",
    "Weather-Based Insurance",
    "Government Portal",
    "State Resources",
    "Insurance Services",
  ];

  const filteredSchemes = useMemo(() => {
    return INSURANCE_SCHEMES.filter((scheme) => {
      const matchesCategory =
        selectedCategory === "All" || scheme.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        scheme.name.toLowerCase().includes(q) ||
        scheme.description.toLowerCase().includes(q) ||
        (scheme.department && scheme.department.toLowerCase().includes(q)) ||
        scheme.states.toLowerCase().includes(q) ||
        (scheme.crops && scheme.crops.some((c) => c.toLowerCase().includes(q)));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "student", "seller", "admin"]} allowGuest={true}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2000"
        eyebrow={t("Government Schemes & Insurance")}
        title={t("Crop Insurance & Government Directory")}
        intro={t(
          "Verified official government portals, crop insurance schemes, premium calculators, and state agricultural resources. Click any card to access the official government portal.",
        )}
      >
        {/* Information Gateway Disclaimer Banner */}
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 sm:p-5 text-emerald-900 shadow-sm flex items-start gap-3">
          <Info className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <span className="font-bold">{t("PureFarm Informational Gateway Disclaimer:")} </span>
            {t(
              "PureFarm serves exclusively as an informational directory connecting farmers to official Government of India and State Government portals. PureFarm is not an insurance company or government authority. Please verify eligibility, notified crops, premium rates, and application details directly on official government websites.",
            )}
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("Search insurance schemes, portals, calculators, or states...")}
                className="w-full h-10 rounded-xl border border-border bg-background pl-10 pr-4 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Total Results Counter */}
            <div className="text-xs font-bold text-muted-foreground text-right shrink-0">
              {t("Showing")} {filteredSchemes.length} {t("of")} {INSURANCE_SCHEMES.length} {t("resources")}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground hover:bg-muted"
                }`}
              >
                {t(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Insurance Cards Grid */}
        {filteredSchemes.length === 0 ? (
          <div className="p-12 text-center bg-card rounded-2xl border border-border shadow-sm">
            <Info className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-base font-bold">{t("No insurance resources found matching your search.")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("Try clearing your search query or selecting a different category filter.")}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-[#1b4332] transition"
            >
              {t("Reset Filters")}
            </button>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSchemes.map((scheme) => (
              <div
                key={scheme.code}
                className={`${glassCardClass} flex flex-col justify-between hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md`}
              >
                <div>
                  {/* Category Tag & Department */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary">
                      {t(scheme.category || scheme.type)}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground truncate">
                      {scheme.states}
                    </span>
                  </div>

                  {/* Scheme Title */}
                  <h3 className="text-lg font-black text-[#1b4332] leading-snug">
                    {t(scheme.name)}
                  </h3>

                  {/* Government Department */}
                  {scheme.department && (
                    <p className="mt-1 text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{scheme.department}</span>
                    </p>
                  )}

                  {/* Description */}
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {t(scheme.description)}
                  </p>

                  {/* Coverage Box */}
                  {scheme.coverage && (
                    <div className="mt-3 rounded-xl bg-muted/60 p-2.5 border border-border/50 text-xs">
                      <span className="font-bold text-foreground">{t("Coverage Scope")}: </span>
                      <span className="text-muted-foreground">{t(scheme.coverage)}</span>
                    </div>
                  )}

                  {/* Eligible Crops */}
                  {scheme.crops && scheme.crops.length > 0 && (
                    <div className="mt-3 text-xs">
                      <span className="font-bold text-foreground">{t("Notified Crops / Categories")}: </span>
                      <span className="text-primary font-medium">{scheme.crops.join(", ")}</span>
                    </div>
                  )}

                  {/* Premium / Cost Info */}
                  {scheme.premium && (
                    <div className="mt-2 text-xs font-semibold text-emerald-800">
                      <span className="font-bold">{t("Premium / Fee")}: </span>
                      {t(scheme.premium)}
                    </div>
                  )}
                </div>

                {/* External Action Button */}
                <div className="mt-6 pt-4 border-t border-border">
                  <a
                    href={scheme.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2d6a4f] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1b4332] transition shadow-sm"
                  >
                    <span>{t("Visit Official Website")}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Official Government Sources Section */}
        <div className="mt-12 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-black text-[#1b4332]">
              {t("Official Government Sources & Verified Portals")}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6">
            {t(
              "Below is the complete, verified list of official Government of India and State Government portals linked within this directory.",
            )}
          </p>

          <div className="divide-y divide-border rounded-2xl border border-border overflow-hidden bg-background">
            {INSURANCE_SCHEMES.map((scheme) => (
              <div
                key={scheme.code}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition"
              >
                <div>
                  <h4 className="font-black text-sm text-[#1b4332]">{scheme.name}</h4>
                  <p className="text-xs text-muted-foreground font-medium">{scheme.department}</p>
                  <p className="text-[11px] text-emerald-700 font-mono mt-0.5">{scheme.url}</p>
                </div>
                <a
                  href={scheme.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground hover:bg-primary hover:text-white transition text-xs font-bold shrink-0 self-start sm:self-center"
                >
                  <span>{t("Visit Portal")}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </PageShell>
    </RoleGuard>
  );
}

export function PmfbyDetailPage() {
  const { t } = useTranslation();
  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "student", "seller", "admin"]} allowGuest={true}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2000"
        eyebrow="Crop Insurance Scheme"
        title="Pradhan Mantri Fasal Bima Yojana (PMFBY)"
        intro="Comprehensive crop insurance scheme providing financial support to farmers suffering crop loss or damage arising out of non-preventable natural risks."
      >
        <div className="mb-6">
          <Link
            to="/crop-insurance"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            ← Back to Crop Insurance
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className={glassCardClass}>
            <ShieldCheck className="h-7 w-7 text-primary" />
            <h3 className="mt-3 text-lg font-black">Premium Rates</h3>
            <p className="mt-1 text-sm font-bold text-primary">
              Kharif: 2.0% | Rabi: 1.5% | Commercial: 5.0%
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Uniform premium rate payable by farmers. The balance actuarial premium is shared
              equally (50:50) by the Central and State Governments.
            </p>
          </div>

          <div className={glassCardClass}>
            <CheckCircle2 className="h-7 w-7 text-primary" />
            <h3 className="mt-3 text-lg font-black">Coverage Stages</h3>
            <p className="mt-1 text-sm font-bold text-primary">Sowing to Post-Harvest</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t(
                "Covers Prevented Sowing / Planting Risk, Standing Crop (Yield Losses due to drought, flood, pests, diseases), Localised Calamities (hailstorm, landslide, inundation), and Post-Harvest Losses (up to 14 days).",
              )}
            </p>
          </div>

          <div className={glassCardClass}>
            <Leaf className="h-7 w-7 text-primary" />
            <h3 className="mt-3 text-lg font-black">Eligible Crops</h3>
            <p className="mt-1 text-sm font-bold text-primary">Food, Oilseeds & Annual Crops</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t(
                "Notified crops including Paddy, Wheat, Cotton, Maize, Mustard, Pulses, Commercial, and Horticultural crops notified by state governments.",
              )}
            </p>
          </div>

          <div className={glassCardClass}>
            <Scale className="h-7 w-7 text-primary" />
            <h3 className="mt-3 text-lg font-black">Sum Insured</h3>
            <p className="mt-1 text-sm font-bold text-primary">District Scale of Finance</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Sum insured per hectare is equal to the Scale of Finance (SoF) as decided by District
              Level Technical Committee (DLTC) multiplied by crop area.
            </p>
          </div>

          <div className={glassCardClass}>
            <Users className="h-7 w-7 text-primary" />
            <h3 className="mt-3 text-lg font-black">Management & Implementation</h3>
            <p className="mt-1 text-sm font-bold text-primary">Empanelled Insurers & State Govts</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t(
                "Administered through empanelled public and private general insurance companies under oversight of State Agriculture Departments.",
              )}
            </p>
          </div>

          <div className={glassCardClass}>
            <Award className="h-7 w-7 text-primary" />
            <h3 className="mt-3 text-lg font-black">Claim Settlement</h3>
            <p className="mt-1 text-sm font-bold text-primary">Direct Bank Transfer (DBT)</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t(
                "Claim payouts are calculated based on Crop Cutting Experiments (CCE) data or weather triggers and directly credited to farmers' Aadhaar-seeded bank accounts.",
              )}
            </p>
          </div>
        </div>
      </PageShell>
    </RoleGuard>
  );
}

export function WeatherBasedDetailPage() {
  const { t } = useTranslation();
  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "student", "seller", "admin"]} allowGuest={true}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=2000"
        eyebrow="Weather Index Insurance"
        title="Weather Based Crop Insurance"
        intro="Index-based weather parametric protection compensating farmers against quantifiable financial loss caused by adverse weather conditions."
      >
        <div className="mb-6">
          <Link
            to="/crop-insurance"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            ← Back to Crop Insurance
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className={glassCardClass}>
            <CloudRain className="h-7 w-7 text-primary" />
            <h3 className="mt-3 text-lg font-black">Weather Index Trigger</h3>
            <p className="mt-1 text-sm font-bold text-primary">Automated Weather Station Data</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Payouts are triggered automatically based on deviations in weather parameters recorded
              at notified Reference Weather Stations (RWS).
            </p>
          </div>

          <div className={glassCardClass}>
            <Wind className="h-7 w-7 text-primary" />
            <h3 className="mt-3 text-lg font-black">Parameters Covered</h3>
            <p className="mt-1 text-sm font-bold text-primary">Rainfall, Temp, Humidity, Wind</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t(
                "Covers rainfall deficit/excess, unseasonal rainfall, high/low temperature spikes, humidity fluctuations, and wind speed deviations.",
              )}
            </p>
          </div>

          <div className={glassCardClass}>
            <Leaf className="h-7 w-7 text-primary" />
            <h3 className="mt-3 text-lg font-black">Targeted Crops</h3>
            <p className="mt-1 text-sm font-bold text-primary">Horticulture & Cash Crops</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Specifically suited for perennial horticulture crops (Mango, Citrus, Banana), Spices
              (Chilli, Turmeric), Cotton, and Groundnut.
            </p>
          </div>

          <div className={glassCardClass}>
            <Shield className="h-7 w-7 text-primary" />
            <h3 className="mt-3 text-lg font-black">Premium & Subsidy</h3>
            <p className="mt-1 text-sm font-bold text-primary">District & Crop Notified</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t(
                "Actuarial premium varies by crop and district historical risk profiles, with government premium subsidies available.",
              )}
            </p>
          </div>

          <div className={glassCardClass}>
            <MapPin className="h-7 w-7 text-primary" />
            <h3 className="mt-3 text-lg font-black">Coverage Unit</h3>
            <p className="mt-1 text-sm font-bold text-primary">Reference Weather Station Unit</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t(
                "Defined reference unit area tied to localized IMD or private automated weather station network data.",
              )}
            </p>
          </div>

          <div className={glassCardClass}>
            <CheckCircle2 className="h-7 w-7 text-primary" />
            <h3 className="mt-3 text-lg font-black">Rapid Claim Processing</h3>
            <p className="mt-1 text-sm font-bold text-primary">No Individual Loss Assessment</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Since claims depend on objective weather station data, payouts are processed rapidly
              without field loss verification delays.
            </p>
          </div>
        </div>
      </PageShell>
    </RoleGuard>
  );
}

export function LivestockDetailPage() {
  const { t } = useTranslation();
  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "student", "seller", "admin"]} allowGuest={true}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=2000"
        eyebrow="Allied Farming Protection"
        title="Livestock Insurance Support"
        intro="Financial protection for cattle, buffaloes, sheep, and goats against death due to natural accidents, disease, or surgical complications."
      >
        <div className="mb-6">
          <Link
            to="/crop-insurance"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            ← Back to Crop Insurance
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className={glassCardClass}>
            <ShieldCheck className="h-7 w-7 text-primary" />
            <h3 className="mt-3 text-lg font-black">Covered Animals</h3>
            <p className="mt-1 text-sm font-bold text-primary">
              {t("Dairy Cattle, Buffalo, Goat & Sheep")}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Protection for crossbred and indigenous milch cows, buffaloes, breeding bulls, and
              small ruminants (sheep & goats).
            </p>
          </div>

          <div className={glassCardClass}>
            <Heart className="h-7 w-7 text-primary" />
            <h3 className="mt-3 text-lg font-black">Scope of Protection</h3>
            <p className="mt-1 text-sm font-bold text-primary">Accident & Disease Risk</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t(
                "Covers death due to accident, lightning, flood, disease outbreaks, calving complications, surgical procedures, and permanent total disability.",
              )}
            </p>
          </div>

          <div className={glassCardClass}>
            <Scale className="h-7 w-7 text-primary" />
            <h3 className="mt-3 text-lg font-black">Animal Valuation</h3>
            <p className="mt-1 text-sm font-bold text-primary">Veterinary Officer Valuation</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t(
                "Market value of animal evaluated and certified by a registered Veterinary Assistant Surgeon at the time of insurance policy issuance.",
              )}
            </p>
          </div>

          <div className={glassCardClass}>
            <Award className="h-7 w-7 text-primary" />
            <h3 className="mt-3 text-lg font-black">Identification & Tagging</h3>
            <p className="mt-1 text-sm font-bold text-primary">
              Ear-Tagging / Microchip Identification
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t(
                "Animals are tagged with tamper-proof ear tags or RFID microchips recorded in animal health databases for seamless claim verification.",
              )}
            </p>
          </div>

          <div className={glassCardClass}>
            <Users className="h-7 w-7 text-primary" />
            <h3 className="mt-3 text-lg font-black">Subsidies & Management</h3>
            <p className="mt-1 text-sm font-bold text-primary">State Animal Husbandry Dept</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Supported under National Livestock Mission (NLM) with up to 50% - 70% premium subsidy
              provided by state governments for eligible farmers.
            </p>
          </div>

          <div className={glassCardClass}>
            <CheckCircle2 className="h-7 w-7 text-primary" />
            <h3 className="mt-3 text-lg font-black">Claim Process</h3>
            <p className="mt-1 text-sm font-bold text-primary">Veterinary Certification & Payout</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t(
                "Claims submitted along with post-mortem examination report and ear-tag verification by veterinary officers for quick payout release.",
              )}
            </p>
          </div>
        </div>
      </PageShell>
    </RoleGuard>
  );
}

export function WeatherPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const defaultLoc = user?.location || "Tadepalligudem, AP";
  const [selectedCrop, setSelectedCrop] = useState<string>("Paddy");
  const [selectedLocation, setSelectedLocation] = useState(defaultLoc);
  const [searchInput, setSearchInput] = useState(defaultLoc);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const popularLocations = [
    "Tadepalligudem, AP",
    "Rajahmundry, AP",
    "Guntur, AP",
    "Vijayawada, AP",
    "Eluru, AP",
    "Visakhapatnam, AP",
    "Kakinada, AP",
    "Hyderabad, TS",
    "Ludhiana, Punjab",
    "Nashik, Maharashtra",
    "Delhi",
  ];

  const availableCrops = Object.values(CROP_PROFILES);

  const loadWeather = useCallback((loc: string) => {
    setLoading(true);
    setErrorMessage(null);
    fetchWeatherData(loc)
      .then((data) => {
        setWeatherData(data);
        setLoading(false);
      })
      .catch((err: any) => {
        setWeatherData(null);
        setLoading(false);
        if (err instanceof WeatherError && err.code === "MISSING_KEY") {
          setErrorMessage("Weather service is not configured. Please provide VITE_OPENWEATHER_API_KEY.");
        } else {
          setErrorMessage("Unable to load weather data. Please verify your location or internet connection.");
        }
      });
  }, []);

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    setLoading(true);
    setErrorMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude)
          .then((data) => {
            setWeatherData(data);
            setSelectedLocation(data.locationName);
            setSearchInput(data.locationName);
            setLoading(false);
            setIsLocating(false);
          })
          .catch(() => {
            setLoading(false);
            setIsLocating(false);
            loadWeather(selectedLocation);
          });
      },
      () => {
        setIsLocating(false);
        loadWeather(selectedLocation);
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => {
    loadWeather(selectedLocation);
  }, [selectedLocation, loadWeather]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSelectedLocation(searchInput.trim());
    }
  };

  const cropAdvisories: CropAdvisory[] = weatherData
    ? getCropWeatherAdvisories(selectedCrop, weatherData)
    : [];

  const currentProfile = CROP_PROFILES[selectedCrop] || CROP_PROFILES["Paddy"];

  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "student", "seller", "admin"]} allowGuest={true}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=2000"
        eyebrow={t("Crop Weather")}
        title={t("Crop Weather & Field Advisory")}
        intro={t("Real-time meteorological forecast and crop-specific field action guidance for Indian farming.")}
      >
        <div className="space-y-6">
          {/* Crop & Location Selection Control Panel */}
          <div className="flex flex-col gap-5 rounded-3xl border border-[#1E6446]/20 bg-white/96 p-5 sm:p-6 shadow-xl shadow-emerald-950/5 backdrop-blur-md">
            {/* 1. Crop Selection Row */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0D6E48] flex items-center gap-1.5">
                <Sprout className="h-4 w-4 text-[#10B981]" />
                <span>{t("Select Target Crop for Advisory:")}</span>
              </label>

              <div className="flex flex-wrap items-center gap-2">
                {availableCrops.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedCrop(c.name)}
                    className={`rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                      selectedCrop === c.name
                        ? "bg-[#123F2D] text-white shadow-md shadow-emerald-950/20 scale-105"
                        : "bg-slate-50 border border-[#1E6446]/20 text-[#123F2D] hover:bg-emerald-50 hover:text-[#10B981]"
                    }`}
                  >
                    <span>{c.emoji}</span>
                    <span>{t(c.name)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-[#1E6446]/10 pt-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* 2. Popular Locations Row */}
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0D6E48] mr-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {t("Location:")}
                </span>
                {popularLocations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(loc);
                      setSearchInput(loc);
                    }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      selectedLocation === loc
                        ? "bg-[#10B981] text-white shadow-sm"
                        : "bg-slate-100 text-[#315A49] hover:bg-emerald-50"
                    }`}
                  >
                    {t(loc)}
                  </button>
                ))}
              </div>

              {/* 3. Search Bar & Geolocation Button */}
              <div className="flex items-center gap-2">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 sm:flex-none">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={t("Search city/mandi...")}
                    className="h-10 px-3.5 text-xs font-semibold rounded-xl border border-[#1E6446]/25 bg-slate-50 text-[#123F2D] outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 w-36 sm:w-48"
                  />
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-xl bg-[#123F2D] text-white font-bold text-xs hover:bg-[#0D6E48] transition shadow"
                  >
                    {t("Search")}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={handleGeolocation}
                  disabled={isLocating}
                  className="h-10 px-3.5 rounded-xl border border-[#10B981]/40 bg-emerald-50 text-[#0D6E48] font-bold text-xs hover:bg-emerald-100 transition flex items-center gap-1.5 shrink-0"
                  title="Use current GPS position"
                >
                  <Navigation className={`h-3.5 w-3.5 ${isLocating ? "animate-spin text-emerald-600" : ""}`} />
                  <span className="hidden sm:inline">{isLocating ? "Locating..." : "My Location"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="rounded-3xl border border-[#1E6446]/20 bg-white/96 p-12 text-center shadow-xl">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#10B981] border-r-transparent align-[-0.125em]" />
              <p className="mt-4 text-base font-bold text-[#123F2D]">{t("Loading live meteorological forecast...")}</p>
            </div>
          )}

          {/* Error State */}
          {!loading && errorMessage && (
            <div className="rounded-3xl border border-red-300 bg-red-50 p-8 text-center shadow-lg text-red-900">
              <CloudRain className="mx-auto h-12 w-12 text-red-600 mb-3" />
              <h3 className="text-lg font-bold text-red-900">{t("Weather Service Notice")}</h3>
              <p className="mt-1 text-sm font-semibold text-red-700 max-w-md mx-auto">{t(errorMessage)}</p>
              <button
                type="button"
                onClick={() => loadWeather(selectedLocation)}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-red-700 text-white font-bold text-xs rounded-xl hover:bg-red-800 transition shadow"
              >
                {t("Retry Weather Request")}
              </button>
            </div>
          )}

          {/* Real Weather & Crop Advisory Display */}
          {!loading && !errorMessage && weatherData && (
            <div className="space-y-6">
              {/* Hero Current Weather Card */}
              <div className="rounded-3xl border border-[#1E6446]/20 bg-gradient-to-br from-[#123F2D] via-[#1b4332] to-[#0D6E48] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4 pointer-events-none">
                  <CloudSun className="h-96 w-96 text-white" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-emerald-100 border border-white/20">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{weatherData.locationName}</span>
                      </div>

                      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/25 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-emerald-200 border border-emerald-400/30">
                        <span>{currentProfile.emoji}</span>
                        <span>{currentProfile.name} ({currentProfile.season})</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                      <img src={weatherData.iconUrl} alt={weatherData.condition} className="h-20 w-20 object-contain drop-shadow-md" />
                      <div>
                        <h2 className="text-5xl font-black tracking-tight">{weatherData.temp}°C</h2>
                        <p className="text-lg font-bold text-emerald-100 capitalize">{weatherData.description}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-emerald-200/90 font-semibold">
                      {t("Feels like")} {weatherData.feelsLike}°C · {t("High")} {weatherData.tempMax}°C / {t("Low")} {weatherData.tempMin}°C
                    </p>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:self-end">
                    <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 text-center border border-white/15">
                      <Droplets className="mx-auto h-5 w-5 text-emerald-300" />
                      <p className="mt-1.5 text-xs text-emerald-200 font-bold uppercase">{t("Humidity")}</p>
                      <p className="text-base font-black">{weatherData.humidity}%</p>
                    </div>

                    <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 text-center border border-white/15">
                      <Wind className="mx-auto h-5 w-5 text-emerald-300" />
                      <p className="mt-1.5 text-xs text-emerald-200 font-bold uppercase">{t("Wind Speed")}</p>
                      <p className="text-base font-black">{weatherData.windSpeed} km/h</p>
                    </div>

                    <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 text-center border border-white/15">
                      <Sun className="mx-auto h-5 w-5 text-amber-300" />
                      <p className="mt-1.5 text-xs text-emerald-200 font-bold uppercase">{t("Sunrise")}</p>
                      <p className="text-base font-black">{weatherData.sunrise}</p>
                    </div>

                    <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 text-center border border-white/15">
                      <CloudSun className="mx-auto h-5 w-5 text-amber-300" />
                      <p className="mt-1.5 text-xs text-emerald-200 font-bold uppercase">{t("Sunset")}</p>
                      <p className="text-base font-black">{weatherData.sunset}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Crop Weather Guidance Section */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E6446]/10 pb-3">
                  <div>
                    <h3 className="text-xl font-bold text-[#123F2D] flex items-center gap-2">
                      <span>{currentProfile.emoji}</span>
                      <span>{t("Crop Weather Guidance")} — {currentProfile.name}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-[#315A49] font-medium mt-0.5">
                      {t("Live atmospheric evaluation against agronomic growth parameters for")} {currentProfile.name}.
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-[#0D6E48] border border-emerald-300">
                    Water Need: {currentProfile.waterNeed}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {cropAdvisories.map((adv, idx) => {
                    const statusBg =
                      adv.status === "optimal"
                        ? "bg-emerald-50 border-emerald-300 text-[#0D6E48]"
                        : adv.status === "alert"
                        ? "bg-red-50 border-red-300 text-red-800"
                        : adv.status === "warning"
                        ? "bg-amber-50 border-amber-300 text-amber-900"
                        : "bg-blue-50 border-blue-300 text-blue-900";

                    const badgeColor =
                      adv.status === "optimal"
                        ? "bg-emerald-600 text-white"
                        : adv.status === "alert"
                        ? "bg-red-600 text-white"
                        : adv.status === "warning"
                        ? "bg-amber-600 text-white"
                        : "bg-blue-600 text-white";

                    return (
                      <div
                        key={idx}
                        className={`rounded-2xl border p-4.5 space-y-2.5 shadow-sm transition-all hover:shadow-md ${statusBg}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                            {adv.category}
                          </span>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${badgeColor}`}>
                            {adv.status}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm leading-snug">{adv.title}</h4>

                        <p className="text-xs sm:text-sm font-semibold leading-relaxed opacity-95">
                          {adv.recommendation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5-Day Field Advisory Forecast */}
              <div className="space-y-4 pt-2">
                <div>
                  <h3 className="text-xl font-bold text-[#123F2D]">{t("5-Day Field Advisory Forecast")}</h3>
                  <p className="text-xs sm:text-sm text-[#315A49] font-medium">
                    {t("Daily agricultural field action recommendations based on live forecast models.")}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-5">
                  {weatherData.forecast.map((day) => (
                    <div
                      key={day.dateStr}
                      className="rounded-2xl border border-[#1E6446]/20 bg-white/96 p-4 shadow-md flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-base text-[#123F2D]">{t(day.day)}</p>
                          <span className="text-[10px] font-bold text-[#527064] uppercase">{day.dateStr.slice(5)}</span>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <img src={day.iconUrl} alt={day.condition} className="h-10 w-10 object-contain" />
                          <div>
                            <p className="text-xs font-bold capitalize text-[#123F2D]">{t(day.condition)}</p>
                            <p className="text-[11px] font-semibold text-[#527064]">{day.description}</p>
                          </div>
                        </div>

                        <p className="mt-3 text-xl font-black text-[#123F2D]">
                          {day.high}° <span className="text-sm font-medium text-[#527064]">/ {day.low}°C</span>
                        </p>

                        <p className="mt-1 text-xs font-bold text-[#0D6E48] flex items-center gap-1">
                          <Droplets className="h-3 w-3 text-blue-500 fill-blue-100" />
                          <span>{day.rainProb}% {t("rain prob.")}</span>
                        </p>
                      </div>

                      <div className="rounded-xl bg-emerald-50/80 p-2.5 border border-emerald-200/60">
                        <p className="text-[11px] leading-relaxed text-[#123F2D] font-semibold">{t(day.advisory)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </PageShell>
    </RoleGuard>
  );
}

export function CropCalendarPage() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(CROPS[0]?.name || "");
  const crop = CROPS.find((item) => item.name === selected) || CROPS[0];
  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "student", "seller", "admin"]} allowGuest={true}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=2000"
        eyebrow="Crop calendar"
        title="Season planner"
        intro="Select a crop to see its sowing window, harvest timing, and activity timeline."
      >
        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          <div className={glassCardClass}>
            {CROPS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setSelected(item.name)}
                className={`mb-2 block w-full rounded-lg px-3 py-2 text-left font-bold ${selected === item.name ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                {t(item.name)}
              </button>
            ))}
          </div>
          {crop ? (
            <div className={glassCardClass}>
              <p className="text-2xl font-black">
                {t(crop.name)} · {t(crop.season)}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                {[
                  ["Sowing", crop.sowing],
                  ["Harvest", crop.harvest],
                  ["Duration", crop.duration],
                  ["Water", crop.water],
                ].map(([a, b]) => (
                  <div key={a} className="rounded-lg bg-muted p-3">
                    <p className="text-xs font-bold uppercase text-muted-foreground">
                      {t(a ?? "")}
                    </p>
                    <p className="font-black">{t(b ?? "")}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-muted-foreground">{t(crop.tip)}</p>
              <div className="mt-6 grid gap-2 sm:grid-cols-5">
                {(crop.tasks || []).map((task, index) => (
                  <div key={task} className="rounded-lg border border-border p-3">
                    <p className="text-xs font-bold text-primary">
                      {t("Step")} {index + 1}
                    </p>
                    <p className="font-bold">{t(task)}</p>
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
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Agriculture");
  const [levelFilter, setLevelFilter] = useState("All Levels");
  const [selectedResourcesCourse, setSelectedResourcesCourse] = useState<Course | null>(null);

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("courseId");
    }
    return null;
  });

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const [completedLessons, setCompletedLessons] = useState<Record<string, string[]>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("purefarm_course_progress");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load course progress", e);
      }
    }
    return {};
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("purefarm_course_progress", JSON.stringify(completedLessons));
      } catch (e) {
        console.error("Failed to save course progress", e);
      }
    }
  }, [completedLessons]);

  const handleSelectCourse = (courseId: string | null) => {
    setSelectedCourseId(courseId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (courseId) {
        url.searchParams.set("courseId", courseId);
      } else {
        url.searchParams.delete("courseId");
      }
      window.history.pushState({}, "", url.toString());
    }

    if (courseId) {
      const courseLessons = AGRICULTURE_LESSONS.filter((l) => l.courseId === courseId);
      if (courseLessons.length > 0) {
        const courseCompleted = completedLessons[courseId] || [];
        const uncompleted = courseLessons.find((l) => !courseCompleted.includes(l.id));
        setSelectedLessonId(uncompleted ? uncompleted.id : (courseLessons[0]?.id ?? null));
      } else {
        setSelectedLessonId(null);
      }
    } else {
      setSelectedLessonId(null);
    }
  };

  const isLessonCompleted = (courseId: string, lessonId: string) => {
    return (completedLessons[courseId] || []).includes(lessonId);
  };

  const toggleLessonCompleted = (courseId: string, lessonId: string) => {
    setCompletedLessons((prev) => {
      const list = prev[courseId] || [];
      const updatedList = list.includes(lessonId)
        ? list.filter((id) => id !== lessonId)
        : [...list, lessonId];
      return { ...prev, [courseId]: updatedList };
    });
  };

  const getCourseProgressPct = (courseId: string) => {
    const courseLessons = AGRICULTURE_LESSONS.filter((l) => l.courseId === courseId);
    if (courseLessons.length === 0) return 0;
    const completedCount = (completedLessons[courseId] || []).length;
    return Math.round((completedCount / courseLessons.length) * 100);
  };

  const clearFilters = () => {
    setQuery("");
    setCategoryFilter("All Agriculture");
    setLevelFilter("All Levels");
  };

  if (selectedCourseId !== null) {
    const course = COURSES.find((c) => c.id === selectedCourseId);

    if (!course) {
      return (
        <RoleGuard
          allowedRoles={["farmer", "buyer", "student", "seller", "admin"]}
          allowGuest={true}
        >
          <PageShell
            eyebrow={t("Agriculture Learning")}
            title={t("Topic Not Found")}
            intro={t("The requested agriculture course could not be found.")}
          >
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-8 text-center space-y-4 max-w-lg mx-auto">
              <AlertTriangle className="h-12 w-12 text-amber-600 mx-auto" />
              <h2 className="text-xl font-black text-amber-900">{t("Topic Not Found")}</h2>
              <p className="text-sm text-amber-800">
                {t("The requested course could not be found or does not exist.")}
              </p>
              <button
                type="button"
                onClick={() => handleSelectCourse(null)}
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-sm font-bold transition shadow-md cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("Back to Agriculture Learning Hub")}
              </button>
            </div>
          </PageShell>
        </RoleGuard>
      );
    }

    const courseLessons = AGRICULTURE_LESSONS.filter((l) => l.courseId === course.id);
    const activeLessonIndex = courseLessons.findIndex((l) => l.id === selectedLessonId);
    const currentLesson =
      activeLessonIndex >= 0 ? courseLessons[activeLessonIndex] : courseLessons[0];
    const progressPct = getCourseProgressPct(course.id);

    return (
      <RoleGuard allowedRoles={["farmer", "buyer", "student", "seller", "admin"]} allowGuest={true}>
        <PageShell
          bgImage="https://upload.wikimedia.org/wikipedia/commons/f/fc/Farmer_working_in_the_field_with_their_tractor.jpg"
          eyebrow={t("Agriculture Education")}
          title={t(course.title)}
          intro={t(course.description ?? "")}
        >
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleSelectCourse(null)}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white/80 border border-white/60 text-[#1b4332] text-xs font-black hover:bg-white transition shadow-sm cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("Back to Agriculture Learning Hub")}
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {course.category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-[#1b4332] text-xs font-bold border border-emerald-300">
                    {t(course.category)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300">
                  <GraduationCap className="h-4 w-4" />
                  {t(course.level)}
                </span>
                {course.youtubeUrl && (
                  <a
                    href={course.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold shadow-xs hover:bg-red-700 transition"
                  >
                    <Video className="h-3.5 w-3.5" />
                    {t("Watch on YouTube")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* YouTube Educational Content Banner */}
            {course.youtubeUrl && (
              <div className="rounded-2xl border border-red-200 bg-red-50/90 backdrop-blur-md p-5 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-red-600 text-white shrink-0 shadow-sm">
                    <Video className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-100/80 px-2 py-0.5 rounded border border-red-200">
                      {t("Verified Educational Video")}
                    </span>
                    <h3 className="text-base font-black text-red-950 mt-1">
                      {t("Watch Course Video Resource on YouTube")}
                    </h3>
                    <p className="text-xs text-red-800 font-medium">
                      {t("Official channel resource:")} <span className="font-bold">{course.youtubeChannel ?? course.instructor}</span>
                    </p>
                  </div>
                </div>
                <a
                  href={course.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-md shrink-0 cursor-pointer"
                >
                  <Video className="h-4 w-4" />
                  {t("Watch on YouTube")}
                  <ExternalLink className="h-3.5 w-3.5 ml-0.5" />
                </a>
              </div>
            )}

            <div className="rounded-2xl border border-white/60 bg-white/90 backdrop-blur-md p-6 shadow-soft space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                  <h1 className="text-2xl font-black text-[#1b4332]">{t(course.title)}</h1>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">
                    {t(course.instructor)} · {course.hours} {t("hrs")} · {courseLessons.length}{" "}
                    {t("lessons")}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-muted-foreground font-bold">
                    {t("Overall Course Progress")}
                  </span>
                  <div className="text-xl font-black text-[#2d6a4f]">{progressPct}%</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="h-2.5 w-full rounded-full bg-emerald-100 overflow-hidden">
                  <div
                    className="h-full bg-[#2d6a4f] rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-4 rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md p-4 shadow-soft space-y-3">
                <h3 className="text-sm font-black text-[#1b4332] px-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  {t("Course Modules & Lessons")}
                </h3>
                <div className="space-y-2">
                  {courseLessons.map((l) => {
                    const completed = isLessonCompleted(course.id, l.id);
                    const isActive = currentLesson && currentLesson.id === l.id;

                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setSelectedLessonId(l.id)}
                        className={`w-full text-left p-3.5 rounded-xl transition flex items-start gap-3 border cursor-pointer ${
                          isActive
                            ? "bg-emerald-50/90 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30"
                            : completed
                              ? "bg-emerald-50/30 border-emerald-200/60 hover:bg-emerald-50/60 text-slate-700"
                              : "bg-white/60 border-transparent hover:bg-white/90 text-slate-700"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {completed ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-100" />
                          ) : isActive ? (
                            <div className="h-5 w-5 rounded-full border-2 border-emerald-600 bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">
                              {l.lessonNumber}
                            </div>
                          ) : (
                            <div className="h-5 w-5 rounded-full border border-slate-300 bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                              {l.lessonNumber}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            {t("Lesson")} {l.lessonNumber} · {t(l.duration)}
                          </p>
                          <h4
                            className={`text-xs font-black leading-snug ${isActive ? "text-[#1b4332]" : "text-slate-800"}`}
                          >
                            {t(l.title)}
                          </h4>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-8 rounded-2xl border border-white/60 bg-white/90 backdrop-blur-md p-6 shadow-soft space-y-6">
                {currentLesson ? (
                  <>
                    <div className="space-y-2 border-b border-border/60 pb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          {t("Lesson")} {currentLesson.lessonNumber} of {courseLessons.length}
                        </span>
                        <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {t(currentLesson.duration)}
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-[#1b4332] leading-tight">
                        {t(currentLesson.title)}
                      </h2>
                      <p className="text-xs font-medium text-muted-foreground italic bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                        {t(currentLesson.summary)}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-black text-[#1b4332] flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        {t("Overview & Field Guidance")}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white/80 p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                        {t(currentLesson.content)}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-black text-[#1b4332] flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        {t("Key Takeaways")}
                      </h3>
                      <ul className="space-y-2">
                        {currentLesson.keyPoints.map((pt, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 text-xs text-slate-800 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100"
                          >
                            <span className="h-2 w-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                            <span className="font-semibold leading-relaxed">{t(pt)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-emerald-300 bg-emerald-50/90 p-4 space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-xs font-black text-[#1b4332]">
                        <Leaf className="h-4 w-4 text-emerald-600 fill-emerald-200" />
                        {t("Practical Action & Pro Tip")}
                      </div>
                      <p className="text-xs text-[#1b4332] font-semibold leading-relaxed">
                        {t(currentLesson.farmingTip)}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <button
                        type="button"
                        disabled={activeLessonIndex <= 0}
                        onClick={() => {
                          const prevLesson = courseLessons[activeLessonIndex - 1];
                          if (prevLesson) setSelectedLessonId(prevLesson.id);
                        }}
                        className={`w-full sm:w-auto h-10 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                          activeLessonIndex <= 0
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                            : "bg-white text-[#1b4332] border-slate-300 hover:bg-slate-50 shadow-2xs"
                        }`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        {t("Previous Lesson")}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleLessonCompleted(course.id, currentLesson.id)}
                        className={`w-full sm:w-auto h-10 px-6 rounded-xl text-xs font-black transition shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                          isLessonCompleted(course.id, currentLesson.id)
                            ? "bg-emerald-700 text-white hover:bg-emerald-800"
                            : "bg-[#2d6a4f] text-white hover:bg-[#1b4332]"
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {isLessonCompleted(course.id, currentLesson.id)
                          ? t("Completed ✓")
                          : t("Mark as Complete")}
                      </button>

                      <button
                        type="button"
                        disabled={activeLessonIndex >= courseLessons.length - 1}
                        onClick={() => {
                          const nextLesson = courseLessons[activeLessonIndex + 1];
                          if (nextLesson) setSelectedLessonId(nextLesson.id);
                        }}
                        className={`w-full sm:w-auto h-10 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                          activeLessonIndex >= courseLessons.length - 1
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                            : "bg-white text-[#1b4332] border-slate-300 hover:bg-slate-50 shadow-2xs"
                        }`}
                      >
                        {t("Next Lesson")}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-xs font-semibold">
                    {t("Select a lesson to begin learning")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </PageShell>
      </RoleGuard>
    );
  }

  const agriCategoriesList = [
    "All Agriculture",
    "Farming Basics",
    "Soil & Fertility",
    "Crop Management",
    "Irrigation",
    "Pest & Disease",
    "Sustainable Farming",
    "AgriTech",
    "Post-Harvest",
    "Markets & Schemes",
    "University & CS",
  ];

  const levelsList = ["All Levels", "Beginner", "Intermediate", "Advanced"];

  const filtered = COURSES.filter((c) => {
    const resourcesText = c.youtubeResources
      ? c.youtubeResources.map((r) => `${r.title} ${r.channel} ${r.description}`).join(" ")
      : "";
    const searchString = `${t(c.title)} ${t(c.topic)} ${t(c.level)} ${c.category ?? ""} ${t(c.instructor)} ${t(c.description ?? "")} ${resourcesText}`
      .toLowerCase();
    const matchesQuery = !query.trim() || searchString.includes(query.toLowerCase());

    let matchesCategory = true;
    if (categoryFilter === "All Agriculture") {
      matchesCategory = c.category !== "University & CS";
    } else if (categoryFilter === "University & CS") {
      matchesCategory = c.category === "University & CS";
    } else {
      matchesCategory = c.category && c.category.toLowerCase() === categoryFilter.toLowerCase();
    }

    const matchesLevel = levelFilter === "All Levels" || c.level === levelFilter;

    return matchesQuery && matchesCategory && matchesLevel;
  });

  const hasActiveFilters = query.trim() !== "" || categoryFilter !== "All Agriculture" || levelFilter !== "All Levels";

  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "student", "seller", "admin"]} allowGuest={true}>
      <PageShell
        bgImage="https://upload.wikimedia.org/wikipedia/commons/f/fc/Farmer_working_in_the_field_with_their_tractor.jpg"
        eyebrow={t("Agriculture Education & Knowledge")}
        title={t("PureFarm Agriculture Learning Hub")}
        intro={t(
          "Learn practical farming skills, soil fertility, modern irrigation, pest management, crop planning, and agricultural technologies.",
        )}
      >
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("Search agriculture courses, soil guides, pest control...")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-9 rounded-xl border border-white/50 bg-white/80 backdrop-blur-md shadow-sm text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1 shrink-0 mr-1">
                <Filter className="h-3.5 w-3.5 text-emerald-700" />
                {t("Category:")}
              </span>
              {agriCategoriesList.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`h-9 px-3 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer ${
                    categoryFilter === cat
                      ? "bg-[#1b4332] text-white"
                      : "bg-white/80 border border-white/60 text-[#1b4332] hover:bg-white"
                  }`}
                >
                  {t(cat)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/40">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 shrink-0 mr-1">
                {t("Difficulty Level:")}
              </span>
              {levelsList.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevelFilter(lvl)}
                  className={`h-8 px-3 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    levelFilter === lvl
                      ? "bg-emerald-700 text-white"
                      : "bg-white/60 border border-white/50 text-slate-700 hover:bg-white"
                  }`}
                >
                  {t(lvl)}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50/80 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                {t("Clear All Filters")}
              </button>
            )}
          </div>
        </div>

        {/* Primary Catalog Header */}
        <div className="mb-4 flex items-center justify-between border-b border-emerald-900/10 pb-2">
          <h2 className="text-lg font-black text-[#1b4332] flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-emerald-600" />
            {categoryFilter === "University & CS"
              ? t("University & Technical Education Resources")
              : t("Agriculture & Farmer Education Courses")}
          </h2>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            {filtered.length} {t("Courses Available")}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md p-12 text-center space-y-4 max-w-md mx-auto shadow-soft">
            <BookOpen className="h-12 w-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-black text-[#1b4332]">{t("No Agriculture Courses Found")}</h3>
            <p className="text-xs text-muted-foreground">
              {t("No courses match your current search or category filter.")}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <X className="h-4 w-4" />
              {t("Clear All Filters")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => {
              const courseLessons = AGRICULTURE_LESSONS.filter((l) => l.courseId === c.id);
              const totalLessons = courseLessons.length > 0 ? courseLessons.length : c.lessons;
              const progressPct = getCourseProgressPct(c.id);
              const resourceCount = c.youtubeResources?.length || 0;

              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-white/60 bg-white/85 backdrop-blur-md p-5 shadow-soft flex flex-col justify-between space-y-4 hover:shadow-md transition"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        {c.category && (
                          <span className="inline-flex rounded-full bg-emerald-50 text-[#1b4332] px-2.5 py-0.5 text-[10px] font-bold border border-emerald-200">
                            {t(c.category)}
                          </span>
                        )}
                        <span className="inline-flex rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold border border-slate-200">
                          {t(c.level)}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-semibold">
                        {c.hours} {t("hrs")} · {totalLessons} {t("lessons")}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-[#1b4332] leading-snug">{t(c.title)}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {t(c.description ?? "")}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-border/60">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-muted-foreground truncate max-w-[60%]">{t(c.instructor)}</span>
                      <span className="text-[#2d6a4f] shrink-0">
                        {progressPct}% {t("completed")}
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-[#2d6a4f] rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {resourceCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => setSelectedResourcesCourse(c)}
                          className="h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Video className="h-3.5 w-3.5" />
                          {t("Learning Resources")}
                          <span className="ml-0.5 rounded-full bg-red-800/90 px-1.5 py-0.2 text-[10px] font-extrabold text-red-100">
                            {resourceCount}
                          </span>
                        </button>
                      ) : c.youtubeUrl ? (
                        <a
                          href={c.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Video className="h-3.5 w-3.5" />
                          {t("Watch YouTube")}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <div />
                      )}

                      <button
                        type="button"
                        onClick={() => handleSelectCourse(c.id)}
                        className={`h-10 rounded-xl ${
                          resourceCount > 0 || c.youtubeUrl
                            ? "bg-[#2d6a4f] hover:bg-[#1b4332]"
                            : "col-span-2 bg-[#2d6a4f] hover:bg-[#1b4332]"
                        } text-white text-xs font-black transition shadow-sm cursor-pointer flex items-center justify-center gap-1`}
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        {progressPct > 0 ? t("Continue") : t("Lessons")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Secondary Optional Section: University & Technical Education Resources */}
        {categoryFilter !== "University & CS" && (
          <div className="mt-12 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md p-6 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-3">
              <div>
                <h3 className="text-sm font-black text-[#1b4332] uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  {t("University & Technical Resources (Optional)")}
                </h3>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  {t("Access computer science, programming, and software engineering course links.")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCategoryFilter("University & CS")}
                className="h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                {t("View Technical & CS Resources")}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Video Learning Resources Modal */}
        {selectedResourcesCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="relative w-full max-w-2xl rounded-2xl border border-white/40 bg-white p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4 shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black border border-red-200 uppercase tracking-wide">
                      <Video className="h-3 w-3" />
                      {t("YouTube Learning Resources")}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {selectedResourcesCourse.youtubeResources?.length || 0} {t("Verified Videos")}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#1b4332] leading-snug">
                    {t(selectedResourcesCourse.title)}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {t(selectedResourcesCourse.description ?? "")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedResourcesCourse(null)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer shrink-0 ml-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Video List */}
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {selectedResourcesCourse.youtubeResources?.map((res, idx) => (
                  <div
                    key={res.id || idx}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:border-red-300 hover:bg-red-50/30 transition space-y-2 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-red-100 text-red-700 text-[10px] font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <h4 className="text-sm font-black text-slate-900 group-hover:text-red-700 transition leading-snug">
                            {res.title}
                          </h4>
                        </div>
                        <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 pl-7">
                          <span>{t("Channel:")} {res.channel}</span>
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed pl-7">
                          {res.description}
                        </p>
                      </div>

                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs shrink-0 cursor-pointer w-full sm:w-auto"
                      >
                        <Video className="h-3.5 w-3.5" />
                        {t("Watch on YouTube")}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedResourcesCourse(null)}
                  className="h-10 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  {t("Close")}
                </button>
              </div>
            </div>
          </div>
        )}
      </PageShell>
    </RoleGuard>
  );
}

export function CoursesPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const filtered = COURSES.filter((c) =>
    `${c.title} ${c.topic} ${c.level}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "student", "seller", "admin"]} allowGuest={true}>
      <PageShell
        eyebrow={t("Education")}
        title={t("Student Courses Catalog")}
        intro={t("Explore software development, Python, AI/ML, cloud, and modern tech courses.")}
      >
        <div className="mb-6 flex max-w-md items-center rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder={t("Search courses...")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex rounded-full bg-emerald-50 text-[#1b4332] px-2.5 py-0.5 text-[10px] font-bold border border-emerald-200">
                    {t(c.level)}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {c.hours} {t("hrs")} · {c.lessons} {t("lessons")}
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#1b4332] leading-snug">{t(c.title)}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(c.description ?? "")}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-border/60">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground">{t(c.instructor)}</span>
                  <span className="text-[#2d6a4f]">
                    {c.progress}% {t("completed")}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-[#2d6a4f] rounded-full transition-all duration-300"
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
                <button
                  type="button"
                  className="w-full h-10 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-black transition shadow-sm"
                >
                  {c.progress > 0 ? t("Continue Learning") : t("Start Course")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </PageShell>
    </RoleGuard>
  );
}

export function MyCoursesPage() {
  const { t } = useTranslation();
  return (
    <RoleGuard allowedRoles={["student", "admin"]}>
      <PageShell
        eyebrow="Dashboard"
        title="My Enrolled Courses"
        intro="Track ongoing learning progress across active tech and engineering courses."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COURSES.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                    {c.topic}
                  </span>
                  <h3 className="text-lg font-black text-[#1b4332]">{c.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.instructor} · {c.hours} hrs
                  </p>
                </div>
                <span className="text-xs font-bold text-[#2d6a4f] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {c.progress}% Complete
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-[#2d6a4f] rounded-full"
                  style={{ width: `${c.progress}%` }}
                />
              </div>
              <button
                type="button"
                className="w-full h-10 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-black transition shadow-sm"
              >
                Continue Module →
              </button>
            </div>
          ))}
        </div>
      </PageShell>
    </RoleGuard>
  );
}

export function MyApplicationsPage() {
  const { t } = useTranslation();
  const sampleApps = [
    {
      title: "AgriTech Field Operations Intern",
      org: "PureFarm Agri Services",
      location: "Rajahmundry",
      stipend: "₹10,000/month",
      status: "In Review",
      date: "Applied 2 days ago",
    },
    {
      title: "Smart Farming & Drone Intern",
      org: "AgriTech Innovations",
      location: "Hyderabad",
      stipend: "₹15,000/month",
      status: "Shortlisted",
      date: "Applied 1 week ago",
    },
  ];

  return (
    <RoleGuard allowedRoles={["student", "farmer", "buyer", "seller", "admin"]} allowGuest={true}>
      <PageShell
        eyebrow={t("Career")}
        title={t("My Internship Applications")}
        intro={t("Review status and progress of your submitted internship applications.")}
      >
        <div className="space-y-4">
          {sampleApps.map((app, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft flex items-center justify-between"
            >
              <div>
                <h3 className="text-base font-black text-[#1b4332]">{t(app.title)}</h3>
                <p className="text-xs font-bold text-[#2d6a4f] mt-0.5">
                  {t(app.org)} · {t(app.location)} · {t(app.stipend)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">{t(app.date)}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${app.status === "Shortlisted" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"}`}
              >
                {t(app.status)}
              </span>
            </div>
          ))}
        </div>
      </PageShell>
    </RoleGuard>
  );
}

export function CertificatesPage() {
  const { t } = useTranslation();
  const sampleCertificates = [
    { title: "Modern Farming & Soil Fertility", date: "Issued Aug 2026", id: "CERT-9042" },
    { title: "Precision AgriTech & Drone Spraying", date: "Issued Jul 2026", id: "CERT-8104" },
  ];

  return (
    <RoleGuard allowedRoles={["student", "farmer", "buyer", "seller", "admin"]} allowGuest={true}>
      <PageShell
        eyebrow={t("Achievements")}
        title={t("My Certificates")}
        intro={t("View and download verified completion certificates.")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sampleCertificates.map((cert, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-3"
            >
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-amber-500 shrink-0" />
                <div>
                  <h3 className="text-base font-black text-[#1b4332]">{t(cert.title)}</h3>
                  <p className="text-xs text-muted-foreground">
                    {t(cert.date)} · {cert.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="w-full h-9 rounded-xl border border-border bg-muted/30 hover:bg-muted text-xs font-bold text-[#1b4332] transition cursor-pointer"
              >
                {t("Download Certificate (PDF)")}
              </button>
            </div>
          ))}
        </div>
      </PageShell>
    </RoleGuard>
  );
}

export function InternshipsPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Internships");

  const [selectedInternshipId, setSelectedInternshipId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("internshipId");
    }
    return null;
  });

  const [appliedIds, setAppliedIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("purefarm_applied_internships");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load applied internships", e);
      }
    }
    return [];
  });

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({ name: "", phone: "", notes: "" });
  const [submittedMessage, setSubmittedMessage] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("purefarm_applied_internships", JSON.stringify(appliedIds));
      } catch (e) {
        console.error("Failed to save applied internships", e);
      }
    }
  }, [appliedIds]);

  const handleSelectInternship = (id: string | null) => {
    setSelectedInternshipId(id);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (id) {
        url.searchParams.set("internshipId", id);
      } else {
        url.searchParams.delete("internshipId");
      }
      window.history.pushState({}, "", url.toString());
    }
  };

  const handleApplySubmit = (e: React.FormEvent, internshipId: string) => {
    e.preventDefault();
    if (!appliedIds.includes(internshipId)) {
      setAppliedIds((prev) => [...prev, internshipId]);
    }
    setSubmittedMessage(true);
    setTimeout(() => {
      setShowApplyModal(false);
      setSubmittedMessage(false);
      setApplyForm({ name: "", phone: "", notes: "" });
    }, 1800);
  };

  if (selectedInternshipId !== null) {
    const internship = INTERNSHIPS.find((item) => item.id === selectedInternshipId);

    if (!internship) {
      return (
        <RoleGuard
          allowedRoles={["farmer", "buyer", "student", "seller", "admin"]}
          allowGuest={true}
        >
          <PageShell
            eyebrow={t("Internships")}
            title={t("Internship Not Found")}
            intro={t("The requested internship could not be found.")}
          >
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-8 text-center space-y-4 max-w-lg mx-auto">
              <AlertTriangle className="h-12 w-12 text-amber-600 mx-auto" />
              <h2 className="text-xl font-black text-amber-900">{t("Internship Not Found")}</h2>
              <p className="text-sm text-amber-800">
                {t("The requested internship could not be found.")}
              </p>
              <button
                type="button"
                onClick={() => handleSelectInternship(null)}
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-sm font-bold transition shadow-md cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("Back to Internships")}
              </button>
            </div>
          </PageShell>
        </RoleGuard>
      );
    }

    const isApplied = appliedIds.includes(internship.id);

    return (
      <RoleGuard allowedRoles={["farmer", "buyer", "student", "seller", "admin"]} allowGuest={true}>
        <PageShell
          bgImage="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=2000"
          eyebrow={t("Internships")}
          title={t(internship.title)}
          intro={`${t(internship.org)} · ${t(internship.location)}`}
        >
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleSelectInternship(null)}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white/80 border border-white/60 text-[#1b4332] text-xs font-black hover:bg-white transition shadow-sm cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("Back to Internships")}
              </button>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#1b4332] text-xs font-bold border border-emerald-300">
                <Briefcase className="h-4 w-4 text-emerald-700" />
                {t(internship.category ?? "Field Work")}
              </span>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/90 backdrop-blur-md p-6 shadow-soft space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/60 pb-4">
                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-[#1b4332]">{t(internship.title)}</h1>
                  <p className="text-sm font-bold text-[#2d6a4f]">
                    {t(internship.org)} · {t(internship.type)}
                  </p>
                  <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                    {t(internship.location)}
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="inline-block rounded-full bg-amber-50 text-amber-800 px-4 py-1.5 text-sm font-black border border-amber-200 shadow-2xs">
                    {t(internship.stipend)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                <div>
                  <span className="text-muted-foreground font-semibold block">{t("Duration")}</span>
                  <span className="font-bold text-[#1b4332]">
                    {t(internship.duration ?? "3 Months")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold block">{t("Posted")}</span>
                  <span className="font-bold text-[#1b4332]">{t(internship.posted)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold block">{t("Deadline")}</span>
                  <span className="font-bold text-amber-700">{t(internship.deadline ?? "")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold block">{t("Location")}</span>
                  <span className="font-bold text-[#1b4332]">{t(internship.location)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-black text-[#1b4332] flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  {t("Overview & Role Description")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white/80 p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  {t(internship.description ?? "")}
                </p>
              </div>

              {internship.responsibilities && internship.responsibilities.length > 0 ? (
                <div className="space-y-2.5 pt-2">
                  <h3 className="text-sm font-black text-[#1b4332] flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {t("Key Responsibilities")}
                  </h3>
                  <ul className="space-y-2">
                    {internship.responsibilities.map((resp, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-slate-800 bg-white/70 p-3 rounded-xl border border-slate-200/60"
                      >
                        <span className="h-2 w-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                        <span className="font-semibold leading-relaxed">{t(resp)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {internship.eligibility ? (
                <div className="space-y-2 pt-2">
                  <h3 className="text-sm font-black text-[#1b4332] flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    {t("Eligibility & Requirements")}
                  </h3>
                  <p className="text-xs text-slate-800 font-semibold bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
                    {t(internship.eligibility)}
                  </p>
                </div>
              ) : null}

              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-black text-[#1b4332]">{t("Required Skills")}</h3>
                <div className="flex flex-wrap gap-2">
                  {internship.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-emerald-100/80 text-[#1b4332] px-3 py-1 text-xs font-bold border border-emerald-200"
                    >
                      {t(skill)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-border/60 flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground font-semibold">
                  {t("Deadline")}:{" "}
                  <strong className="text-slate-800">{t(internship.deadline ?? "")}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => setShowApplyModal(true)}
                  disabled={isApplied}
                  className={`h-11 px-6 rounded-xl text-xs font-black transition shadow-md flex items-center gap-2 cursor-pointer ${
                    isApplied
                      ? "bg-emerald-700 text-white cursor-not-allowed"
                      : "bg-[#2d6a4f] hover:bg-[#1b4332] text-white"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isApplied ? t("Application Submitted ✓") : t("Apply Now")}
                </button>
              </div>
            </div>

            {showApplyModal ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                <div className="bg-white rounded-2xl border border-white/60 max-w-md w-full p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <h3 className="text-lg font-black text-[#1b4332]">{t("Application Form")}</h3>
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="text-muted-foreground hover:text-slate-900 text-sm font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {submittedMessage ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                      <p className="text-xs font-black text-emerald-900">
                        {t("Your application has been submitted successfully!")}
                      </p>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => handleApplySubmit(e, internship.id)}
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {t("Full Name")}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={t("Full Name")}
                          value={applyForm.name}
                          onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                          className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {t("Mobile Number")}
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder={t("Mobile Number")}
                          value={applyForm.phone}
                          onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                          className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {t("Brief Introduction / Cover Note")}
                        </label>
                        <textarea
                          rows={3}
                          placeholder={t("Brief Introduction / Cover Note")}
                          value={applyForm.notes}
                          onChange={(e) => setApplyForm({ ...applyForm, notes: e.target.value })}
                          className="w-full p-3 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowApplyModal(false)}
                          className="h-10 px-4 rounded-xl border border-slate-300 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="h-10 px-6 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-black shadow-sm cursor-pointer"
                        >
                          {t("Submit My Application")}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </PageShell>
      </RoleGuard>
    );
  }

  const filterCategories = [
    "All Internships",
    "Field Work",
    "Research",
    "Agritech",
    "Horticulture",
    "Livestock",
    "Food Processing",
    "Organic Farming",
  ];

  const filtered = INTERNSHIPS.filter((i) => {
    const matchesQuery =
      `${t(i.title)} ${t(i.org)} ${t(i.location)} ${t(i.description ?? "")} ${i.skills.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase());

    const matchesCategory = categoryFilter === "All Internships" || i.category === categoryFilter;

    return matchesQuery && matchesCategory;
  });

  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "student", "seller", "admin"]} allowGuest={true}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=2000"
        eyebrow={t("Internships")}
        title={t("Agriculture Internship Hub")}
        intro={t(
          "Explore internships in agriculture, agritech, farming, horticulture, livestock, food processing, and rural development.",
        )}
      >
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("Search internships...")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/50 bg-white/80 backdrop-blur-md shadow-sm text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filterCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`h-10 px-4 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                    categoryFilter === cat
                      ? "bg-[#1b4332] text-white"
                      : "bg-white/80 border border-white/60 text-[#1b4332] hover:bg-white"
                  }`}
                >
                  {t(cat)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((i) => {
            const isApplied = appliedIds.includes(i.id);

            return (
              <div
                key={i.id}
                className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md p-6 shadow-soft space-y-4 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-[#1b4332] leading-snug">
                        {t(i.title)}
                      </h3>
                      <p className="text-xs font-bold text-[#2d6a4f] mt-0.5">
                        {t(i.org)} · {t(i.type)} ({t(i.location)})
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-50 text-amber-800 px-3 py-1 text-xs font-black border border-amber-200 shadow-2xs">
                      {t(i.stipend)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t(i.description ?? "")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {i.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-emerald-50 text-[#1b4332] px-2.5 py-1 text-[11px] font-bold border border-emerald-200"
                      >
                        {t(skill)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-border/60 mt-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    {t("Deadline")}: {t(i.deadline ?? "")}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectInternship(i.id)}
                    className={`rounded-xl px-4 py-2 text-xs font-black transition shadow-sm cursor-pointer ${
                      isApplied
                        ? "bg-emerald-700 text-white hover:bg-emerald-800"
                        : "bg-[#2d6a4f] hover:bg-[#1b4332] text-white"
                    }`}
                  >
                    {isApplied ? t("Application Submitted ✓") : t("Apply Now")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </PageShell>
    </RoleGuard>
  );
}

export function NotificationsPage() {
  const { language, t } = useTranslation();
  const isTelugu = language === "te";
  const [items, setItems] = useState(NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const unreadCount = items.filter((n) => !n.read).length;

  const filteredItems = items.filter((item) => {
    if (filter === "unread" && item.read) return false;
    if (filter === "read" && !item.read) return false;
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    return true;
  });

  const toggleAllRead = () => {
    const hasUnread = items.some((n) => !n.read);
    setItems((current) => current.map((n) => ({ ...n, read: hasUnread })));
  };

  const categories = ["all", "Market", "Weather", "Schemes", "Orders", "Advisory"];

  const introText = isTelugu
    ? `మార్కెట్, వాతావరణం, పథకాలు మరియు ఆర్డర్లకు సంబంధించిన ${unreadCount} చదవని హెచ్చరికలు.`
    : `${unreadCount} unread advisories across market, weather, schemes, and orders.`;

  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "student", "seller", "admin"]} allowGuest={true}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000"
        darkOverlay={true}
        eyebrow="Notifications"
        title="Agricultural Advisories"
        intro={introText}
      >
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header Controls & Filter Bar */}
          <div className="flex flex-col gap-4 rounded-2xl border border-emerald-500/20 bg-[#0E271F]/90 p-4 sm:p-5 shadow-lg backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/40 pb-3.5">
              {/* Filter Tabs: All, Unread, Read */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                    filter === "all"
                      ? "bg-[#10B981] text-white shadow-md shadow-emerald-950/40"
                      : "bg-emerald-950/60 text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white"
                  }`}
                >
                  {isTelugu ? "అన్నీ" : "All"} ({items.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("unread")}
                  className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                    filter === "unread"
                      ? "bg-[#10B981] text-white shadow-md shadow-emerald-950/40"
                      : "bg-emerald-950/60 text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white"
                  }`}
                >
                  {isTelugu ? "చదవనివి" : "Unread"}
                  {unreadCount > 0 && (
                    <span className="ml-2 rounded-full bg-emerald-400 px-2 py-0.5 text-xs font-bold text-slate-950">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("read")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                    filter === "read"
                      ? "bg-[#10B981] text-white shadow-md shadow-emerald-950/40"
                      : "bg-emerald-950/60 text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white"
                  }`}
                >
                  {isTelugu ? "చదివినవి" : "Read"} ({items.length - unreadCount})
                </button>
              </div>

              {/* Mark All Action Button */}
              <button
                type="button"
                onClick={toggleAllRead}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-900/40 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-emerald-300 transition-all hover:bg-emerald-800/60 hover:text-white"
              >
                {unreadCount > 0
                  ? isTelugu
                    ? "అన్నీ చదివినట్లుగా గుర్తించండి"
                    : "Mark all as read"
                  : isTelugu
                    ? "అన్నీ చదవనట్లుగా గుర్తించండి"
                    : "Mark all as unread"}
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400/80 mr-1">
                {isTelugu ? "వర్గాలు:" : "Categories:"}
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                    categoryFilter === cat
                      ? "bg-emerald-600/40 border border-emerald-400/50 text-emerald-200"
                      : "bg-emerald-950/40 border border-emerald-900/40 text-emerald-300/70 hover:bg-emerald-900/40 hover:text-emerald-200"
                  }`}
                >
                  {cat === "all" ? (isTelugu ? "అన్నీ" : "All") : t(cat)}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-[#0E271F]/80 p-8 text-center shadow-lg">
              <Bell className="mx-auto h-12 w-12 text-emerald-500/40" />
              <p className="mt-3 text-lg font-bold text-emerald-200">
                {isTelugu ? "నోటిఫికేషన్లు ఏవీ లేవు" : "No notifications found"}
              </p>
              <p className="mt-1 text-sm text-emerald-300/70">
                {isTelugu
                  ? "ఎంచుకున్న ఫిల్టర్‌కు సంబంధించిన హెచ్చరికలు లేవు."
                  : "There are no notifications matching your selected filter."}
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {filteredItems.map((item) => (
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
          )}
        </div>
      </PageShell>
    </RoleGuard>
  );
}

function NotificationRow({ item, onToggle }: { item: NotificationItem; onToggle: () => void }) {
  const { language, t } = useTranslation();
  const isTelugu = language === "te";

  // Category specific accent colors for badge
  const categoryBadgeClass =
    item.category === "Market"
      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
      : item.category === "Weather"
        ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
        : item.category === "Schemes"
          ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
          : item.category === "Orders"
            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
            : "bg-teal-500/20 text-teal-300 border-teal-500/40";

  return (
    <div
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onToggle();
        }
      }}
      className={`group relative block w-full rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
        isTelugu ? "p-6 sm:p-7" : "p-5 sm:p-6"
      } ${
        item.read
          ? "bg-[#0E271F] border-emerald-900/40 border-l-4 border-l-emerald-800/40 hover:bg-[#123329]"
          : "bg-[#143B2F] border-emerald-500/30 border-l-4 border-l-[#10B981] shadow-lg shadow-emerald-950/60 hover:bg-[#194739]"
      }`}
    >
      <div className="flex items-start gap-4 sm:gap-5">
        {/* Bell Icon Container */}
        <div
          className={`mt-0.5 flex-shrink-0 rounded-full p-3 transition-colors ${
            item.read
              ? "bg-emerald-950/70 border border-emerald-800/40 text-emerald-500/60"
              : "bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] group-hover:bg-[#10B981]/30 shadow-sm shadow-emerald-900/30"
          }`}
        >
          <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>

        {/* Content Container */}
        <div className="min-w-0 flex-1">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div className="flex flex-wrap items-center gap-2.5 min-w-0">
              <h3
                className={`font-bold transition-colors ${
                  item.read ? "text-emerald-100/90" : "text-white"
                } ${
                  isTelugu
                    ? "text-lg sm:text-[21px] leading-[1.5]"
                    : "text-base sm:text-[18px] leading-snug"
                }`}
              >
                {t(item.title)}
              </h3>
              {!item.read && (
                <span className="inline-block h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              )}
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <span
                className={`inline-flex items-center rounded-full font-semibold border ${categoryBadgeClass} ${
                  isTelugu ? "px-3 py-1 text-[13.5px]" : "px-2.5 py-0.5 text-xs"
                }`}
              >
                {t(item.category || item.tone)}
              </span>
              <span
                className={`text-emerald-300/70 font-medium ${
                  isTelugu ? "text-[13px]" : "text-xs"
                }`}
              >
                {t(item.time)}
              </span>
            </div>
          </div>

          {/* Description Body */}
          <p
            className={`mt-2.5 transition-colors ${
              item.read ? "text-emerald-300/70" : "text-emerald-100/95"
            } ${
              isTelugu
                ? "text-base sm:text-[17px] leading-[1.65]"
                : "text-sm sm:text-[15px] leading-relaxed"
            }`}
          >
            {t(item.body)}
          </p>

          {/* Bottom Card Footer Status */}
          <div className="mt-3.5 flex items-center justify-between border-t border-emerald-800/30 pt-2.5">
            <span
              className={`text-xs font-semibold ${
                item.read ? "text-emerald-400/60" : "text-[#10B981]"
              }`}
            >
              {item.read
                ? isTelugu
                  ? "✓ చదివినది"
                  : "✓ Read"
                : isTelugu
                  ? "● క్రొత్త హెచ్చరిక"
                  : "● New Advisory"}
            </span>
            <span className="text-xs text-emerald-400/70 transition-colors group-hover:text-emerald-300 group-hover:underline underline-offset-2">
              {item.read
                ? isTelugu
                  ? "చదవనట్లుగా మార్చండి"
                  : "Mark as unread"
                : isTelugu
                  ? "చదివినట్లుగా మార్చండి"
                  : "Mark as read"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AboutPage() {
  const { t } = useTranslation();
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
              {t(
                "A cohesive experience for ordering, planning, learning, and contacting advisors.",
              )}
            </p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export function SupportPage() {
  const { t } = useTranslation();
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
  const { t } = useTranslation();
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
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isEmail = (val: string) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(val);
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

    const res = await login(phoneOrEmail, password);
    if (res.success) {
      let dest = "/";
      if (res.role === "admin") dest = "/admin";
      else if (res.role === "seller") dest = "/seller";
      else dest = "/";

      void navigate({ to: dest as "/" });
    } else {
      setErrorMessage(res.error || "Invalid credentials. Please verify your email and password.");
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
          <div className="h-11 w-11 rounded-2xl overflow-hidden bg-[#f7f4ed] border border-white/40 shadow-md group-hover:scale-105 transition duration-200 flex items-center justify-center p-0.5">
            <img
              src="/images/pure-farm-logo.png"
              alt="Pure Farm"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <span className="block text-lg font-extrabold text-[#FFFFFF] drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] leading-none">
              Pure Farm
            </span>
            <span className="block text-[9px] font-bold text-[#E8F5EE] tracking-wider uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] mt-1">
              {t("Agri Portal")}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSelector />
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass-btn-google-white text-[#FFFFFF] text-xs font-extrabold transition shadow-sm hover:scale-105"
          >
            <span>{t("Explore Marketplace")}</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#B7F34A]" />
          </Link>
        </div>
      </header>

      {/* Main Center Area with Translucent Glassmorphism Login Card */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT SIDE: Decorative Floating Smart Farming Badges */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 animate-subtle-float-1">
            <div className="glass-card-dark p-4 rounded-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#19C37D]/20 text-[#19C37D] border border-[#19C37D]/40 shadow-[0_0_12px_rgba(25,195,125,0.3)]">
                  <Cpu className="h-5 w-5 text-[#19C37D]" />
                </span>
                <div>
                  <h4 className="text-sm font-extrabold text-[#FFFFFF]">Smart Farming</h4>
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
                  <h4 className="text-sm font-extrabold text-[#FFFFFF]">Water Efficient</h4>
                  <p className="text-xs font-medium text-[#E8F5EE]">{t("Every drop counts")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER: Login Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md glass-card-dark p-6 sm:p-8 rounded-3xl border border-white/30 shadow-2xl">
              <div className="text-center mb-6">
                <div className="inline-flex justify-center mb-3">
                  <div className="h-16 w-16 rounded-2xl overflow-hidden bg-[#f7f4ed] shadow-lg border border-white/30 flex items-center justify-center p-0.5">
                    <img
                      src="/images/pure-farm-logo.png"
                      alt="Pure Farm"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Sign In to PureFarm</h2>
                <p className="text-xs text-white/80 mt-1.5">
                  {t("Enter your account credentials to access your dashboard")}
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white block">Email Address</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={phoneOrEmail}
                      onChange={(e) => setPhoneOrEmail(e.target.value)}
                      placeholder="farmer@purefarm.test, buyer@purefarm.test, or student@purefarm.test"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/20 border border-white/30 text-white placeholder:text-white/60 text-sm outline-none focus:border-[#19C37D] transition"
                    />
                    <User className="h-4 w-4 text-white/70 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full h-11 pl-10 pr-11 rounded-xl bg-white/20 border border-white/30 text-white placeholder:text-white/60 text-sm outline-none focus:border-[#19C37D] transition"
                    />
                    <Lock className="h-4 w-4 text-white/70 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-white/70 hover:text-white text-xs font-bold"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isValid || loading}
                  className="w-full h-12 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? "Signing in..." : "Sign In"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Demo Credentials Quick Fill */}
              <div className="mt-5 pt-3 border-t border-white/20">
                <p className="text-[11px] font-semibold text-white/70 text-center mb-2">
                  Quick Demo Accounts:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => handleDemoFill("farmer@purefarm.test")}
                    className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition"
                  >
                    Farmer Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoFill("buyer@purefarm.test")}
                    className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition"
                  >
                    {t("Buyer Demo")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoFill("student@purefarm.test")}
                    className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition"
                  >
                    {t("Student Demo")}
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 text-center">
                <p className="text-xs text-white/80">
                  Don't have an account?{" "}
                  <Link to="/register" className="font-bold text-[#19C37D] hover:underline">
                    Create Account
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Decorative Badges */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 animate-subtle-float-2">
            <div className="glass-card-dark p-4 rounded-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#19C37D]/20 text-[#19C37D] border border-[#19C37D]/40 shadow-[0_0_12px_rgba(25,195,125,0.3)]">
                  <ShieldCheck className="h-5 w-5 text-[#19C37D]" />
                </span>
                <div>
                  <h4 className="text-sm font-extrabold text-[#FFFFFF]">Verified Quality</h4>
                  <p className="text-xs font-medium text-[#E8F5EE]">{t("100% Certified")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState<"farmer" | "buyer" | "student">("farmer");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isPhone = (val: string) => /^\d{10}$/.test(val);

  const isValid = useMemo(() => {
    return name.trim().length >= 3 && isEmail(email) && isPhone(phone) && password.length >= 6;
  }, [name, email, phone, password]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setErrorMessage("");

    const res = await signup({
      name,
      email,
      phone,
      password,
      role,
      location,
    });

    if (res.success) {
      void navigate({ to: "/" });
    } else {
      setErrorMessage(res.error || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center overflow-hidden font-sans">
      {/* 1. FULL-SCREEN AGRICULTURE BACKGROUND */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://upload.wikimedia.org/wikipedia/commons/5/56/Two_farmers_driving_a_tractor_towing_a_raft_loaded_with_green_rice_sheaves_in_a_paddy_field_of_Vang_Vieng_Laos.jpg)",
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(0, 35, 25, 0.35)" }} />
      </div>

      {/* Top Left Branding */}
      <div className="absolute top-6 left-6 lg:top-10 lg:left-12 z-10 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl overflow-hidden bg-[#f7f4ed] border border-white/30 shadow-lg flex items-center justify-center p-0.5">
            <img
              src="/images/pure-farm-logo.png"
              alt="Pure Farm"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <span className="block text-2xl font-black tracking-wide leading-none text-white drop-shadow-md">
              PureFarm
            </span>
            <span className="block text-[10px] font-bold text-white uppercase tracking-widest leading-none mt-1.5 drop-shadow-md">
              Connect • Grow • Prosper
            </span>
          </div>
        </Link>
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center justify-between p-6 lg:p-12 mt-20 lg:mt-0">
        {/* LEFT-SIDE CONTENT */}
        <div className="w-full lg:w-1/2 text-white mb-10 lg:mb-0 lg:pr-12 hidden md:block">
          <h2 className="text-4xl lg:text-6xl font-bold leading-tight drop-shadow-lg mb-6 text-white">
            Join the Digital
            <br />
            Agri Revolution
          </h2>
          <p className="text-lg text-white/90 leading-relaxed max-w-md mb-8 drop-shadow-md">
            Register your profile to access mandi prices, direct produce sales, certified inputs,
            courses, and internships.
          </p>

          <div className="space-y-4">
            <div
              className="flex items-center gap-4 p-4 max-w-sm"
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "18px",
              }}
            >
              <div className="p-2">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{t("Direct Market Access")}</h4>
                <p className="text-white/80 text-xs">Sell harvest at transparent mandi prices</p>
              </div>
            </div>

            <div
              className="flex items-center gap-4 p-4 max-w-sm"
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "18px",
              }}
            >
              <div className="p-2">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Verified Agri Inputs</h4>
                <p className="text-white/80 text-xs">Quality seeds, fertilizers and equipment</p>
              </div>
            </div>
          </div>
        </div>

        {/* CREATE ACCOUNT PANEL */}
        <div className="w-full lg:w-[500px] max-w-[90vw] lg:ml-auto">
          <div
            style={{
              background: "rgba(255, 255, 255, 0.16)",
              backdropFilter: "blur(25px) saturate(140%)",
              border: "1px solid rgba(255, 255, 255, 0.45)",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.25)",
              borderRadius: "28px",
            }}
            className="py-8 px-6 sm:px-10"
          >
            <div className="mb-6 text-center">
              <div className="inline-flex justify-center mb-3">
                <div className="h-16 w-16 rounded-2xl overflow-hidden bg-[#f7f4ed] shadow-md border border-[#2d6a4f]/20 flex items-center justify-center p-0.5">
                  <img
                    src="/images/pure-farm-logo.png"
                    alt="Pure Farm"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-[#073B2A] drop-shadow-sm">
                Create Account
              </h3>
              <p className="text-xs font-semibold text-[#164F3C] mt-1">
                {t("Choose your role to get started with PureFarm")}
              </p>
            </div>

            {/* 3-Way Role Selector Tabs */}
            <div className="mb-5 grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-white/30 border border-white/40">
              <button
                type="button"
                onClick={() => setRole("farmer")}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                  role === "farmer"
                    ? "bg-[#087F5B] text-white shadow-md"
                    : "text-[#073B2A] hover:bg-white/20"
                }`}
              >
                <Sprout className="h-3.5 w-3.5" />
                <span>Farmer</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("buyer")}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                  role === "buyer"
                    ? "bg-[#087F5B] text-white shadow-md"
                    : "text-[#073B2A] hover:bg-white/20"
                }`}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Buyer</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                  role === "student"
                    ? "bg-[#087F5B] text-white shadow-md"
                    : "text-[#073B2A] hover:bg-white/20"
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Student</span>
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-900 text-xs font-bold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#073B2A] block">{t("Full Name")}</label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full h-11 px-3.5 rounded-xl bg-white/40 border border-white/60 text-[#082F25] placeholder:text-[#082F25]/60 text-sm outline-none focus:border-[#087F5B] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#073B2A] block">Email Address</label>
                  <input
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@example.com"
                    className="w-full h-11 px-3.5 rounded-xl bg-white/40 border border-white/60 text-[#082F25] placeholder:text-[#082F25]/60 text-sm outline-none focus:border-[#087F5B] transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#073B2A] block">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    disabled={loading}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full h-11 px-3.5 rounded-xl bg-white/40 border border-white/60 text-[#082F25] placeholder:text-[#082F25]/60 text-sm outline-none focus:border-[#087F5B] transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#073B2A] block">
                  Location (City, State)
                </label>
                <input
                  type="text"
                  disabled={loading}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Rajahmundry, Andhra Pradesh"
                  className="w-full h-11 px-3.5 rounded-xl bg-white/40 border border-white/60 text-[#082F25] placeholder:text-[#082F25]/60 text-sm outline-none focus:border-[#087F5B] transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#073B2A] block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full h-11 pl-3.5 pr-14 rounded-xl bg-white/40 border border-white/60 text-[#082F25] placeholder:text-[#082F25]/60 text-sm outline-none focus:border-[#087F5B] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-xs font-bold text-[#087F5B] hover:text-[#073B2A]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isValid || loading}
                className="w-full h-12 rounded-xl bg-[#087F5B] hover:bg-[#073B2A] text-white font-bold text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {loading ? "Creating Profile..." : "Complete Registration"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <div className="text-center text-xs font-bold mt-5 text-[#082F25]">
              Already have an account?{" "}
              <Link to="/login" className="text-[#087F5B] hover:underline font-extrabold">
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
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<DbProduct | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [farmerOrders, setFarmerOrders] = useState<OrderWithItems[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "grains" as ProductCategory,
    price: "",
    quantity: "",
    available_quantity: "",
    unit: "kg",
    location: user?.location || "Andhra Pradesh, India",
    harvest_date: "",
    image_url: "",
    description: "",
    status: "available" as ProductStatus,
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchFarmerProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getFarmerProducts(user.id);
      setProducts(data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load products:", err);
      setError(err.message || "Failed to load seller products.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmerOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const data = await getOrdersByFarmer(user.id);
      setFarmerOrders(data);
    } catch (err: any) {
      console.error("Failed to load farmer orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "farmer") {
      fetchFarmerProducts();
      fetchFarmerOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      title: "",
      category: "grains",
      price: "",
      quantity: "",
      available_quantity: "",
      unit: "kg",
      location: (user?.location || "Andhra Pradesh, India") as string,
      harvest_date: (new Date().toISOString().split("T")[0] || "") as string,
      image_url: "",
      description: "",
      status: "available",
    });
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: DbProduct) => {
    setEditingProduct(product);
    setFormData({
      title: product.name || (product as any).title || "",
      category: product.category,
      price: String(product.price),
      quantity: String(product.quantity),
      available_quantity: String(product.available_quantity),
      unit: product.unit || "kg",
      location: (product.location || "") as string,
      harvest_date: (product.harvest_date
        ? product.harvest_date.split("T")[0] || ""
        : "") as string,
      image_url: product.image_url || "",
      description: product.description || "",
      status: product.status || "available",
    });
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!user) {
      setFormError("You must be logged in as a farmer to save products.");
      return;
    }

    // Validation
    const title = formData.title.trim();
    if (!title) {
      setFormError("Product title is required.");
      return;
    }

    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError("Price per unit must be greater than 0.");
      return;
    }

    const totalQtyNum = Number(formData.quantity);
    if (isNaN(totalQtyNum) || totalQtyNum <= 0) {
      setFormError("Total quantity must be greater than 0.");
      return;
    }

    const availQtyNum = Number(formData.available_quantity || formData.quantity);
    if (isNaN(availQtyNum) || availQtyNum < 0) {
      setFormError("Available quantity cannot be negative.");
      return;
    }

    if (availQtyNum > totalQtyNum) {
      setFormError("Available quantity cannot exceed total quantity.");
      return;
    }

    const locationStr = formData.location.trim();
    if (!locationStr) {
      setFormError("Location is required.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: title,
        category: formData.category,
        price: priceNum,
        quantity: totalQtyNum,
        available_quantity: availQtyNum,
        unit: formData.unit || "kg",
        location: locationStr,
        harvest_date: formData.harvest_date ? new Date(formData.harvest_date).toISOString() : null,
        image_url: formData.image_url.trim() || null,
        description: formData.description.trim() || null,
        status: formData.status,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        setFormSuccess("Product updated successfully!");
      } else {
        await createProduct({
          ...payload,
          farmer_id: user.id,
        });
        setFormSuccess("Product created successfully!");
      }

      await fetchFarmerProducts();
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitting(false);
      }, 500);
    } catch (err: any) {
      console.error("Save product error:", err);
      setFormError(err.message || "Failed to save product.");
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setSubmitting(true);
    try {
      await deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
      await fetchFarmerProducts();
    } catch (err: any) {
      console.error("Delete product error:", err);
      alert(err.message || "Failed to delete product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (product: DbProduct) => {
    try {
      const newStatus: ProductStatus = product.status === "available" ? "inactive" : "available";
      await updateProduct(product.id, { status: newStatus });
      await fetchFarmerProducts();
    } catch (err: any) {
      alert("Failed to change product status: " + err.message);
    }
  };

  if (!user) {
    return (
      <PageShell eyebrow="Seller Portal" title="Farmer Product Management">
        <div className="rounded-2xl border bg-card p-8 text-center shadow-sm max-w-xl mx-auto my-12">
          <div className="h-16 w-16 rounded-2xl overflow-hidden bg-[#f7f4ed] border border-[#2d6a4f]/20 shadow-xs mx-auto mb-4 flex items-center justify-center p-1">
            <img
              src="/images/pure-farm-logo.png"
              alt="Pure Farm"
              className="h-full w-full object-contain"
            />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {t("Farmer Authentication Required")}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Please log in with your Farmer account to manage product listings, inventory, and sales.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#087F5B] text-white font-bold hover:bg-[#073B2A] transition"
          >
            Sign In to Seller Portal <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </PageShell>
    );
  }

  if (user && user.role !== "farmer") {
    return (
      <PageShell eyebrow="Seller Portal" title="Farmer Access Only">
        <div className="rounded-2xl border bg-card p-8 text-center shadow-sm max-w-xl mx-auto my-12">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">{t("Account Role Notice")}</h2>
          <p className="text-muted-foreground text-sm mb-6">
            You are currently logged in as <strong>{user.role.toUpperCase()}</strong>
            {t(
              ". Access to this product management interface is strictly restricted to registered Farmers.",
            )}
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#087F5B] text-white font-bold hover:bg-[#073B2A] transition"
          >
            {t("Go to Marketplace")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Farmer Console"
      title="My Products & Inventory"
      intro="Manage your farm produce listings, update stock levels, and publish products to buyers across India."
    >
      {/* Tabs & Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted border w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition ${
              activeTab === "products"
                ? "bg-[#087F5B] text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Products ({products.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("orders");
              fetchFarmerOrders();
            }}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition ${
              activeTab === "orders"
                ? "bg-[#087F5B] text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Received Orders ({farmerOrders.length})
          </button>
        </div>

        {activeTab === "products" && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#073B2A] text-white font-bold text-xs shadow-md transition"
          >
            <Plus className="h-4 w-4" />
            {t("List New Produce")}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold">
          {error}
        </div>
      )}

      {activeTab === "orders" ? (
        /* Farmer Received Orders Tab */
        <div>
          {loadingOrders ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="rounded-2xl border p-6 bg-card animate-pulse space-y-3">
                  <div className="h-5 bg-muted rounded w-1/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : farmerOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-12 text-center max-w-xl mx-auto my-8 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#087F5B] flex items-center justify-center mx-auto mb-2 font-bold text-xl">
                📦
              </div>
              <h3 className="text-xl font-bold text-[#073B2A]">{t("No received orders yet.")}</h3>
              <p className="text-xs text-emerald-800/80 leading-relaxed">
                When buyers purchase your listed produce, orders will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {farmerOrders.map((order) => (
                <div key={order.id} className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-lg text-foreground">
                          Order #PF-{order.id.substring(0, 8).toUpperCase()}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Received on{" "}
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          dateStyle: "medium",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block font-medium">
                        {t("Order Total")}
                      </span>
                      <span className="text-xl font-black text-[#087F5B]">
                        {formatRupees(order.total_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm py-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#087F5B] flex items-center justify-center font-bold text-xs">
                            🌾
                          </div>
                          <div>
                            <p className="font-bold text-foreground">
                              {item.products?.name || "Farm Produce"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} {item.products?.unit || "units"} ×{" "}
                              {formatRupees(item.unit_price)}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-foreground">
                          {formatRupees(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Location */}
                  <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[#087F5B]" />
                      <span>
                        {t("Delivery Destination:")}
                        <strong>{order.delivery_location}</strong>
                      </span>
                    </div>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                      Payment: {order.payment_method?.toUpperCase() || "COD"} (
                      {order.payment_status || "Pending"})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {activeTab === "products" && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-2xl border p-6 bg-card animate-pulse space-y-4">
                  <div className="h-40 bg-muted rounded-xl" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-12 text-center max-w-xl mx-auto my-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#087F5B] flex items-center justify-center mx-auto mb-4">
                <Sprout className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-[#073B2A] mb-2">
                {t("No products listed yet.")}
              </h3>
              <p className="text-sm text-emerald-800/80 mb-6 leading-relaxed">
                You haven't listed any farm produce for sale yet. Start selling directly to verified
                buyers across India with zero middleman fees.
              </p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#087F5B] hover:bg-[#073B2A] text-white font-bold text-sm shadow-lg transition"
              >
                <Plus className="h-4 w-4" />
                {t("List Your First Product")}
              </button>
            </div>
          ) : (
            /* Product Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl border bg-card overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="relative h-44 bg-muted overflow-hidden">
                      <img
                        src={product.image_url || NEUTRAL_PRODUCT_FALLBACK}
                        alt={product.name || (product as any).title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = NEUTRAL_PRODUCT_FALLBACK;
                        }}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${product.status === "available" ? "bg-emerald-500 text-white" : "bg-gray-500 text-white"}`}
                      >
                        {(product.status || "available").toUpperCase()}
                      </span>
                      <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold bg-black/60 text-white backdrop-blur-sm">
                        {product.category.toUpperCase()}
                      </span>
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-lg text-foreground line-clamp-1">
                        {product.name || (product as any).title}
                      </h3>

                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-[#087F5B]">
                          {formatRupees(product.price)}
                        </span>
                        <span className="text-xs text-muted-foreground font-semibold">
                          / {product.unit}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                        <div>
                          <span className="text-muted-foreground block font-medium">
                            Available Stock
                          </span>
                          <span className="font-bold text-foreground">
                            {product.available_quantity} {product.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block font-medium">
                            Total Quantity
                          </span>
                          <span className="font-bold text-foreground">
                            {product.quantity} {product.unit}
                          </span>
                        </div>
                      </div>

                      {product.location && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-[#087F5B]" />
                          <span className="truncate">{product.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-4 bg-muted/40 border-t flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleStatus(product)}
                      className="px-3 py-1.5 rounded-lg border text-xs font-bold transition hover:bg-muted"
                    >
                      {product.status === "available" ? "Deactivate" : "Activate"}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-100 text-[#087F5B] hover:bg-emerald-200 text-xs font-bold transition"
                      >
                        {t("Edit")}
                      </button>
                      <button
                        onClick={() => setDeletingProduct(product)}
                        className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 text-xs font-bold transition"
                      >
                        {t("Delete")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Sprout className="h-5 w-5 text-[#087F5B]" />
                {editingProduct ? "Edit Product Listing" : "Add New Crop Listing"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#087F5B] text-xs font-bold">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Product Title / Crop Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Organic Sonora Wheat Grain (50 kg)"
                  className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ProductCategory })
                    }
                    className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
                  >
                    <option value="grains">Grains & Cereals</option>
                    <option value="vegetables">Fresh Vegetables</option>
                    <option value="fruits">Fresh Fruits</option>
                    <option value="pulses">Pulses & Dal</option>
                    <option value="spices">Spices & Herbs</option>
                    <option value="seeds">Seeds & Planting</option>
                    <option value="inputs">Farm Inputs & Fertilizers</option>
                    <option value="equipment">Tools & Equipment</option>
                    <option value="oilseeds">Oilseeds</option>
                    <option value="other">Other Agriculture</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Unit of Measure *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="quintal">Quintal (100 kg)</option>
                    <option value="ton">Metric Ton</option>
                    <option value="bag">Bag / Packet</option>
                    <option value="box">Box / Crate</option>
                    <option value="piece">Piece / Unit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Price per {formData.unit} (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 2400"
                    className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Total Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={formData.quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        quantity: val,
                        available_quantity: prev.available_quantity ? prev.available_quantity : val,
                      }));
                    }}
                    placeholder="e.g. 100"
                    className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Available Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formData.available_quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, available_quantity: e.target.value })
                    }
                    placeholder="e.g. 100"
                    className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Location / Farm Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Guntur, Andhra Pradesh"
                    className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    value={formData.harvest_date}
                    onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  {t("Image URL (Optional)")}
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/... or leave blank for default image"
                  className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  {t("Description (Optional)")}
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your harvest quality, moisture content, organic certification, packaging..."
                  className="w-full p-3 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as ProductStatus })
                  }
                  className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
                >
                  <option value="available">{t("Active (Visible on Marketplace)")}</option>
                  <option value="inactive">{t("Inactive (Hidden from Marketplace)")}</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl border text-xs font-bold hover:bg-muted transition"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#073B2A] text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? "Saving..." : editingProduct ? "Update Product" : "Publish Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">{t("Confirm Delete Product")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("Are you sure you want to remove")}
              <strong>"{deletingProduct.name || (deletingProduct as any).title}"</strong> from your
              catalog? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => setDeletingProduct(null)}
                disabled={submitting}
                className="px-4 py-2 rounded-xl border text-xs font-bold hover:bg-muted"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

export function AdminPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <PageShell
      eyebrow="System Administration"
      title="PureFarm Control Panel"
      intro="Monitor database health, oversee user profiles, and manage system operations."
    >
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground font-semibold">User Role</p>
          <p className="text-2xl font-black text-[#087F5B] mt-1">
            {user?.role?.toUpperCase() || "ADMIN"}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground font-semibold">Supabase Connection</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">CONNECTED</p>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground font-semibold">Environment</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">PRODUCTION</p>
        </div>
      </div>
    </PageShell>
  );
}

export function CardGridPage({
  eyebrow,
  title,
  intro,
  setQuery,
  query,
  bgImage,
  items,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  setQuery?: (q: string) => void;
  query?: string;
  bgImage?: string;
  items: {
    title: string;
    meta: string;
    body: string;
    footer: string;
    url?: string;
    internalUrl?: string;
    icon?: React.ReactNode;
  }[];
}) {
  const { t } = useTranslation();
  const currentCardClass = bgImage ? glassCardClass : cardClass;
  return (
    <PageShell eyebrow={eyebrow} title={title} intro={intro} {...(bgImage ? { bgImage } : {})}>
      {setQuery ? (
        <input
          value={query || ""}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("Search...")}
          className={`mb-5 h-12 w-full max-w-xl rounded-xl border px-4 shadow-sm outline-none transition-all ${bgImage ? "bg-white/80 border-white/50 backdrop-blur-md focus:bg-white focus:ring-2 focus:ring-white" : "border-input bg-card"}`}
        />
      ) : null}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const isClickable = Boolean(item.url || item.internalUrl);
          const content = (
            <div
              className={`${currentCardClass} h-full ${isClickable ? "hover:border-primary/50 hover:shadow-md transition cursor-pointer" : ""}`}
            >
              <div className="flex items-start gap-3">
                {item.icon}
                <div>
                  <p className="text-lg font-black">{t(item.title)}</p>
                  <p className="mt-1 text-sm font-bold text-primary">{t(item.meta)}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(item.body)}</p>
              <p className="mt-4 text-xs font-bold text-muted-foreground">{t(item.footer)}</p>
            </div>
          );
          if (item.internalUrl) {
            return (
              <Link
                key={t(item.title)}
                to={item.internalUrl}
                className="block transition hover:-translate-y-0.5 cursor-pointer"
              >
                {content}
              </Link>
            );
          }
          return item.url ? (
            <a
              key={t(item.title)}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="block transition hover:-translate-y-0.5 cursor-pointer"
            >
              {content}
            </a>
          ) : (
            <div key={t(item.title)}>{content}</div>
          );
        })}
      </div>
    </PageShell>
  );
}

// ============================================================================
// COLD STORAGE FINDER PAGE
// ============================================================================

export const DEV_TEST_COLD_STORAGE_FIXTURES: ColdStorageFacility[] = [
  {
    id: "dev-test-available",
    name: "[DEV TEST] Available Storage Facility",
    address: "Test Industrial Zone, Guntur, Andhra Pradesh - 522004 [State: Andhra Pradesh | District: Guntur | City: Guntur | Source: Dev Test Fixture | SourceURL: https://purefarm.org | Type: verification_sample | Status: Operational]",
    district: "Guntur",
    city: "Guntur",
    state: "Andhra Pradesh",
    latitude: 16.3067,
    longitude: 80.4365,
    distance: 2.5,
    capacity: 10000,
    available_capacity: 4000,
    occupied_capacity: 6000,
    utilization_percentage: 60,
    contact_number: "+91 99999 11111",
    status: "Operational",
    source: "Dev Test Fixture",
    source_url: null,
    source_type: "verification_sample",
  },
  {
    id: "dev-test-full",
    name: "[DEV TEST] Full Storage Facility",
    address: "Test APMC Market, Nizamabad, Telangana - 503003 [State: Telangana | District: Nizamabad | City: Nizamabad | Source: Dev Test Fixture | SourceURL: https://purefarm.org | Type: verification_sample | Status: Full]",
    district: "Nizamabad",
    city: "Nizamabad",
    state: "Telangana",
    latitude: 18.6725,
    longitude: 78.0941,
    distance: 5.0,
    capacity: 7500,
    available_capacity: 0,
    occupied_capacity: 7500,
    utilization_percentage: 100,
    contact_number: "+91 99999 22222",
    status: "Full",
    source: "Dev Test Fixture",
    source_url: null,
    source_type: "verification_sample",
  },
  {
    id: "dev-test-unknown",
    name: "[DEV TEST] Unknown Availability Facility",
    address: "Test Highway, Prakasam, Andhra Pradesh - 523001 [State: Andhra Pradesh | District: Prakasam | City: Ongole | Source: Dev Test Fixture | SourceURL: https://purefarm.org | Type: verification_sample | Status: Current status not published]",
    district: "Prakasam",
    city: "Ongole",
    state: "Andhra Pradesh",
    latitude: 15.5057,
    longitude: 80.0499,
    distance: 8.0,
    capacity: 23000,
    available_capacity: null,
    occupied_capacity: null,
    utilization_percentage: null,
    contact_number: "Not available",
    status: "Current status not published",
    source: "Dev Test Fixture",
    source_url: null,
    source_type: "verification_sample",
  },
];

export function ColdStoragePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [facilities, setFacilities] = useState<ColdStorageFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dev Test Fixtures state
  const [showDevTestFixtures, setShowDevTestFixtures] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.location.search.includes("test_fixture=true");
    }
    return false;
  });

  // Admin Live Capacity Update modal state
  const [adminModalFacility, setAdminModalFacility] = useState<ColdStorageFacility | null>(null);
  const [adminAvailInput, setAdminAvailInput] = useState<string>("");
  const [adminStatusInput, setAdminStatusInput] = useState<string>("operational");
  const [adminSubmitting, setAdminSubmitting] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Filters & Location
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [capacityRange, setCapacityRange] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [sourceTypeFilter, setSourceTypeFilter] = useState<"verified_directory" | "verification_sample" | "all">("all");
  const [sortOrder, setSortOrder] = useState<
    "nearest" | "name_asc" | "name_desc" | "capacity_high" | "capacity_low" | "utilization_high" | "utilization_low"
  >("capacity_high");
  
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Expanded Facility Details state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Available districts for AP and Telangana
  const apDistricts = [
    "Anantapur",
    "Chittoor",
    "East Godavari",
    "Guntur",
    "Krishna",
    "Kurnool",
    "Prakasam",
    "Visakhapatnam",
    "West Godavari",
  ];
  const tsDistricts = [
    "Karimnagar",
    "Khammam",
    "Mahabubnagar",
    "Medak",
    "Nalgonda",
    "Nizamabad",
    "Rangareddy",
    "Warangal",
  ];

  const availableDistricts = useMemo(() => {
    if (stateFilter === "Andhra Pradesh") return apDistricts;
    if (stateFilter === "Telangana") return tsDistricts;
    return Array.from(new Set([...apDistricts, ...tsDistricts])).sort();
  }, [stateFilter]);

  const fetchFacilities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getColdStorageFacilities({
        search,
        stateFilter,
        districtFilter,
        capacityRange,
        availabilityFilter,
        sourceTypeFilter,
        userLat,
        userLng,
        sortOrder,
      });
      setFacilities(data);
    } catch (err: any) {
      console.error("Failed to load cold storage facilities:", err);
      setError(err.message || "Unable to load cold storage facilities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
    setPage(1);
  }, [search, stateFilter, districtFilter, capacityRange, availabilityFilter, sourceTypeFilter, sortOrder, userLat, userLng]);

  const handleAdminUpdateCapacity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminModalFacility) return;
    setAdminSubmitting(true);
    setAdminError(null);
    try {
      const availVal = parseFloat(adminAvailInput);
      if (isNaN(availVal) || availVal < 0) {
        throw new Error("Please enter a valid non-negative available capacity number in MT.");
      }
      if (availVal > adminModalFacility.capacity) {
        throw new Error(`Available capacity cannot exceed total installed capacity (${adminModalFacility.capacity} MT).`);
      }
      await updateFacilityCapacity(adminModalFacility.id, availVal, adminStatusInput);
      setAdminModalFacility(null);
      await fetchFacilities();
    } catch (err: any) {
      setAdminError(err.message || "Failed to update facility capacity.");
    } finally {
      setAdminSubmitting(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    setLocationStatus("Detecting location...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLocationLoading(false);
        setLocationStatus(
          "Location set: (" +
            pos.coords.latitude.toFixed(2) +
            ", " +
            pos.coords.longitude.toFixed(2) +
            ") - Distances calculated for nearby facilities.",
        );
        setSortOrder("nearest");
      },
      (err) => {
        console.warn("Geolocation permission error:", err.message);
        setLocationLoading(false);
        setLocationStatus(
          "Location permission denied. Distances unavailable. Showing default directory view.",
        );
      },
      { timeout: 10000 },
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const displayFacilities = useMemo(() => {
    if (showDevTestFixtures) {
      return [...DEV_TEST_COLD_STORAGE_FIXTURES, ...facilities];
    }
    return facilities;
  }, [showDevTestFixtures, facilities]);

  const visibleFacilities = useMemo(() => {
    return displayFacilities.slice(0, page * pageSize);
  }, [displayFacilities, page]);

  const hasMore = visibleFacilities.length < displayFacilities.length;

  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "admin", "student", "seller"]} allowGuest={true}>
      <PageShell
        eyebrow={t("Government Verified Infrastructure Directory")}
        title={t("Cold Storage Directory — AP & Telangana")}
        intro={t(
          "Comprehensive verified database of cold storage facilities across Andhra Pradesh & Telangana. Government registries provide verified total installed capacity; live occupancy data is displayed where published.",
        )}
        bgImage="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop"
      >
        <div className="mb-8 p-6 rounded-2xl border border-white/50 bg-white/85 backdrop-blur-md shadow-md space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("Search by facility name, district, city, or address...")}
                className="w-full h-11 pl-10 pr-4 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
              />
            </div>

            <button
              onClick={handleUseMyLocation}
              disabled={locationLoading}
              className="h-11 px-5 rounded-xl bg-[#087F5B] hover:bg-[#073B2A] text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
            >
              <Navigation className={`h-4 w-4 ${locationLoading ? "animate-spin" : ""}`} />
              {locationLoading ? t("Detecting...") : t("Use My Location")}
            </button>
          </div>

          {locationStatus && (
            <div className="text-xs font-semibold text-emerald-800 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200/60 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-[#087F5B]" />
              <span>{t(locationStatus)}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-border/60">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {t("State")}
              </label>
              <select
                value={stateFilter}
                onChange={(e) => {
                  setStateFilter(e.target.value);
                  setDistrictFilter("all");
                }}
                className="w-full h-9 px-3 rounded-lg border bg-background text-xs font-semibold outline-none focus:ring-2 focus:ring-[#087F5B]"
              >
                <option value="all">{t("All States (AP & TS)")}</option>
                <option value="Andhra Pradesh">{t("Andhra Pradesh")}</option>
                <option value="Telangana">{t("Telangana")}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {t("District")}
              </label>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border bg-background text-xs font-semibold outline-none focus:ring-2 focus:ring-[#087F5B]"
              >
                <option value="all">{t("All Districts")}</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {t("Capacity Range")}
              </label>
              <select
                value={capacityRange}
                onChange={(e) => setCapacityRange(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border bg-background text-xs font-semibold outline-none focus:ring-2 focus:ring-[#087F5B]"
              >
                <option value="all">{t("All Capacities")}</option>
                <option value="under_1k">{t("Small (< 1,000 MT)")}</option>
                <option value="1k_5k">{t("Medium-Small (1,000 - 5,000 MT)")}</option>
                <option value="5k_10k">{t("Medium-Large (5,000 - 10,000 MT)")}</option>
                <option value="above_10k">{t("Large (> 10,000 MT)")}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {t("Live Availability Data")}
              </label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border bg-background text-xs font-semibold outline-none focus:ring-2 focus:ring-[#087F5B]"
              >
                <option value="all">{t("All Facilities")}</option>
                <option value="available">🟢 {t("Available (Space > 0 MT)")}</option>
                <option value="full">🔴 {t("Full (0 MT Remaining)")}</option>
                <option value="unknown">⚪ {t("Availability Unknown")}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {t("Sort By")}
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full h-9 px-3 rounded-lg border bg-background text-xs font-semibold outline-none focus:ring-2 focus:ring-[#087F5B]"
              >
                <option value="capacity_high">{t("Capacity: High to Low")}</option>
                <option value="capacity_low">{t("Capacity: Low to High")}</option>
                <option value="remaining_high">{t("Remaining Space: High to Low")}</option>
                <option value="remaining_low">{t("Remaining Space: Low to High")}</option>
                <option value="name_asc">{t("Name: A to Z")}</option>
                <option value="name_desc">{t("Name: Z to A")}</option>
                <option value="nearest" disabled={!userLat || !userLng}>
                  {userLat && userLng ? t("Nearest Distance First") : t("Nearest (Detect Location First)")}
                </option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40 text-xs font-bold text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
              <span className="font-extrabold text-foreground">{t("Legend")}:</span>
              <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50/90 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                🟢 {t("Available (>0 MT)")}
              </span>
              <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-50/90 px-2.5 py-0.5 rounded-full border border-rose-200 shadow-2xs">
                🔴 {t("Full (0 MT)")}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                ⚪ {t("Availability Unknown")}
              </span>
              <button
                type="button"
                onClick={() => setShowDevTestFixtures((prev) => !prev)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                  showDevTestFixtures
                    ? "bg-amber-100 text-amber-900 border-amber-300 shadow-2xs"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                🧪 {showDevTestFixtures ? "Hide Test Fixtures" : "Test Fixtures (3 States)"}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span>
                {t("Showing")} {visibleFacilities.length} {t("of")} {displayFacilities.length} {t("facilities")}
                {stateFilter !== "all" ? ` (${stateFilter})` : ""}
                {districtFilter !== "all" ? ` - ${districtFilter} District` : ""}
              </span>
              <button
                onClick={fetchFacilities}
                className="inline-flex items-center gap-1.5 text-[#087F5B] hover:underline"
              >
                <RefreshCw className="h-3.5 w-3.5" /> {t("Refresh Directory")}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-64 rounded-2xl border bg-card p-6 animate-pulse space-y-4">
                <div className="h-6 w-3/4 bg-muted rounded"></div>
                <div className="h-4 w-1/2 bg-muted rounded"></div>
                <div className="h-12 w-full bg-muted rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-8 text-center max-w-xl mx-auto my-8 space-y-4">
            <AlertTriangle className="h-12 w-12 text-rose-600 mx-auto" />
            <h3 className="text-lg font-bold text-rose-900">
              {t("Unable to load cold storage directory")}
            </h3>
            <p className="text-xs text-rose-700">{error}</p>
            <button
              onClick={fetchFacilities}
              className="px-6 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-md transition"
            >
              {t("Retry Loading")}
            </button>
          </div>
        ) : facilities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-12 text-center max-w-xl mx-auto my-8 space-y-4">
            <Snowflake className="h-12 w-12 text-[#087F5B] mx-auto mb-2 opacity-80" />
            <h3 className="text-xl font-bold text-[#073B2A]">
              {t("No matching cold storage facilities found")}
            </h3>
            <p className="text-sm text-emerald-800/80">
              {t("Try clearing your search query or adjusting your state/district/capacity filters.")}
            </p>
            <button
              onClick={() => {
                setSearch("");
                setStateFilter("all");
                setDistrictFilter("all");
                setCapacityRange("all");
                setAvailabilityFilter("all");
                setSourceTypeFilter("all");
              }}
              className="px-5 py-2.5 rounded-xl bg-[#087F5B] text-white font-bold text-xs shadow-md"
            >
              {t("Reset All Filters")}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visibleFacilities.map((facility) => {
                const hasAvailableCap = facility.available_capacity !== null && facility.available_capacity !== undefined;
                const isFullCap = hasAvailableCap && Number(facility.available_capacity) === 0;
                const isAvailCap = hasAvailableCap && Number(facility.available_capacity) > 0;

                const isFull = isFullCap || facility.status.toLowerCase().includes("full");
                const isOperational = facility.status.toLowerCase().includes("operational");

                return (
                  <div
                    key={facility.id}
                    className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3.5"
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="space-y-0.5">
                          <h3 className="font-bold text-foreground text-sm sm:text-base leading-snug line-clamp-1">
                            {t(facility.name)}
                          </h3>
                          <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-[#087F5B] shrink-0" />
                            <span>{facility.district}, {facility.state}</span>
                          </p>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shadow-2xs ${
                            isFullCap || isFull
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : isAvailCap
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {isFullCap || isFull
                            ? `🔴 ${t("FULL")}`
                            : isAvailCap
                              ? `🟢 ${t("AVAILABLE")}`
                              : `⚪ ${t("UNKNOWN")}`}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground flex items-start gap-1 line-clamp-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70 mt-0.5" />
                        <span>{facility.address}</span>
                      </p>

                      {/* Capacity Section */}
                      <div className={`p-3 rounded-xl border space-y-2 ${
                        isFullCap
                          ? "bg-[#fff5f5] border-rose-200"
                          : isAvailCap
                            ? "bg-[#f4fbf7] border-emerald-200/80"
                            : "bg-muted/40 border-border/60"
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900">
                            {t("CAPACITY")}
                          </span>
                          {facility.calculatedDistance !== undefined && facility.calculatedDistance !== null && (
                            <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                              <Navigation className="h-3 w-3 text-[#087F5B]" /> {facility.calculatedDistance} km
                            </span>
                          )}
                        </div>

                        {isAvailCap ? (
                          (() => {
                            const avail = Number(facility.available_capacity);
                            const total = facility.capacity;
                            const used = Math.max(0, total - avail);
                            const usedPct = Math.round((used / total) * 100);
                            const remainingPct = Math.round((avail / total) * 100);

                            return (
                              <div className="space-y-1.5">
                                <div className="flex items-baseline justify-between">
                                  <div>
                                    <span className="text-base font-black text-[#073B2A]">{total.toLocaleString()} MT</span>
                                    <span className="text-[10px] text-muted-foreground font-semibold ml-1">Total</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-base font-black text-[#087F5B]">{avail.toLocaleString()} MT</span>
                                    <span className="text-[10px] text-muted-foreground font-semibold ml-1">Remaining</span>
                                  </div>
                                </div>

                                {/* Visual Progress Bar */}
                                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                                  <div
                                    className="h-full bg-[#087F5B] rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(100, Math.max(0, usedPct))}%` }}
                                  />
                                </div>

                                <div className="flex justify-between items-center text-[10px] font-bold text-emerald-900">
                                  <span>{usedPct}% Used</span>
                                  <span>{remainingPct}% Remaining</span>
                                </div>
                              </div>
                            );
                          })()
                        ) : isFullCap ? (
                          <div className="space-y-1.5">
                            <div className="flex items-baseline justify-between">
                              <div>
                                <span className="text-base font-black text-[#073B2A]">{facility.capacity.toLocaleString()} MT</span>
                                <span className="text-[10px] text-muted-foreground font-semibold ml-1">Total</span>
                              </div>
                              <div className="text-right">
                                <span className="text-base font-black text-rose-600">0 MT</span>
                                <span className="text-[10px] text-muted-foreground font-semibold ml-1">Remaining</span>
                              </div>
                            </div>

                            {/* Visual Progress Bar (100% Full) */}
                            <div className="w-full h-2.5 bg-rose-200 rounded-full overflow-hidden flex">
                              <div className="h-full bg-rose-600 w-full rounded-full" />
                            </div>

                            <div className="flex justify-between items-center text-[10px] font-extrabold text-rose-800">
                              <span>100% Used</span>
                              <span>🔴 No remaining storage capacity</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-baseline justify-between">
                              <span className="text-base font-black text-[#073B2A]">{facility.capacity.toLocaleString()} MT</span>
                              <span className="text-[10px] text-muted-foreground font-semibold">Total Installed</span>
                            </div>
                            <div className="text-[11px] font-semibold text-slate-500 bg-white/70 rounded-md py-1.5 px-2 border border-dashed border-slate-200 text-center flex items-center justify-center gap-1.5">
                              <span>🔒</span>
                              <span>{t("Live availability not published")}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Compact Source Line */}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium pt-0.5">
                        <span className="truncate">
                          ✓ {t("Source")}: <strong className="text-foreground">{facility.source}</strong>
                        </span>
                        {facility.source_type === "verification_sample" && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0">
                            Sample
                          </span>
                        )}
                      </div>

                      {/* Expanded Details Drawer */}
                      {expandedId === facility.id && (
                        <div className="pt-2 border-t text-xs space-y-1.5 text-muted-foreground">
                          <p className="font-bold text-foreground text-[11px]">{t("Facility Directory Details:")}</p>
                          <ul className="space-y-0.5 text-[11px]">
                            <li><strong>{t("State")}:</strong> {facility.state}</li>
                            <li><strong>{t("District")}:</strong> {facility.district}</li>
                            <li><strong>{t("City/Town")}:</strong> {facility.city}</li>
                            <li>
                              <strong>{t("Coordinates")}:</strong>{" "}
                              {facility.latitude && facility.longitude
                                ? `${facility.latitude.toFixed(4)}, ${facility.longitude.toFixed(4)}`
                                : t("Coordinates unavailable")}
                            </li>
                            <li><strong>{t("Operating Status")}:</strong> {t(facility.status)}</li>
                            <li><strong>{t("Data Type")}:</strong> Verified Installed Capacity (Government Registry)</li>
                          </ul>

                          {facility.source_url && (
                            <div className="pt-1">
                              <a
                                href={facility.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#087F5B] hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" /> {t("View Official Source Page")}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer Action Buttons */}
                    <div className="pt-2.5 border-t flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        {facility.contact_number && (
                          <a
                            href={`tel:${facility.contact_number.replace(/\s+/g, "")}`}
                            className="flex-1 h-8 px-3 rounded-lg bg-[#087F5B] hover:bg-[#073B2A] text-white font-bold text-xs transition flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <Phone className="h-3 w-3" /> {t("Call")}
                          </a>
                        )}

                        <button
                          onClick={() => toggleExpand(facility.id)}
                          className="h-8 px-3 rounded-lg border bg-background hover:bg-muted font-bold text-xs text-foreground transition flex items-center gap-1 ml-auto"
                        >
                          {expandedId === facility.id ? t("Hide Details") : t("Details")}
                          {expandedId === facility.id ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      </div>

                      {user?.role === "admin" && (
                        <button
                          onClick={() => {
                            setAdminModalFacility(facility);
                            setAdminAvailInput(facility.available_capacity !== null ? String(facility.available_capacity) : "");
                            setAdminStatusInput(facility.status.toLowerCase().includes("operational") ? "operational" : facility.status);
                            setAdminError(null);
                          }}
                          className="w-full h-7 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] transition flex items-center justify-center gap-1"
                        >
                          <Wrench className="h-3 w-3" /> {t("Admin: Update Live Capacity")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-8 py-3 rounded-xl bg-[#087F5B] hover:bg-[#073B2A] text-white font-bold text-sm shadow-md transition inline-flex items-center gap-2"
                >
                  {t("Load More Facilities")} ({facilities.length - visibleFacilities.length} {t("remaining")})
                </button>
              </div>
            )}
          </div>
        )}

        {/* Admin Live Capacity Update Modal */}
        {adminModalFacility && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-extrabold text-foreground text-base flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-amber-500" />
                  {t("Update Live Capacity")}
                </h3>
                <button
                  onClick={() => setAdminModalFacility(null)}
                  className="text-muted-foreground hover:text-foreground text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs space-y-1 text-muted-foreground">
                <p className="font-bold text-foreground">{adminModalFacility.name}</p>
                <p>{adminModalFacility.district}, {adminModalFacility.state}</p>
                <p className="text-emerald-700 font-semibold">
                  Installed Capacity: {adminModalFacility.capacity.toLocaleString()} MT
                </p>
              </div>

              {adminError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {adminError}
                </div>
              )}

              <form onSubmit={handleAdminUpdateCapacity} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    {t("Available Capacity (MT)")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={adminModalFacility.capacity}
                    step="1"
                    value={adminAvailInput}
                    onChange={(e) => setAdminAvailInput(e.target.value)}
                    placeholder={`0 - ${adminModalFacility.capacity}`}
                    required
                    className="w-full h-10 px-3 rounded-xl border bg-background text-sm font-semibold outline-none focus:ring-2 focus:ring-[#087F5B]"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Enter current available MT space. Occupied MT and Utilization % will be automatically calculated.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    {t("Operating Status")}
                  </label>
                  <select
                    value={adminStatusInput}
                    onChange={(e) => setAdminStatusInput(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border bg-background text-sm font-semibold outline-none focus:ring-2 focus:ring-[#087F5B]"
                  >
                    <option value="operational">Operational</option>
                    <option value="full">Full</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setAdminModalFacility(null)}
                    className="flex-1 h-10 rounded-xl border font-bold text-xs hover:bg-muted"
                  >
                    {t("Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={adminSubmitting}
                    className="flex-1 h-10 rounded-xl bg-[#087F5B] hover:bg-[#073B2A] text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
                  >
                    {adminSubmitting ? t("Saving...") : t("Save Live Data")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </PageShell>
    </RoleGuard>
  );
}

export function MachinesToolsPage() {
  const { language, t } = useTranslation();
  const isTelugu = language === "te";

  // Filter & Search states
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  // Listing modal & Request modal states
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [selectedEquipmentForRental, setSelectedEquipmentForRental] = useState<any | null>(null);
  const [rentalSuccessToast, setRentalSuccessToast] = useState("");

  // New Equipment Form State
  const [newEquipName, setNewEquipName] = useState("");
  const [newEquipCategory, setNewEquipCategory] = useState("Tractors");
  const [newEquipLocation, setNewEquipLocation] = useState("Rajahmundry");
  const [newEquipRate, setNewEquipRate] = useState("");
  const [newEquipRateUnit, setNewEquipRateUnit] = useState("hr");
  const [newEquipSpecs, setNewEquipSpecs] = useState("");
  const [newEquipDesc, setNewEquipDesc] = useState("");
  const [newEquipOwner, setNewEquipOwner] = useState("");
  const [newEquipPhone, setNewEquipPhone] = useState("");

  // Rental Request Form State
  const [rentalDate, setRentalDate] = useState("");
  const [rentalDuration, setRentalDuration] = useState("1");
  const [rentalNotes, setRentalNotes] = useState("");

  const categories = [
    "all",
    "Tractors",
    "Harvesters",
    "Rotavators",
    "Cultivators",
    "Seeders",
    "Sprayers",
    "Water Pumps",
    "Irrigation Equipment",
    "Power Tools",
    "Other Farm Equipment",
  ];

  const catNamesTe: Record<string, string> = {
    all: "అన్నీ",
    Tractors: "ట్రాక్టర్లు",
    Harvesters: "హార్వెస్టర్లు",
    Rotavators: "రోటావేటర్లు",
    Cultivators: "కల్టివేటర్లు",
    Seeders: "సీడర్లు",
    Sprayers: "స్ప్రేయర్లు",
    "Water Pumps": "వాటర్ పంపులు",
    "Irrigation Equipment": "నీటి పారుదల పరికరాలు",
    "Power Tools": "పావర్ టూల్స్",
    "Other Farm Equipment": "ఇతర పరికరాలు",
  };

  const locations = [
    "all",
    "Rajahmundry",
    "Kakinada",
    "Eluru",
    "Vijayawada",
    "Guntur",
    "Tanuku",
    "Mandapeta",
  ];

  const initialEquipmentList = [
    // 1. TRACTORS (4 items)
    {
      id: "eq-1",
      name: "Mahindra 575 DI Tractor (45 HP)",
      category: "Tractor",
      owner: "Ramesh Varma",
      location: "Rajahmundry",
      rate: "₹500",
      rateUnit: "hr",
      available: true,
      specs: "45 HP, Diesel Engine, Dual Clutch, Heavy Tow Hitch",
      description: "Multi-purpose 45 HP red diesel agricultural tractor with power steering and dual clutch. Ideal for tilling, ploughing, and transport.",
      image: "/images/machines/mahindra_575_tractor.jpg",
      phone: "9848012345",
    },
    {
      id: "eq-1b",
      name: "John Deere 5310 GearPro Tractor (55 HP)",
      category: "Tractor",
      owner: "K. Srinivasa Rao",
      location: "Vijayawada",
      rate: "₹650",
      rateUnit: "hr",
      available: true,
      specs: "55 HP Power Steering, 12F+4R Gearbox, Oil Immersed Brakes",
      description: "High power 55 HP heavy-duty tractor equipped with 12F+4R gear transmission, oil immersed disc brakes, and high torque output.",
      image: "/images/machines/john_deere_5310_tractor.jpg",
      phone: "9848011223",
    },
    {
      id: "eq-1c",
      name: "Swaraj 744 FE Multi-Speed Tractor (48 HP)",
      category: "Tractor",
      owner: "M. Nageswara Rao",
      location: "Guntur",
      rate: "₹520",
      rateUnit: "hr",
      available: true,
      specs: "48 HP 3-Cylinder Diesel, Direction Control Valve, 2000kg Lift",
      description: "Reliable 48 HP 3-cylinder diesel tractor with multi-speed PTO, dual clutch, and 2000kg hydraulic lift capacity for heavy soil tilling.",
      image: "/images/machines/swaraj_744_tractor.jpg",
      phone: "9848011334",
    },
    {
      id: "eq-1d",
      name: "Sonalika DI 745 III Sikander (50 HP)",
      category: "Tractor",
      owner: "P. Venkateswarlu",
      location: "Eluru",
      rate: "₹550",
      rateUnit: "hr",
      available: true,
      specs: "50 HP Engine, High Torque, Power Steering, Constant Mesh",
      description: "50 HP heavy-duty agricultural tractor engineered for low fuel consumption and high pulling force with subsoilers and haulage.",
      image: "/images/machines/sonalika_745_tractor.jpg",
      phone: "9848011445",
    },

    // 2. HARVESTERS (4 items)
    {
      id: "eq-2",
      name: "Kubota Harvester DC-68G",
      category: "Harvester",
      owner: "Venkat Rao",
      location: "Kakinada",
      rate: "₹1,800",
      rateUnit: "hr",
      available: true,
      specs: "68 HP, Paddy & Wheat Combine, Hydrostatic Drive",
      description: "High performance paddy & wheat combine harvester operating in field with 68 HP diesel engine for quick harvesting.",
      image: "/images/machines/kubota_dc68g_harvester.jpg",
      phone: "9848023456",
    },
    {
      id: "eq-2b",
      name: "John Deere W70 Grain Combine Harvester",
      category: "Harvester",
      owner: "B. Appala Naidu",
      location: "Vijayawada",
      rate: "₹2,100",
      rateUnit: "hr",
      available: true,
      specs: "100 HP Turbocharged, 14-ft Cutter Bar, Grain Loss Monitor",
      description: "100 HP turbocharged self-propelled combine harvester with 14-foot cutter bar and active grain loss monitor for large fields.",
      image: "/images/machines/john_deere_w70_harvester.jpg",
      phone: "9848022334",
    },
    {
      id: "eq-2c",
      name: "Preet 987 Paddy Combine Harvester",
      category: "Harvester",
      owner: "Ch. Satyanarayana",
      location: "Tanuku",
      rate: "₹1,950",
      rateUnit: "hr",
      available: true,
      specs: "101 HP Engine, Straw Chopper Attachment, Rubber Tracks",
      description: "Heavy duty 101 HP paddy crawler combine with heavy-duty rubber tracks for harvesting in wet muddy paddy fields.",
      image: "/images/machines/preet_987_harvester.jpg",
      phone: "9848022445",
    },
    {
      id: "eq-2d",
      name: "New Holland TC5.30 Combine Harvester",
      category: "Harvester",
      owner: "T. Rama Krishna",
      location: "Guntur",
      rate: "₹2,200",
      rateUnit: "hr",
      available: true,
      specs: "130 HP Engine, Rotary Separator, Dual Drum Threshing",
      description: "130 HP multi-crop combine harvester with rotary separator and dual drum paddy threshing mechanism.",
      image: "/images/machines/new_holland_tc530_harvester.jpg",
      phone: "9848022556",
    },

    // 3. ROTAVATORS (4 items)
    {
      id: "eq-3",
      name: "Shaktiman Rotavator 7 Feet",
      category: "Rotavator",
      owner: "Appa Rao",
      location: "Eluru",
      rate: "₹450",
      rateUnit: "hr",
      available: true,
      specs: "48 Blades, Multi-speed Gearbox, PTO Driven",
      description: "Heavy duty 7-foot tractor-mounted rotary tiller with 48 blades for fine seedbed preparation.",
      image: "/images/machines/shaktiman_rotavator_7ft.jpg",
      phone: "9848034567",
    },
    {
      id: "eq-3b",
      name: "Maschio Gaspardo Virtus 6-Foot Rotavator",
      category: "Rotavator",
      owner: "V. Sambasiva Rao",
      location: "Mandapeta",
      rate: "₹420",
      rateUnit: "hr",
      available: true,
      specs: "42 Boron Steel Blades, Heavy Duty Side Gear Drive",
      description: "Italian boron steel 42-blade rotavator engineered for smooth soil pulverization and residue incorporation.",
      image: "/images/machines/maschio_rotavator_6ft.jpg",
      phone: "9848033445",
    },
    {
      id: "eq-3c",
      name: "Fieldking Heavy Duty 8-Foot Rotavator",
      category: "Rotavator",
      owner: "K. Subrahmanyam",
      location: "Rajahmundry",
      rate: "₹480",
      rateUnit: "hr",
      available: true,
      specs: "54 L-Type Blades, Dual Crown Multi-Speed Gearbox",
      description: "Wide 8-foot tractor rotavator with 54 L-type blades suitable for tractors above 50 HP for fast land preparation.",
      image: "/images/machines/fieldking_rotavator_8ft.jpg",
      phone: "9848033556",
    },
    {
      id: "eq-3d",
      name: "Dasmesh 642 Heavy Duty Paddy Rotavator",
      category: "Rotavator",
      owner: "G. Trimurtulu",
      location: "Kakinada",
      rate: "₹440",
      rateUnit: "hr",
      available: true,
      specs: "Waterproof Bearing Seal, 36 C-Type Blades for Wet Tillage",
      description: "Specialized wet land paddy rotavator with waterproof bearing seals and 36 C-type blades for thorough puddling.",
      image: "/images/machines/dasmesh_paddy_rotavator.jpg",
      phone: "9848033667",
    },

    // 4. CULTIVATORS (4 items)
    {
      id: "eq-6",
      name: "STIHL Heavy Duty Power Tiller 7.5 HP",
      category: "Cultivator",
      owner: "Rambabu",
      location: "Mandapeta",
      rate: "₹350",
      rateUnit: "hr",
      available: true,
      specs: "7.5 HP Petrol, Reverse Gear, Tillage Depth 6-8 inch",
      description: "Heavy duty petrol power tiller cultivator with visible tines for orchard tilling and weeding.",
      image: "/images/machines/stihl_power_tiller_7hp.jpg",
      phone: "9848067890",
    },
    {
      id: "eq-6b",
      name: "Swan 9-Tyne Rigid Frame Field Cultivator",
      category: "Cultivator",
      owner: "D. Prasad",
      location: "Rajahmundry",
      rate: "₹300",
      rateUnit: "hr",
      available: true,
      specs: "9 Forged Steel Tynes, Heavy Channel Frame, 35+ HP Mount",
      description: "Tractor-mounted 9-tyne rigid cultivator with forged steel tynes for hard soil loosening and primary tillage.",
      image: "/images/machines/swan_9tyne_cultivator.jpg",
      phone: "9848066778",
    },
    {
      id: "eq-6c",
      name: "Fieldking 11-Tyne Spring Loaded Cultivator",
      category: "Cultivator",
      owner: "Y. Ramana",
      location: "Vijayawada",
      rate: "₹380",
      rateUnit: "hr",
      available: true,
      specs: "High-Tensile Springs, Reversible Carbon Shovels, 11 Tynes",
      description: "Heavy-duty 11-tyne spring-loaded cultivator designed for stony soils with high clearance and reversible carbon shovels.",
      image: "/images/machines/fieldking_11tyne_cultivator.jpg",
      phone: "9848066889",
    },
    {
      id: "eq-6d",
      name: "VST Shakti 13 HP Power Tiller / Cultivator",
      category: "Cultivator",
      owner: "S. V. Ramana",
      location: "Tanuku",
      rate: "₹320",
      rateUnit: "hr",
      available: true,
      specs: "13 HP Diesel Engine, 18-Blade Rotary Tiller",
      description: "13 HP diesel water-cooled power tiller equipped with 18-blade rotary tiller for inter-cultivation and vegetable plots.",
      image: "/images/machines/vst_shakti_13hp_tiller.jpg",
      phone: "9848066990",
    },

    // 5. SEEDERS (4 items)
    {
      id: "eq-7",
      name: "National Automatic 9-Row Seed Drill",
      category: "Seeder",
      owner: "Subba Rao",
      location: "Vijayawada",
      rate: "₹400",
      rateUnit: "hr",
      available: true,
      specs: "9 Tines, Double Box Seed & Fertilizer, Adjustable Depth",
      description: "Tractor-mounted 9-row automatic seed drill and fertilizer applicator for precise sowing.",
      image: "/images/machines/national_seed_drill_9row.jpg",
      phone: "9848078901",
    },
    {
      id: "eq-7b",
      name: "Khedut 11-Row Zero Tillage Seed Drill",
      category: "Seeder",
      owner: "N. Veeraiah",
      location: "Guntur",
      rate: "₹450",
      rateUnit: "hr",
      available: true,
      specs: "11 Rows, Fluted Roller Metering, Zero Tillage",
      description: "Direct seed drill allowing sowing without prior tilling, saving fuel and conserving soil moisture.",
      image: "/images/machines/khedut_zero_till_drill.jpg",
      phone: "9848077889",
    },
    {
      id: "eq-7c",
      name: "Landforce Paddy Drum Seeder (Manual 8-Row)",
      category: "Seeder",
      owner: "K. Tirupati Rao",
      location: "Eluru",
      rate: "₹150",
      rateUnit: "day",
      available: true,
      specs: "8 Rows Direct Sowing, Fiber Drums, Lightweight Pull",
      description: "Lightweight 8-row direct paddy drum seeder for sprouted paddy seeds in prepared puddled fields.",
      image: "/images/machines/landforce_paddy_drum_seeder.jpg",
      phone: "9848077990",
    },
    {
      id: "eq-7d",
      name: "Pneumatic Precision Planter & Maize Seeder",
      category: "Seeder",
      owner: "M. Durga Prasad",
      location: "Kakinada",
      rate: "₹600",
      rateUnit: "hr",
      available: true,
      specs: "Vacuum Precision Metering, 4 Rows, Adjustable Spacing",
      description: "Pneumatic vacuum precision planter for single-seed placement of maize, cotton, and sunflower seeds.",
      image: "/images/machines/pneumatic_precision_planter.jpg",
      phone: "9848077101",
    },

    // 6. SPRAYERS (4 items)
    {
      id: "eq-4",
      name: "Multi-Crop Power Sprayer 20L",
      category: "Sprayer",
      owner: "Satyanarayana",
      location: "Rajahmundry",
      rate: "₹250",
      rateUnit: "day",
      available: true,
      specs: "12V 12Ah Battery, 20L Tank, Adjustable Brass Nozzle",
      description: "12V battery-operated 20L backpack power sprayer with dual brass nozzles for pesticide spray.",
      image: "/images/machines/knapsack_power_sprayer_20l.jpg",
      phone: "9848045678",
    },
    {
      id: "eq-4b",
      name: "Fieldking 400L Tractor Boom Sprayer",
      category: "Sprayer",
      owner: "B. Srinivas",
      location: "Guntur",
      rate: "₹800",
      rateUnit: "day",
      available: true,
      specs: "400L Polyethylene Tank, 12m Folding Boom, PTO Pump",
      description: "400-litre tractor PTO-driven boom sprayer with 12-meter folding spray booms for fast field chemical treatment.",
      image: "/images/machines/fieldking_400l_boom_sprayer.jpg",
      phone: "9848044556",
    },
    {
      id: "eq-4c",
      name: "Aspee Marut Foot-Operated Orchard Sprayer",
      category: "Sprayer",
      owner: "K. Babu",
      location: "Mandapeta",
      rate: "₹180",
      rateUnit: "day",
      available: true,
      specs: "Brass Pump Barrel, 2m Extension Rod, High Pressure Hose",
      description: "High-pressure foot sprayer with brass pump cylinder and long delivery hose for orchard trees.",
      image: "/images/machines/aspee_foot_orchard_sprayer.jpg",
      phone: "9848044667",
    },
    {
      id: "eq-4d",
      name: "KisanKraft 4-Stroke Petrol Engine Power Sprayer",
      category: "Sprayer",
      owner: "G. Krishna",
      location: "Vijayawada",
      rate: "₹350",
      rateUnit: "day",
      available: true,
      specs: "31cc 4-Stroke Engine, 50m Hose Reel, High Jet Pressure",
      description: "Portable 31cc 4-stroke petrol engine power sprayer with 50-meter hose reel for spraying fruit gardens and field crops.",
      image: "/images/machines/kisankraft_petrol_sprayer.jpg",
      phone: "9848044778",
    },

    // 7. WATER PUMPS (4 items)
    {
      id: "eq-5",
      name: "Honda 5 HP High Pressure Water Pump",
      category: "Water Pump",
      owner: "Krishna Reddy",
      location: "Tanuku",
      rate: "₹300",
      rateUnit: "day",
      available: true,
      specs: "5 HP Engine, 3-inch Delivery Pipe, 1000L/min Flow",
      description: "4-stroke petrol 3-inch agricultural irrigation water pump for high volume field watering.",
      image: "/images/machines/honda_5hp_water_pump.jpg",
      phone: "9848056789",
    },
    {
      id: "eq-5b",
      name: "Kirloskar 7.5 HP Diesel Agricultural Pump",
      category: "Water Pump",
      owner: "P. Satyanarayana",
      location: "Eluru",
      rate: "₹400",
      rateUnit: "day",
      available: true,
      specs: "7.5 HP Air-Cooled Diesel, 4-inch Suction & Delivery",
      description: "Heavy duty single cylinder diesel water pump coupled with 4-inch high discharge centrifugal pump.",
      image: "/images/machines/kirloskar_7hp_diesel_pump.jpg",
      phone: "9848055667",
    },
    {
      id: "eq-5c",
      name: "Crompton 5 HP Submersible Farm Well Pump",
      category: "Water Pump",
      owner: "V. Chalapathi",
      location: "Rajahmundry",
      rate: "₹350",
      rateUnit: "day",
      available: true,
      specs: "5 HP 3-Phase Motor, Stainless Steel Impellers, High Head",
      description: "5 HP 3-phase open well submersible pump set engineered for continuous agricultural irrigation from open wells.",
      image: "/images/machines/crompton_submersible_pump.jpg",
      phone: "9848055778",
    },
    {
      id: "eq-5d",
      name: "Texmo 3 HP Monoblock Irrigation Water Pump",
      category: "Water Pump",
      owner: "K. Adinarayana",
      location: "Kakinada",
      rate: "₹280",
      rateUnit: "day",
      available: true,
      specs: "3 HP Single Phase, Heavy Cast Iron Body, High Discharge",
      description: "Single-phase 3 HP monoblock pump suitable for lifting water from canals, ponds, and shallow borewells.",
      image: "/images/machines/texmo_monoblock_pump.jpg",
      phone: "9848055889",
    },

    // 8. IRRIGATION EQUIPMENT (4 items)
    {
      id: "eq-8",
      name: "Jain Drip & Sprinkler Irrigation System",
      category: "Irrigation Equipment",
      owner: "Narasimha Rao",
      location: "Kakinada",
      rate: "₹600",
      rateUnit: "day",
      available: true,
      specs: "30 Brass Sprinklers, 75mm HDPE Pipes, 2 Acre Kit",
      description: "Portable agricultural sprinkler set with 30 nozzles and quick-fit HDPE pipes for 2-acre coverage.",
      image: "/images/machines/jain_sprinkler_system.jpg",
      phone: "9848089012",
    },
    {
      id: "eq-8b",
      name: "Netafim Micro Drip Irrigation Kit 1-Acre",
      category: "Irrigation Equipment",
      owner: "S. Govind",
      location: "Guntur",
      rate: "₹500",
      rateUnit: "day",
      available: true,
      specs: "Inline Dripper Tubes, Screen Filter, Venturi Injector",
      description: "Complete 1-acre drip irrigation kit featuring inline pressure compensating drippers, screen filter, and venturi injector.",
      image: "/images/machines/netafim_drip_irrigation_kit.jpg",
      phone: "9848088990",
    },
    {
      id: "eq-8c",
      name: "Finolex Rain Gun Sprinkler Irrigation System",
      category: "Irrigation Equipment",
      owner: "Ch. Subbaiah",
      location: "Vijayawada",
      rate: "₹750",
      rateUnit: "day",
      available: true,
      specs: "1.5-inch Heavy Brass Rain Gun, 30m Radius, Quick Latch",
      description: "High-throw 1.5-inch brass rain gun sprinkler capable of 30-meter spray radius for sugarcane and maize fields.",
      image: "/images/machines/finolex_raingun_sprinkler.jpg",
      phone: "9848088101",
    },
    {
      id: "eq-8d",
      name: "Kritika Portable HDPE Hose Reel Sprinkler Set",
      category: "Irrigation Equipment",
      owner: "R. Jagannadham",
      location: "Tanuku",
      rate: "₹550",
      rateUnit: "day",
      available: true,
      specs: "60mm Quick Latch Pipes, 20 Brass Impact Heads",
      description: "Portable sprinkler pipeline kit with 20 brass impact sprinklers and 60mm quick-couple latch pipes.",
      image: "/images/machines/kritika_hdpe_sprinkler_pipes.jpg",
      phone: "9848088212",
    },

    // 9. POWER TOOLS (4 items)
    {
      id: "eq-9",
      name: "STIHL Power Weeder & Brush Cutter 2.2 HP",
      category: "Power Tool",
      owner: "Venkatesh",
      location: "Eluru",
      rate: "₹200",
      rateUnit: "day",
      available: true,
      specs: "2.2 HP 40cc Petrol, 3-Tooth Blade, Double Harness",
      description: "Heavy duty 2-stroke petrol brush cutter tool with 3-tooth metal blade and tap-and-go nylon head.",
      image: "/images/machines/stihl_brush_cutter.jpg",
      phone: "9848090123",
    },
    {
      id: "eq-9b",
      name: "Husqvarna 455 Rancher Chainsaw 3.5 HP",
      category: "Power Tool",
      owner: "T. Anjaneyulu",
      location: "Rajahmundry",
      rate: "₹300",
      rateUnit: "day",
      available: true,
      specs: "55.5cc Engine, 20-inch Guide Bar, AutoTune Carburetor",
      description: "Professional 55.5cc petrol chainsaw with 20-inch guide bar for farm tree pruning, timber cutting, and land clearing.",
      image: "/images/machines/husqvarna_455_chainsaw.jpg",
      phone: "9848099001",
    },
    {
      id: "eq-9c",
      name: "KisanKraft Earth Auger Hole Digger 52cc",
      category: "Power Tool",
      owner: "B. Mohan Rao",
      location: "Mandapeta",
      rate: "₹250",
      rateUnit: "day",
      available: true,
      specs: "52cc 2-Stroke Petrol, 8-inch & 10-inch Bits, Plantation Digger",
      description: "One-man petrol earth auger with 8-inch and 10-inch heavy steel bits for fencing posts and tree sapling plantations.",
      image: "/images/machines/kisankraft_earth_auger.jpg",
      phone: "9848099112",
    },
    {
      id: "eq-9d",
      name: "Honda Petrol Engine Sugarcane & Crop Cutter",
      category: "Power Tool",
      owner: "M. Ramu",
      location: "Kakinada",
      rate: "₹350",
      rateUnit: "day",
      available: true,
      specs: "4-Stroke Engine, Carbide Tipped Blade, Lightweight Frame",
      description: "Portable 4-stroke crop harvester cutter tool for fast harvesting of sugarcane, paddy stalks, and fodder grass.",
      image: "/images/machines/honda_sugarcane_crop_cutter.jpg",
      phone: "9848099223",
    },

    // 10. OTHER FARM EQUIPMENT (4 items)
    {
      id: "eq-10",
      name: "Hydraulic Tipping Tractor Trolley 5-Ton",
      category: "Other",
      owner: "Suryanarayana",
      location: "Rajahmundry",
      rate: "₹500",
      rateUnit: "day",
      available: true,
      specs: "5-Ton Capacity, Single Axle, Hydraulic Ram Lift",
      description: "Heavy duty 5-tonne hydraulic tipping tractor trailer for agricultural crop haulage and transport.",
      image: "/images/machines/hydraulic_tipping_trolley.jpg",
      phone: "9848091234",
    },
    {
      id: "eq-10b",
      name: "Fieldking 3-Bottom Hydraulic Reversible MB Plough",
      category: "Other",
      owner: "K. Venkatadri",
      location: "Guntur",
      rate: "₹600",
      rateUnit: "hr",
      available: true,
      specs: "3 Bottom MB Plough, High Carbon Steel, Hydraulic Turnover",
      description: "Hydraulic reversible mouldboard plough for deep tillage, soil inversion, and breaking hard pan layers.",
      image: "/images/machines/fieldking_3bottom_mb_plough.jpg",
      phone: "9848091122",
    },
    {
      id: "eq-10c",
      name: "Redlands Sugarcane Trash Shredder & Mulcher",
      category: "Other",
      owner: "P. Subbaraju",
      location: "Tanuku",
      rate: "₹700",
      rateUnit: "hr",
      available: true,
      specs: "Tractor PTO Shaft Driven, Heavy Flail Blades, Organic Mulch",
      description: "PTO driven crop residue flail shredder for crushing sugarcane trash and crop straw into organic soil mulch.",
      image: "/images/machines/redlands_trash_mulcher.jpg",
      phone: "9848091233",
    },
    {
      id: "eq-10d",
      name: "Grain Solar Dryer Portable Chamber 500kg",
      category: "Other",
      owner: "D. Ramakrishna",
      location: "Vijayawada",
      rate: "₹400",
      rateUnit: "day",
      available: true,
      specs: "500kg Batch Capacity, Solar Powered Fans, UV Sheet",
      description: "Solar powered grain & spice drying chamber with forced air ventilation for hygienic drying of agricultural produce.",
      image: "/images/machines/grain_solar_dryer_chamber.jpg",
      phone: "9848091344",
    },
  ];

  const [equipmentList, setEquipmentList] = useState(initialEquipmentList);

  useEffect(() => {
    getMachines()
      .then((data) => {
        if (data && data.length > 0) {
          const mapped = data.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            owner: item.owner_name,
            location: item.location,
            rate: `₹${item.rental_rate}`,
            rateUnit: item.rate_unit || "hr",
            available: item.availability === "available",
            specs: item.specifications || "",
            description: item.description || "",
            image: getEquipmentImage(item.name, item.category, item.image_url),
            phone: item.owner_phone || "9848012345",
          }));
          setEquipmentList(mapped);
        }
      })
      .catch((err) => {
        console.error("Failed to load machines:", err);
      });
  }, []);

  const normalizeCategoryKey = (cat: string) => {
    const c = (cat || "").toLowerCase().trim();
    if (c === "all") return "all";
    if (c.includes("tractor")) return "tractor";
    if (c.includes("harvester")) return "harvester";
    if (c.includes("rotavator")) return "rotavator";
    if (c.includes("cultivator") || c.includes("tiller")) return "cultivator";
    if (c.includes("seeder") || c.includes("seed")) return "seeder";
    if (c.includes("sprayer")) return "sprayer";
    if (c.includes("water pump") || c.includes("pump")) return "water pump";
    if (c.includes("irrigation")) return "irrigation";
    if (c.includes("power tool") || c.includes("tool")) return "power tool";
    if (c.includes("other")) return "other";
    return c;
  };

  const filteredEquipment = useMemo(() => {
    return equipmentList.filter((item) => {
      const matchesQuery =
        `${item.name} ${item.category} ${item.owner} ${item.location} ${item.specs} ${item.description}`
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesCat =
        selectedCategory === "all" ||
        normalizeCategoryKey(item.category) === normalizeCategoryKey(selectedCategory);

      const matchesLoc = selectedLocation === "all" || item.location === selectedLocation;

      return matchesQuery && matchesCat && matchesLoc;
    });
  }, [equipmentList, query, selectedCategory, selectedLocation]);

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEquipName || !newEquipRate || !newEquipOwner) return;

    const newItem = {
      id: `eq-${Date.now()}`,
      name: newEquipName,
      category: newEquipCategory,
      owner: newEquipOwner,
      location: newEquipLocation,
      rate: `₹${newEquipRate}`,
      rateUnit: newEquipRateUnit,
      available: true,
      specs: newEquipSpecs || "Standard Farm Equipment Specs",
      description: newEquipDesc || "Listed for rent by verified farmer on PureFarm.",
      image:
        "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=800",
      phone: newEquipPhone || "9876543210",
    };

    setEquipmentList([newItem, ...equipmentList]);
    setIsListModalOpen(false);

    // Reset Form
    setNewEquipName("");
    setNewEquipRate("");
    setNewEquipSpecs("");
    setNewEquipDesc("");
    setNewEquipOwner("");
    setNewEquipPhone("");

    setRentalSuccessToast(
      isTelugu
        ? "మీ యంత్రం విజయవంతంగా జాబితా చేయబడింది!"
        : "Your equipment has been listed for rent successfully!",
    );
    setTimeout(() => setRentalSuccessToast(""), 4000);
  };

  const handleConfirmRentalRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipmentForRental) return;

    const equipName = selectedEquipmentForRental.name;
    setSelectedEquipmentForRental(null);

    setRentalSuccessToast(
      isTelugu
        ? `${equipName} కొరకు అద్దె అభ్యర్థన పంపబడింది!`
        : `Rental request sent for ${equipName}! Owner will contact you shortly.`,
    );
    setTimeout(() => setRentalSuccessToast(""), 5000);
  };

  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "student", "seller", "admin"]} allowGuest={true}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=2000"
        lightTheme={true}
        eyebrow="Agricultural Equipment"
        title="Machines & Tools"
        intro={
          isTelugu
            ? "మీ సమీపంలో ఉన్న రైతుల నుండి వ్యవసాయ యంత్రాలు మరియు పరికరాలను అద్దెకు తీసుకోండి"
            : "Rent agricultural machinery and tools from farmers near you"
        }
      >
        {/* Toast Notification */}
        {rentalSuccessToast && (
          <div className="fixed top-20 right-5 z-50 flex items-center gap-3 rounded-2xl bg-[#123F2D] px-5 py-4 text-white shadow-2xl animate-bounce">
            <CheckCircle2 className="h-6 w-6 text-[#10B981]" />
            <span className="text-sm font-bold">{rentalSuccessToast}</span>
          </div>
        )}

        <div className="mx-auto max-w-6xl space-y-8">
          {/* Two Main Action Banners */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Action Banner 1: List Your Machine/Tool */}
            <div className="relative overflow-hidden rounded-3xl border border-[#1E6446]/20 bg-gradient-to-br from-white/96 via-[#F0FDF4] to-[#E6F4ED] p-6 sm:p-8 shadow-xl shadow-emerald-950/5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#1E6446]/30 bg-[#E6F4ED] px-3.5 py-1 text-xs font-bold text-[#0D6E48]">
                    <PlusCircle className="h-3.5 w-3.5" />
                    {isTelugu ? "యంత్రాల యజమానులకు" : "For Machinery Owners"}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#123F2D]">
                    {isTelugu
                      ? "మీ యంత్రాలు / పరికరాలను జాబితా చేయండి"
                      : "List Your Machine / Tool"}
                  </h2>
                  <p className="text-sm font-medium leading-relaxed text-[#315A49]">
                    {isTelugu
                      ? "ఉపయోగించని ట్రాక్టర్లు, స్ప్రేయర్లు లేదా పరికరాలు ఉన్నాయా? అద్దెకు ఇచ్చి అదనపు ఆదాయం పొందండి."
                      : "Have tractors, harvesters, or sprayers sitting idle? List your equipment for rent and earn extra income from fellow farmers."}
                  </p>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#123F2D] text-white shadow-md">
                  <Wrench className="h-7 w-7" />
                </div>
              </div>
              <div className="mt-6">
                <Link
                  to="/machines-tools/list"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#123F2D] hover:bg-[#0D6E48] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02]"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>{isTelugu ? "అద్దెకు జాబితా చేయండి" : "List for Rent"}</span>
                </Link>
              </div>
            </div>

            {/* Action Banner 2: Browse & Rent Equipment */}
            <div className="relative overflow-hidden rounded-3xl border border-[#1E6446]/20 bg-gradient-to-br from-white/96 via-[#FAFDFB] to-[#F0FDF4] p-6 sm:p-8 shadow-xl shadow-emerald-950/5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#1E6446]/30 bg-[#E6F4ED] px-3.5 py-1 text-xs font-bold text-[#0D6E48]">
                    <Truck className="h-3.5 w-3.5" />
                    {isTelugu ? "అద్దెకు కావలసిన రైతులకు" : "For Farmers Needing Tools"}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#123F2D]">
                    {isTelugu
                      ? "పరికరాలను అన్వేషించండి & అద్దెకు తీసుకోండి"
                      : "Browse & Rent Equipment"}
                  </h2>
                  <p className="text-sm font-medium leading-relaxed text-[#315A49]">
                    {isTelugu
                      ? "నేల తయారీ, విత్తనాలు నాటడం లేదా కోత కొరకు యంత్రాలు కావలెనా? పారదర్శక ధరలతో వెతకండి."
                      : "Need machinery for land preparation, sowing, or harvest? Find verified equipment with transparent hourly/daily rates near you."}
                  </p>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#10B981] text-white shadow-md">
                  <Truck className="h-7 w-7" />
                </div>
              </div>
              <div className="mt-6">
                <a
                  href="#equipment-catalog"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#10B981] hover:bg-[#0D9668] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02]"
                >
                  <Search className="h-4 w-4" />
                  <span>{isTelugu ? "పరికరాలను బ్రౌజ్ చేయండి" : "Browse Equipment"}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Search & Filter Controls (Clean Light Glass Card) */}
          <div
            id="equipment-catalog"
            className="flex flex-col gap-5 rounded-3xl border border-[#1E6446]/20 bg-white/96 p-6 shadow-xl shadow-emerald-950/5 backdrop-blur-md"
          >
            {/* Search & Location Bar */}
            <div className="grid gap-4 sm:grid-cols-12">
              <div className="relative sm:col-span-8">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#10B981]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    isTelugu
                      ? "యంత్రాలు, పరికరాలను వెతకండి..."
                      : "Search machines, tools, equipment..."
                  }
                  className="w-full rounded-2xl border border-[#1E6446]/25 bg-slate-50/90 py-3.5 pl-12 pr-4 text-base font-semibold text-[#123F2D] placeholder-[#527064] transition-all focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#0D6E48] hover:text-[#10B981]"
                  >
                    {isTelugu ? "స్పష్టంచేయి" : "Clear"}
                  </button>
                )}
              </div>

              {/* Location Select */}
              <div className="relative sm:col-span-4">
                <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#10B981]" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full rounded-2xl border border-[#1E6446]/25 bg-slate-50/90 py-3.5 pl-10 pr-4 text-sm font-semibold text-[#123F2D] transition-all focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 cursor-pointer"
                >
                  <option value="all">{isTelugu ? "అన్ని ప్రాంతాలు" : "All Locations"}</option>
                  {locations
                    .filter((l) => l !== "all")
                    .map((loc) => (
                      <option key={loc} value={loc}>
                        📍 {loc}, AP
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Category Filter Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#1E6446]/10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D6E48] mr-1">
                {isTelugu ? "వర్గాలు:" : "Categories:"}
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs sm:text-sm transition-all ${
                    selectedCategory === cat
                      ? "bg-[#123F2D] text-white font-bold shadow-md shadow-emerald-950/20"
                      : "bg-white/95 border border-[#1E6446]/20 text-[#123F2D] font-semibold hover:bg-emerald-50 hover:text-[#10B981]"
                  }`}
                >
                  {cat === "all" ? (isTelugu ? "అన్నీ" : "All") : t(cat)}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count Header */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-[#123F2D]">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>
                {isTelugu
                  ? selectedCategory === "all"
                    ? `మొత్తం ${filteredEquipment.length} యంత్రాలు & పరికరాలు అందుబాటులో ఉన్నాయి`
                    : `${filteredEquipment.length} ${catNamesTe[selectedCategory] || selectedCategory} అందుబాటులో ఉన్నాయి`
                  : selectedCategory === "all"
                    ? `Showing ${filteredEquipment.length} Equipment Listings`
                    : `Showing ${filteredEquipment.length} ${selectedCategory} Available`}
              </span>
            </div>
          </div>

          {/* Equipment Cards Grid */}
          {filteredEquipment.length === 0 ? (
            <div className="rounded-3xl border border-[#1E6446]/20 bg-white/96 p-12 text-center shadow-xl">
              <Wrench className="mx-auto h-12 w-12 text-emerald-600/40" />
              <p className="mt-3 text-lg font-bold text-[#123F2D]">
                {isTelugu ? "పరికరాలు ఏవీ కనుగొనబడలేదు" : "No equipment found"}
              </p>
              <p className="mt-1 text-sm font-medium text-[#315A49]">
                {isTelugu
                  ? "మీ సెర్చ్‌కి సరిపోలే యంత్రాలు ఏవీ లేవు. దయచేసి ఫిల్టర్‌ని రీసెట్ చేయండి."
                  : "No equipment matched your query. Try adjusting your search or category filter."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEquipment.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#1E6446]/20 bg-white/96 shadow-xl shadow-emerald-950/5 transition-all duration-300 hover:bg-white hover:border-[#1E6446]/40 hover:-translate-y-1"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 rounded-full bg-[#123F2D]/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                        {t(item.category)}
                      </span>
                      <span className="absolute top-3 right-3 rounded-full bg-[#10B981] px-3 py-1 text-xs font-bold text-white shadow-md">
                        {isTelugu ? "అందుబాటులో ఉంది" : "Available"}
                      </span>
                    </div>

                    <div className="p-5 space-y-3">
                      {/* Name & Rate */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-[#123F2D] leading-snug group-hover:text-[#0D6E48] transition-colors">
                          {item.name}
                        </h3>
                      </div>

                      {/* Pricing Tag */}
                      <div className="inline-flex items-center gap-1 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] px-3 py-1 text-sm font-bold text-[#0D6E48]">
                        <span className="text-base font-extrabold">{item.rate}</span>
                        <span className="text-xs text-[#315A49]">
                          /{" "}
                          {item.rateUnit === "hr"
                            ? isTelugu
                              ? "గంట"
                              : "hr"
                            : isTelugu
                              ? "రోజు"
                              : "day"}
                        </span>
                      </div>

                      {/* Specs */}
                      <p className="text-xs font-semibold text-[#315A49] bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        ⚙️ <span className="font-bold text-[#123F2D]">{item.specs}</span>
                      </p>

                      {/* Owner & Location Details */}
                      <div className="space-y-1 text-xs font-semibold text-[#527064]">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-[#0D6E48]" />
                          <span>
                            {isTelugu ? "యజమాని:" : "Owner:"}{" "}
                            <strong className="text-[#123F2D]">{item.owner}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-[#0D6E48]" />
                          <span>📍 {item.location}, AP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rental CTA Button */}
                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={() => setSelectedEquipmentForRental(item)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#10B981] hover:bg-[#0D9668] py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg"
                    >
                      <Wrench className="h-4 w-4" />
                      <span>
                        {isTelugu ? "ఇప్పుడే అద్దెకు అభ్యర్థించండి" : "Rent Now / Request Rental"}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* OWNER LISTING MODAL ("List for Rent") */}
        {isListModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-5">
              <button
                type="button"
                onClick={() => setIsListModalOpen(false)}
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-1 border-b pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0D6E48]">
                  {isTelugu ? "వ్యవసాయ పరికరాల జాబితా" : "Agricultural Equipment Listing"}
                </span>
                <h3 className="text-xl font-extrabold text-[#123F2D]">
                  {isTelugu
                    ? "మీ యంత్రాన్ని అద్దెకు జాబితా చేయండి"
                    : "List Your Equipment for Rent"}
                </h3>
              </div>

              <form onSubmit={handleAddEquipment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1">
                    {isTelugu ? "పరికరం / యంత్రం పేరు" : "Machine / Tool Name"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEquipName}
                    onChange={(e) => setNewEquipName(e.target.value)}
                    placeholder="e.g. Mahindra 575 DI Tractor 45 HP"
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1">
                      {isTelugu ? "వర్గం" : "Category"}
                    </label>
                    <select
                      value={newEquipCategory}
                      onChange={(e) => setNewEquipCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981]"
                    >
                      {categories
                        .filter((c) => c !== "all")
                        .map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1">
                      {isTelugu ? "ప్రాంతం" : "Location"}
                    </label>
                    <select
                      value={newEquipLocation}
                      onChange={(e) => setNewEquipLocation(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981]"
                    >
                      {locations
                        .filter((l) => l !== "all")
                        .map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1">
                      {isTelugu ? "అద్దె ధర (₹)" : "Rental Price (₹)"} *
                    </label>
                    <input
                      type="number"
                      required
                      value={newEquipRate}
                      onChange={(e) => setNewEquipRate(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1">
                      {isTelugu ? "వ్యవధి" : "Per Unit"}
                    </label>
                    <select
                      value={newEquipRateUnit}
                      onChange={(e) => setNewEquipRateUnit(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981]"
                    >
                      <option value="hr">{isTelugu ? "గంటకు" : "Per Hour"}</option>
                      <option value="day">{isTelugu ? "రోజుకు" : "Per Day"}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1">
                    {isTelugu ? "ముఖ్యమైన వివరాలు / స్పెసిఫికేషన్లు" : "Specifications"}
                  </label>
                  <input
                    type="text"
                    value={newEquipSpecs}
                    onChange={(e) => setNewEquipSpecs(e.target.value)}
                    placeholder="e.g. 45 HP, Dual Clutch, Power Steering"
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1">
                      {isTelugu ? "యజమాని పేరు" : "Owner Name"} *
                    </label>
                    <input
                      type="text"
                      required
                      value={newEquipOwner}
                      onChange={(e) => setNewEquipOwner(e.target.value)}
                      placeholder="e.g. Ramesh Farmer"
                      className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1">
                      {isTelugu ? "ఫోన్ నంబర్" : "Mobile Number"}
                    </label>
                    <input
                      type="tel"
                      value={newEquipPhone}
                      onChange={(e) => setNewEquipPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981]"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-[#123F2D] hover:bg-[#0D6E48] py-3.5 font-bold text-white shadow-lg transition"
                  >
                    {isTelugu ? "జాబితాను ప్రచురించు" : "Publish Listing"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* REQUEST RENTAL MODAL */}
        {selectedEquipmentForRental && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-5">
              <button
                type="button"
                onClick={() => setSelectedEquipmentForRental(null)}
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-1 border-b pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0D6E48]">
                  {isTelugu ? "అద్దె అభ్యర్థన" : "Rental Request"}
                </span>
                <h3 className="text-xl font-extrabold text-[#123F2D]">
                  {selectedEquipmentForRental.name}
                </h3>
                <p className="text-xs font-bold text-[#315A49]">
                  {isTelugu ? "ధర:" : "Rate:"} {selectedEquipmentForRental.rate} /{" "}
                  {selectedEquipmentForRental.rateUnit === "hr" ? "hour" : "day"} • 📍{" "}
                  {selectedEquipmentForRental.location}
                </p>
              </div>

              <form onSubmit={handleConfirmRentalRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1">
                    {isTelugu ? "అవసరమైన తేదీ" : "Required Date"} *
                  </label>
                  <input
                    type="date"
                    required
                    value={rentalDate}
                    onChange={(e) => setRentalDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1">
                    {isTelugu ? "వ్యవధి (గంటలు / రోజులు)" : "Duration (Hours/Days)"} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={rentalDuration}
                    onChange={(e) => setRentalDuration(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1">
                    {isTelugu ? "పొలం చిరునామా / సూచనలు" : "Field Location & Notes"}
                  </label>
                  <textarea
                    rows={2}
                    value={rentalNotes}
                    onChange={(e) => setRentalNotes(e.target.value)}
                    placeholder="e.g. Near Panchayat Office, 5 acres tilling work"
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981]"
                  />
                </div>

                <div className="rounded-xl bg-[#F0FDF4] p-3 text-xs font-bold text-[#0D6E48] flex items-center justify-between border border-[#BBF7D0]">
                  <span>{isTelugu ? "యజమాని సంప్రదించు సంఖ్య:" : "Owner Contact:"}</span>
                  <a
                    href={`tel:${selectedEquipmentForRental.phone}`}
                    className="inline-flex items-center gap-1 text-[#123F2D] hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#10B981]" />
                    {selectedEquipmentForRental.phone}
                  </a>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-[#10B981] hover:bg-[#0D9668] py-3.5 font-bold text-white shadow-lg transition"
                  >
                    {isTelugu ? "అభ్యర్థనను పంపండి" : "Confirm Rental Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </PageShell>
    </RoleGuard>
  );
}

export function MachinesToolsListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTelugu =
    typeof window !== "undefined" && localStorage.getItem("purefarm_language") === "te";

  // Form Field States
  const [name, setName] = useState("");
  const [category, setCategory] = useState<MachineCategory>("Tractor");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState("Rajahmundry");
  const [rentalRate, setRentalRate] = useState("");
  const [rateUnit, setRateUnit] = useState<MachineRateUnit>("hr");
  const [availability, setAvailability] = useState<MachineAvailability>("available");
  const [condition, setCondition] = useState<MachineCondition>("Good");
  const [specifications, setSpecifications] = useState("");
  const [ownerName, setOwnerName] = useState(user?.name || "");
  const [ownerPhone, setOwnerPhone] = useState(user?.phone || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (user?.name && !ownerName) setOwnerName(user.name);
    if (user?.phone && !ownerPhone) setOwnerPhone(user.phone);
  }, [user]);

  const categories: MachineCategory[] = [
    "Tractor",
    "Harvester",
    "Rotavator",
    "Cultivator",
    "Seeder",
    "Sprayer",
    "Water Pump",
    "Irrigation Equipment",
    "Power Tool",
    "Other",
  ];

  const locations = [
    "Rajahmundry",
    "Kakinada",
    "Eluru",
    "Tanuku",
    "Mandapeta",
    "Vijayawada",
    "Visakhapatnam",
  ];

  const sampleImages = [
    {
      label: "Tractor",
      url: "/images/machines/tractor.jpg",
    },
    {
      label: "Harvester",
      url: "/images/machines/harvester.jpg",
    },
    {
      label: "Rotavator",
      url: "/images/machines/rotavator.jpg",
    },
    {
      label: "Sprayer",
      url: "/images/machines/sprayer.jpg",
    },
    {
      label: "Water Pump",
      url: "/images/machines/water_pump.jpg",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rentalRate || !ownerName) return;

    setIsSubmitting(true);
    try {
      await createMachine({
        farmer_id: user?.id || null,
        owner_name: ownerName,
        owner_phone: ownerPhone,
        name,
        category,
        description,
        image_url:
          imageUrl || sampleImages.find((i) => i.label === category)?.url || sampleImages[0].url,
        location,
        rental_rate: Number(rentalRate),
        rate_unit: rateUnit,
        availability,
        condition,
        specifications,
        status: "active",
      });

      setToastMessage(
        isTelugu
          ? "మీ యంత్రం / పరికరం అద్దెకు విజయవంతంగా జాబితా చేయబడింది!"
          : "Your machine / tool listing has been published for rent successfully!",
      );

      setTimeout(() => {
        navigate({ to: "/machines-tools" });
      }, 1200);
    } catch (err) {
      console.error("Failed to submit machine listing:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "student", "seller", "admin"]} allowGuest={true}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=2000"
        lightTheme={true}
        eyebrow={isTelugu ? "వ్యవసాయ పరికరాలు" : "Agricultural Equipment"}
        title={
          isTelugu
            ? "మీ యంత్రాన్ని / పరికరాన్ని అద్దెకు జాబితా చేయండి"
            : "List Your Machine / Tool for Rent"
        }
        intro={
          isTelugu
            ? "అవసరమైన రైతులకు మీ వ్యవసాయ యంత్రాలు మరియు పరికరాలను అద్దెకు ఇవ్వండి."
            : "Rent out your agricultural machinery and tools to farmers who need them."
        }
      >
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-20 right-5 z-50 flex items-center gap-3 rounded-2xl bg-[#123F2D] px-6 py-4 text-white shadow-2xl animate-bounce">
            <CheckCircle2 className="h-6 w-6 text-[#10B981]" />
            <span className="text-sm font-bold">{toastMessage}</span>
          </div>
        )}

        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <Link
              to="/machines-tools"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0D6E48] hover:text-[#123F2D] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>
                {isTelugu ? "← పరికరాల పేజీకి తిరిగి వెళ్లండి" : "Back to Machines & Tools"}
              </span>
            </Link>
          </div>

          <div className="rounded-3xl border border-[#1E6446]/20 bg-white/96 p-6 sm:p-10 shadow-xl shadow-emerald-950/5 backdrop-blur-md space-y-8">
            <div className="border-b border-slate-200 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#123F2D] text-white shadow-md">
                  <Wrench className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#123F2D]">
                    {isTelugu
                      ? "మీ యంత్రాన్ని / పరికరాన్ని అద్దెకు జాబితా చేయండి"
                      : "List Your Machine / Tool for Rent"}
                  </h2>
                  <p className="text-sm font-medium text-[#315A49]">
                    {isTelugu
                      ? "అవసరమైన రైతులకు మీ వ్యవసాయ యంత్రాలు మరియు పరికరాలను అద్దెకు ఇవ్వండి."
                      : "Rent out your agricultural machinery and tools to farmers who need them."}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* SECTION 1: MACHINE DETAILS */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0D6E48] border-b border-[#1E6446]/10 pb-2 flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  {isTelugu ? "1. యంత్రం / పరికరం వివరాలు" : "1. Machine & Tool Details"}
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1.5">
                      {isTelugu ? "పరికరం / యంత్రం పేరు" : "Machine / Tool Name"} *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={
                        isTelugu
                          ? "ఉదా: మహీంద్రా 575 DI ట్రాక్టర్ (45 HP)"
                          : "e.g. Mahindra 575 DI Tractor (45 HP)"
                      }
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50/80 p-3.5 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981] focus:bg-white focus:ring-2 focus:ring-[#10B981]/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1.5">
                      {isTelugu ? "వర్గం" : "Category"} *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as MachineCategory)}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50/80 p-3.5 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981] focus:bg-white focus:ring-2 focus:ring-[#10B981]/20 transition cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1.5">
                      {isTelugu ? "ప్రాంతం / ఊరు" : "Location"} *
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50/80 p-3.5 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981] focus:bg-white focus:ring-2 focus:ring-[#10B981]/20 transition cursor-pointer"
                    >
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>
                          📍 {loc}, AP
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1.5">
                      {isTelugu ? "వివరణ" : "Description"}
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={
                        isTelugu
                          ? "యంత్రం యొక్క పనితీరు, ఇంజిన్ సామర్థ్యం మరియు ఇతర ముఖ్య వివరాలను ఇక్కడ వివరించండి..."
                          : "Describe engine capacity, attachments, usage guidelines, and performance..."
                      }
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50/80 p-3.5 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981] focus:bg-white focus:ring-2 focus:ring-[#10B981]/20 transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1.5">
                      {isTelugu
                        ? "యంత్రం చిత్రం (Image URL లేదా నమూనా ని ఎంచుకోండి)"
                        : "Upload Machine / Tool Image URL"}
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50/80 p-3.5 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981] focus:bg-white focus:ring-2 focus:ring-[#10B981]/20 transition"
                    />
                    <div className="mt-2 flex flex-wrap gap-2 items-center">
                      <span className="text-xs font-bold text-[#527064]">
                        {isTelugu ? "త్వరిత ఫోటో నమూనా:" : "Quick Photo Presets:"}
                      </span>
                      {sampleImages.map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => setImageUrl(s.url)}
                          className={`rounded-xl px-2.5 py-1 text-xs font-bold border transition ${
                            imageUrl === s.url
                              ? "bg-[#123F2D] text-white border-[#123F2D]"
                              : "bg-slate-100 text-[#123F2D] border-slate-200 hover:bg-emerald-50"
                          }`}
                        >
                          📷 {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PRICING, AVAILABILITY & CONDITION */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0D6E48] border-b border-[#1E6446]/10 pb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {isTelugu
                    ? "2. అద్దె ధర & అందుబాటు వివరాలు"
                    : "2. Rental Pricing & Availability"}
                </h3>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1.5">
                      {isTelugu ? "అద్దె ధర (₹)" : "Rental Rate (₹)"} *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={rentalRate}
                      onChange={(e) => setRentalRate(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50/80 p-3.5 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981] focus:bg-white focus:ring-2 focus:ring-[#10B981]/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1.5">
                      {isTelugu ? "అద్దె వ్యవధి" : "Rental Unit"} *
                    </label>
                    <select
                      value={rateUnit}
                      onChange={(e) => setRateUnit(e.target.value as MachineRateUnit)}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50/80 p-3.5 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981] focus:bg-white focus:ring-2 focus:ring-[#10B981]/20 transition cursor-pointer"
                    >
                      <option value="hr">
                        {isTelugu ? "గంటకు (Per Hour)" : "Per Hour"}
                      </option>
                      <option value="day">{isTelugu ? "రోజుకు (Per Day)" : "Per Day"}</option>
                      <option value="week">{isTelugu ? "వారానికి (Per Week)" : "Per Week"}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1.5">
                      {isTelugu ? "అందుబాటు ప్రస్థితి" : "Availability"}
                    </label>
                    <select
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value as MachineAvailability)}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50/80 p-3.5 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981] focus:bg-white focus:ring-2 focus:ring-[#10B981]/20 transition cursor-pointer"
                    >
                      <option value="available">
                        {isTelugu
                          ? "ఇప్పుడే అందుబాటులో ఉంది (Available Now)"
                          : "Available Now"}
                      </option>
                      <option value="booked">
                        {isTelugu
                          ? "ముందస్తు బుకింగ్ మాత్రమే (Booking Only)"
                          : "Booking Only"}
                      </option>
                      <option value="maintenance">
                        {isTelugu ? "మరమ్మత్తులో ఉంది (Maintenance)" : "Maintenance"}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1.5">
                      {isTelugu ? "పరిస్థితి" : "Machine Condition"}
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as MachineCondition)}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50/80 p-3.5 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981] focus:bg-white focus:ring-2 focus:ring-[#10B981]/20 transition cursor-pointer"
                    >
                      <option value="Excellent">
                        {isTelugu ? "చాలా బాగుంది (Excellent)" : "Excellent"}
                      </option>
                      <option value="Good">{isTelugu ? "బాగుంది (Good)" : "Good"}</option>
                      <option value="Fair">{isTelugu ? "సాధారణం (Fair)" : "Fair"}</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1.5">
                      {isTelugu ? "ముఖ్య స్పెసిఫికేషన్లు" : "Specifications"}
                    </label>
                    <input
                      type="text"
                      value={specifications}
                      onChange={(e) => setSpecifications(e.target.value)}
                      placeholder={
                        isTelugu
                          ? "ఉదా: 45 HP, డీజిల్, పవర్ స్టీరింగ్"
                          : "e.g. 45 HP, Diesel, Power Steering, Dual Clutch"
                      }
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50/80 p-3.5 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981] focus:bg-white focus:ring-2 focus:ring-[#10B981]/20 transition"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: OWNER CONTACT INFO */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0D6E48] border-b border-[#1E6446]/10 pb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {isTelugu ? "3. యజమాని సంప్రదింపుల వివరాలు" : "3. Owner Contact Information"}
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1.5">
                      {isTelugu ? "యజమాని / రైతు పేరు" : "Owner / Farmer Name"} *
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder={isTelugu ? "ఉదా: రమేష్ వర్మ" : "e.g. Ramesh Varma"}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50/80 p-3.5 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981] focus:bg-white focus:ring-2 focus:ring-[#10B981]/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#123F2D] uppercase tracking-wider mb-1.5">
                      {isTelugu ? "ఫోన్ నంబర్" : "Mobile / Phone Number"} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50/80 p-3.5 text-sm font-semibold text-[#123F2D] outline-none focus:border-[#10B981] focus:bg-white focus:ring-2 focus:ring-[#10B981]/20 transition"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-4">
                <Link
                  to="/machines-tools"
                  className="rounded-2xl border border-slate-300 bg-slate-100 hover:bg-slate-200 px-6 py-3.5 text-sm font-bold text-[#123F2D] transition cursor-pointer"
                >
                  {isTelugu ? "రద్దు చేయి" : "Cancel"}
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#123F2D] hover:bg-[#0D6E48] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                >
                  <Wrench className="h-4 w-4" />
                  <span>
                    {isSubmitting
                      ? isTelugu
                        ? "ప్రచురించబడుతోంది..."
                        : "Publishing..."
                      : isTelugu
                        ? "అద్దెకు జాబితా చేయండి"
                        : "List for Rent"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </PageShell>
    </RoleGuard>
  );
}
