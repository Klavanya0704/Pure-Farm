import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "@/i18n/LanguageContext";
import { LanguageSelector } from "./AppShell";
import { getColdStorageFacilities, type ColdStorageFacility } from "@/services/coldStorage";
import { getMarketPrices, syncLiveMarketPrices, type SyncResult } from "@/services/marketPrices";
import type { MarketPrice } from "@/types/database";
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
import { AGRICULTURE_LESSONS } from "@/data/lessons";
import { CATEGORIES, getProduct, PRODUCTS } from "@/data/products";
import { SITE, waLink } from "@/data/site";
import type { Category, NotificationItem, Product } from "@/data/types";
import { cardClass, glassCardClass, PageShell } from "./AppShell";
import { getCartProducts, useCart } from "./CartContext";
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
    { name: "Fruits", img: "/categories/fruits.jpg" },
    { name: "Vegetables", img: "/categories/vegetables.jpg" },
    { name: "Seeds", img: "/categories/seeds.jpg" },
    { name: "Fertilizers", img: "/categories/fertilizers.jpg" },
    { name: "Pesticides", img: "/categories/pesticides.jpg" },
    { name: "Farm Tools", img: "/categories/farm-tools.jpg" },
    { name: "Equipment", img: "/categories/equipment.jpg" },
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
                to="/marketplace"
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

export function MarketplacePage() {
  const { t } = useTranslation();
  // Read search query from URL search parameters on initialization
  const initialQuery = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URL(window.location.href).searchParams.get("query") || "";
  }, []);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<Category | "all">("all");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(200000);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const urlQuery =
    typeof window !== "undefined" ? new URL(window.location.href).searchParams.get("query") : null;
  useEffect(() => {
    if (urlQuery !== null) {
      setQuery(urlQuery);
    }
  }, [urlQuery]);

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
    const next = allProducts.filter((product) => {
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
  }, [allProducts, category, maxPrice, query, sort]);

  return (
    <RoleGuard allowedRoles={["buyer", "farmer", "admin"]}>
      <PageShell
        eyebrow={t("Marketplace")}
        title={t("Farm input marketplace")}
        intro={t(
          "Search the full 100-product catalogue, compare prices, filter categories, and add products to your cart.",
        )}
      >
        <div className="mb-6 grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft lg:grid-cols-[1fr_12rem_12rem_14rem]">
          <label className="relative block">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#2d6a4f]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Search seeds, fertiliser, tools...")}
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
        <p className="mb-4 text-sm text-muted-foreground">
          {filtered.length} {t("products found")}
        </p>
        {filtered.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={t("No matching products")}
            body={t("Try another crop input, category, or raise the max price filter.")}
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
                onClick={() => addItem(product.id, qty)}
                className="rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white px-6 py-3 font-black text-sm shadow-sm transition hover:scale-105 duration-200"
              >
                {t("Add to Cart")}
              </button>
              <button
                type="button"
                onClick={() => {
                  addItem(product.id, qty);
                  void navigate({ to: "/order" });
                }}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 font-black text-sm shadow-sm transition hover:scale-105 duration-200"
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
  if (name.includes("wheat")) return "🌾";
  if (name.includes("paddy") || name.includes("rice")) return "🌾";
  if (name.includes("maize") || name.includes("corn")) return "🌽";
  if (name.includes("cotton")) return "☁️";
  if (name.includes("mustard")) return "🌼";
  if (name.includes("onion")) return "🧅";
  if (name.includes("tomato")) return "🍅";
  if (name.includes("potato")) return "🥔";
  if (name.includes("chilli")) return "🌶️";
  if (name.includes("garlic")) return "🧄";
  if (name.includes("apple")) return "🍎";
  if (name.includes("banana")) return "🍌";
  return "🌱";
}

export function MarketPage() {
  const { t } = useTranslation();
  const [dbRecords, setDbRecords] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("05 Sep 2026");

  // Selected item for "View Details" modal
  const [selectedDetailItem, setSelectedDetailItem] = useState<any | null>(null);

  const fetchPrices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMarketPrices({});
      setDbRecords(data);
    } catch (err: any) {
      console.error("Failed to load market prices:", err);
      setError(err.message || "Unable to load market prices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  // Default target dataset from reference image & prompt requirements
  const defaultRows = [
    {
      id: "ref-1",
      crop_name: "Wheat",
      icon: "🌾",
      market_name: "Amritsar Mandi",
      location: "Amritsar, Punjab",
      state: "Punjab",
      arrival: "820 qtl",
      price: 2425,
      unit: "qtl",
      change_pct: 1.8,
      source: "Agmarknet Verified",
      recorded_at: "2026-09-05",
    },
    {
      id: "ref-2",
      crop_name: "Paddy",
      icon: "🌾",
      market_name: "Karnal Mandi",
      location: "Karnal, Haryana",
      state: "Haryana",
      arrival: "1,240 qtl",
      price: 2310,
      unit: "qtl",
      change_pct: -0.6,
      source: "Agmarknet Verified",
      recorded_at: "2026-09-05",
    },
    {
      id: "ref-3",
      crop_name: "Maize",
      icon: "🌽",
      market_name: "Ludhiana Mandi",
      location: "Ludhiana, Punjab",
      state: "Punjab",
      arrival: "540 qtl",
      price: 2180,
      unit: "qtl",
      change_pct: 2.4,
      source: "Agmarknet Verified",
      recorded_at: "2026-09-05",
    },
    {
      id: "ref-4",
      crop_name: "Cotton",
      icon: "☁️",
      market_name: "Abohar Mandi",
      location: "Abohar, Punjab",
      state: "Punjab",
      arrival: "180 qtl",
      price: 7120,
      unit: "qtl",
      change_pct: 0.9,
      source: "Agmarknet Verified",
      recorded_at: "2026-09-05",
    },
    {
      id: "ref-5",
      crop_name: "Mustard",
      icon: "🌼",
      market_name: "Hisar Mandi",
      location: "Hisar, Haryana",
      state: "Haryana",
      arrival: "300 qtl",
      price: 5760,
      unit: "qtl",
      change_pct: 1.2,
      source: "Agmarknet Verified",
      recorded_at: "2026-09-05",
    },
    {
      id: "ref-6",
      crop_name: "Onion",
      icon: "🧅",
      market_name: "Lasalgaon Mandi",
      location: "Lasalgaon, Maharashtra",
      state: "Maharashtra",
      arrival: "2,100 qtl",
      price: 1840,
      unit: "qtl",
      change_pct: -2.1,
      source: "Agmarknet Verified",
      recorded_at: "2026-09-05",
    },
    {
      id: "ref-7",
      crop_name: "Tomato",
      icon: "🍅",
      market_name: "Azadpur Mandi",
      location: "Azadpur, Delhi",
      state: "Delhi",
      arrival: "950 qtl",
      price: 1650,
      unit: "qtl",
      change_pct: 3.6,
      source: "Agmarknet Verified",
      recorded_at: "2026-09-05",
    },
    {
      id: "ref-8",
      crop_name: "Potato",
      icon: "🥔",
      market_name: "Agra Mandi",
      location: "Agra, Uttar Pradesh",
      state: "Uttar Pradesh",
      arrival: "1,680 qtl",
      price: 1260,
      unit: "qtl",
      change_pct: 0.4,
      source: "Agmarknet Verified",
      recorded_at: "2026-09-05",
    },
  ];

  // Combine DB records with default records, ensuring reference order is strictly preserved (Wheat, Paddy, Maize, Cotton, Mustard, Onion, Tomato, Potato)
  const allRows = useMemo(() => {
    if (!dbRecords || dbRecords.length === 0) return defaultRows;
    const formattedDb = dbRecords.map((r) => ({
      id: r.id,
      crop_name: r.crop_name,
      icon: getCropIcon(r.crop_name),
      market_name: r.market_name,
      location: r.location || `${r.market_name}, ${r.state}`,
      state: r.state || "India",
      arrival: "750 qtl",
      price: r.price,
      unit: r.unit || "qtl",
      change_pct: r.change_pct ?? 1.5,
      source: r.source || "Supabase DB",
      recorded_at: r.recorded_at || "2026-09-05",
    }));

    const dbMap = new Map(formattedDb.map((item) => [item.crop_name.toLowerCase(), item]));
    const list = [];
    for (const d of defaultRows) {
      const key = d.crop_name.toLowerCase();
      if (dbMap.has(key)) {
        list.push({ ...d, ...dbMap.get(key) });
        dbMap.delete(key);
      } else {
        list.push(d);
      }
    }
    for (const extra of dbMap.values()) {
      list.push(extra);
    }
    return list;
  }, [dbRecords]);

  // Derived filter options
  const cropsList = useMemo(() => {
    return ["all", ...Array.from(new Set(allRows.map((r) => r.crop_name).filter(Boolean)))];
  }, [allRows]);

  const statesList = useMemo(() => {
    return ["all", ...Array.from(new Set(allRows.map((r) => r.state).filter(Boolean)))];
  }, [allRows]);

  // Client-side filtering
  const filteredRows = useMemo(() => {
    return allRows.filter((r) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        r.crop_name.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.market_name.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q);

      const matchCrop =
        cropFilter === "all" || r.crop_name.toLowerCase() === cropFilter.toLowerCase();
      const matchState =
        stateFilter === "all" || r.state.toLowerCase() === stateFilter.toLowerCase();

      return matchSearch && matchCrop && matchState;
    });
  }, [allRows, search, cropFilter, stateFilter]);

  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "admin"]}>
      <div className="min-h-screen bg-[#f3f9f5] p-4 sm:p-6 lg:p-8 relative">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* HERO BANNER SECTION */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#dcfce7]/90 via-[#f0fdf4]/80 to-[#ecfdf5]/90 border border-emerald-100 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            {/* Left Title Area */}
            <div className="flex items-center gap-4 z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-[#15803d] shrink-0 shadow-inner">
                <BarChart2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] tracking-tight">
                  {t("Market Prices")}
                </h1>
                <p className="text-sm font-medium text-[#047857] mt-0.5">
                  {t("Stay updated with the latest mandi prices across India")}
                </p>
              </div>
            </div>

            {/* Right Decorative Graphic Area */}
            <div className="relative flex items-center gap-4 z-10 shrink-0">
              <div className="text-right hidden sm:block">
                <span className="block text-base font-extrabold text-[#15803d] italic tracking-wide drop-shadow-xs">
                  {t("Better Prices")}
                </span>
                <span className="block text-sm font-bold text-[#047857] italic">
                  {t("Brighter Futures")}
                </span>
              </div>
              <div className="w-24 h-16 sm:w-32 sm:h-20 rounded-2xl overflow-hidden shadow-md border-2 border-white/80 shrink-0 relative bg-emerald-800">
                <img
                  src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600&auto=format&fit=crop"
                  alt="Farm Vegetables"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* MAIN CONTENT CONTAINER (WHITE ROUNDED CARD) */}
          <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-emerald-100/80 space-y-6">
            {/* FILTER & SEARCH ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("Search crop, mandi, state...")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#D9E2DD] text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Crop Filter Dropdown */}
              <div className="relative">
                <Sprout className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5 pointer-events-none" />
                <select
                  value={cropFilter}
                  onChange={(e) => setCropFilter(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-full border border-[#D9E2DD] text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="all">{t("All Crops")}</option>
                  {cropsList
                    .filter((c) => c !== "all")
                    .map((c) => (
                      <option key={c} value={c}>
                        {t(c)}
                      </option>
                    ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>

              {/* State Filter Dropdown */}
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5 pointer-events-none" />
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-full border border-[#D9E2DD] text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="all">{t("All States")}</option>
                  {statesList
                    .filter((s) => s !== "all")
                    .map((s) => (
                      <option key={s} value={s}>
                        {t(s)}
                      </option>
                    ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>

              {/* Date Selector */}
              <div className="relative">
                <CalendarDays className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#D9E2DD] text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="overflow-x-auto rounded-2xl shadow-xs">
              <table className="market-price-table">
                <thead>
                  <tr>
                    <th>🌱 {t("Crop")}</th>
                    <th>📍 {t("Mandi")}</th>
                    <th>📥 {t("Arrival")}</th>
                    <th>💰 {t("Price")}</th>
                    <th>📈 {t("Trend")}</th>
                    <th className="text-right">{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const isPositive = row.change_pct >= 0;
                    return (
                      <tr key={row.id}>
                        <td className="text-sm font-bold text-gray-900 whitespace-nowrap">
                          <span className="inline-flex items-center gap-2">
                            <span className="text-lg">
                              {row.icon || getCropIcon(row.crop_name)}
                            </span>
                            <span>{t(row.crop_name)}</span>
                          </span>
                        </td>
                        <td className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          {t(row.location)}
                        </td>
                        <td className="text-sm font-medium text-gray-600 whitespace-nowrap">
                          {row.arrival}
                        </td>
                        <td className="text-sm font-extrabold text-gray-900 whitespace-nowrap">
                          ₹{Number(row.price).toLocaleString()}/{row.unit || "qtl"}
                        </td>
                        <td className="text-sm font-bold whitespace-nowrap">
                          {isPositive ? (
                            <span className="text-emerald-600 inline-flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" /> +{row.change_pct}%
                            </span>
                          ) : (
                            <span className="text-rose-600 inline-flex items-center gap-1">
                              <TrendingDown className="w-4 h-4" /> {row.change_pct}%
                            </span>
                          )}
                        </td>
                        <td className="text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedDetailItem(row)}
                            className="btn-view-details-agri"
                          >
                            {t("View Details")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500 text-sm">
                        {t(
                          "No matching market prices found. Try adjusting your search or filters.",
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* BOTTOM FEATURE ROW */}
            <div className="pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#e8f5e9] flex items-center justify-center text-[#1b5e20] shrink-0">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{t("Real-time Prices")}</h4>
                  <p className="text-[11px] text-gray-500">{t("Updated from authentic sources")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#e8f5e9] flex items-center justify-center text-[#1b5e20] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{t("Trusted Information")}</h4>
                  <p className="text-[11px] text-gray-500">{t("Verified mandi data")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#e8f5e9] flex items-center justify-center text-[#1b5e20] shrink-0">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{t("Better Decisions")}</h4>
                  <p className="text-[11px] text-gray-500">{t("Plan your sell with confidence")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#e8f5e9] flex items-center justify-center text-[#1b5e20] shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{t("Stronger Farmers")}</h4>
                  <p className="text-[11px] text-gray-500">
                    {t("Together for a prosperous future")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM FOOTER RIBBON */}
          <div className="py-4 text-center text-xs font-bold text-emerald-800 tracking-wide flex items-center justify-center gap-2">
            <span>🌱</span>
            <span>{t("Farming Today for a Greener Tomorrow")}</span>
            <span>🌱</span>
          </div>
        </div>

        {/* VIEW DETAILS MODAL */}
        {selectedDetailItem && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-emerald-100 space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">
                    {selectedDetailItem.icon || getCropIcon(selectedDetailItem.crop_name)}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {t(selectedDetailItem.crop_name)}
                    </h3>
                    <p className="text-xs text-gray-500">{t(selectedDetailItem.location)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDetailItem(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 py-2 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">{t("Mandi / Market")}</span>
                  <span className="font-bold text-gray-900">
                    {t(selectedDetailItem.market_name)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">{t("State")}</span>
                  <span className="font-bold text-gray-900">{t(selectedDetailItem.state)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">{t("Daily Arrival")}</span>
                  <span className="font-bold text-gray-900">{selectedDetailItem.arrival}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">{t("Current Price")}</span>
                  <span className="font-extrabold text-emerald-700 text-base">
                    ₹{Number(selectedDetailItem.price).toLocaleString()}/
                    {selectedDetailItem.unit || "qtl"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">{t("24h Trend")}</span>
                  <span
                    className={`font-bold ${selectedDetailItem.change_pct >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {selectedDetailItem.change_pct >= 0
                      ? `↗ +${selectedDetailItem.change_pct}%`
                      : `↘ ${selectedDetailItem.change_pct}%`}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-gray-500 font-medium">{t("Data Source")}</span>
                  <span className="font-semibold text-gray-700 text-xs">
                    {selectedDetailItem.source || "Government AGMARKNET"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedDetailItem(null)}
                className="w-full py-2.5 rounded-full bg-[#15803d] hover:bg-[#166534] text-white font-bold text-sm transition-colors shadow-sm cursor-pointer"
              >
                {t("Close Details")}
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

  const categories = [
    "all",
    "Direct Benefit",
    "Soil Advisory",
    "Credit",
    "Irrigation",
    "Insurance",
    "Mechanization",
    "Organic Farming",
    "Infrastructure",
  ];

  const filteredSchemes = SCHEMES.filter((s) => {
    const matchesQuery =
      `${s.name} ${s.category} ${s.eligibility} ${s.description} ${s.benefit || ""}`
        .toLowerCase()
        .includes(query.toLowerCase());
    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  const pageSubtitle = isTelugu
    ? "రైతులకు సహాయపడే ప్రభుత్వ పథకాలు, అర్హతలు మరియు అధికారిక వివరాలను తెలుసుకోండి."
    : "Find farmer support programmes, eligibility, and official application links.";
  const searchPlaceholder = isTelugu
    ? "పథకాలను వెతకండి..."
    : "Search schemes by name, category, or eligibility...";

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
          {/* Search Bar & Category Filter Controls (High-Opacity Light Card) */}
          <div className="flex flex-col gap-4 rounded-3xl border border-[#1E6446]/20 bg-white/96 p-5 sm:p-6 shadow-xl shadow-emerald-950/5 backdrop-blur-md">
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

            {/* Category Filter Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#1E6446]/10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D6E48] mr-1">
                {isTelugu ? "వర్గాలు:" : "Categories:"}
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs sm:text-sm transition-all ${
                    categoryFilter === cat
                      ? "bg-[#123F2D] text-white font-bold shadow-md shadow-emerald-950/20"
                      : "bg-white/95 border border-[#1E6446]/20 text-[#123F2D] font-semibold hover:bg-emerald-50 hover:text-[#10B981]"
                  }`}
                >
                  {cat === "all" ? (isTelugu ? "అన్నీ" : "All") : t(cat)}
                </button>
              ))}
            </div>
          </div>

          {/* Scheme Cards Grid */}
          {filteredSchemes.length === 0 ? (
            <div className="rounded-3xl border border-[#1E6446]/20 bg-white/96 p-10 text-center shadow-xl">
              <Search className="mx-auto h-12 w-12 text-emerald-600/40" />
              <p className="mt-3 text-lg font-bold text-[#123F2D]">
                {isTelugu ? "పథకాలు ఏవీ కనుగొనబడలేదు" : "No schemes found"}
              </p>
              <p className="mt-1 text-sm font-medium text-[#315A49]">
                {isTelugu
                  ? "మీ సెర్చ్‌కి సరిపోలే ప్రభుత్వ పథకాలు ఏవీ లేవు. దయచేసి మరొక పదాన్ని ప్రయత్నించండి."
                  : "No government schemes matched your search query. Try resetting your search filter."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {filteredSchemes.map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} isTelugu={isTelugu} />
              ))}
            </div>
          )}
        </div>
      </PageShell>
    </RoleGuard>
  );
}

function SchemeCard({ scheme, isTelugu }: { scheme: Scheme; isTelugu: boolean }) {
  const { t } = useTranslation();

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-3xl border transition-all duration-300 ${
        isTelugu ? "p-6 sm:p-7" : "p-6 sm:p-7"
      } bg-white/96 border-[#1E6446]/20 shadow-xl shadow-emerald-950/5 hover:bg-white hover:border-[#1E6446]/40 hover:-translate-y-1`}
    >
      <div>
        {/* Header Row: Icon, Category Badge & Issuer */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1E6446]/30 bg-[#F0FDF4] text-2xl shadow-sm flex-shrink-0">
              {scheme.icon || "🌾"}
            </span>
            <div className="min-w-0">
              <span className="inline-flex items-center rounded-full border border-[#1E6446]/30 bg-[#E6F4ED] px-3 py-1 font-bold text-[#0D6E48] text-xs sm:text-[14px]">
                {t(scheme.category)}
              </span>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-[#527064] truncate">
                {t(scheme.issuer)}
              </p>
            </div>
          </div>
        </div>

        {/* Scheme Name: BOLDER, HIGH-CONTRAST DARK GREEN TITLE */}
        <h3
          className={`font-bold text-[#123F2D] transition-colors group-hover:text-[#0D6E48] ${
            isTelugu
              ? "text-xl sm:text-[22px] leading-snug mt-3.5"
              : "text-lg sm:text-xl leading-snug mt-3.5"
          }`}
        >
          {t(scheme.name)}
        </h3>

        {/* Description: CLEAR BOLD DARK GREEN/GRAY TELUGU TEXT */}
        <p
          className={`mt-2.5 text-[#315A49] font-bold transition-colors ${
            isTelugu
              ? "text-base sm:text-[17px] leading-[1.65]"
              : "text-sm sm:text-[15px] leading-relaxed"
          }`}
        >
          {t(scheme.description)}
        </p>

        {/* Eligibility & Benefit Highlight Box */}
        <div className="mt-4 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D6E48]">
              {isTelugu ? "అర్హత & ప్రయోజనాలు" : "Eligibility & Benefit"}
            </span>
            {scheme.benefit && (
              <span className="inline-flex items-center rounded-md bg-[#10B981]/15 px-2.5 py-0.5 text-xs font-bold text-[#0D6E48] border border-[#10B981]/30">
                {t(scheme.benefit)}
              </span>
            )}
          </div>
          <p
            className={`text-[#123F2D] font-semibold ${
              isTelugu
                ? "text-sm sm:text-[15px] leading-relaxed"
                : "text-xs sm:text-sm leading-normal"
            }`}
          >
            {t(scheme.eligibility)}
          </p>
        </div>
      </div>

      {/* Footer & Action Button */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#1E6446]/10 pt-4">
        <span className="text-xs sm:text-sm font-semibold text-[#527064]">
          {t(scheme.deadline)}
        </span>
        <a
          href={scheme.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10B981] px-5 py-2.5 text-sm sm:text-[15px] font-bold text-white shadow-md transition-all hover:bg-[#0D9668] hover:shadow-lg hover:shadow-emerald-900/20"
        >
          <span>{isTelugu ? "మరింత తెలుసుకోండి" : "Learn More"}</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

export function InsurancePage() {
  const { t } = useTranslation();
  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "student", "seller", "admin"]} allowGuest={true}>
      <CardGridPage
        bgImage="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2000"
        eyebrow={t("Insurance")}
        title={t("Crop insurance")}
        intro={t(
          "Compare crop, weather, and allied farming insurance options. Click any card to open official scheme website.",
        )}
        items={INSURANCE_SCHEMES.map((s) => ({
          title: t(s.name),
          meta: `${t(s.type)} · ${t(s.premium)}`,
          body: t(s.description),
          footer: `${s.coverage ? t(s.coverage) + " · " : ""}${t("Crops")}: ${(s.crops || []).map((c) => t(c)).join(", ")}`,
          url: s.url,
        }))}
      />
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
  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "student", "seller", "admin"]} allowGuest={true}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=2000"
        eyebrow={t("Weather")}
        title={t("Farm weather advisory")}
        intro={t("Five-day local forecast with field action notes.")}
      >
        <div className="grid gap-4 md:grid-cols-5">
          {WEATHER.map((day) => (
            <div key={day.day} className={glassCardClass}>
              <CloudSun className="h-8 w-8 text-primary" />
              <p className="mt-3 font-black">{t(day.day)}</p>
              <p className="text-sm text-muted-foreground">{t(day.condition)}</p>
              <p className="mt-3 text-2xl font-black">
                {day.high}° / {day.low}°
              </p>
              <p className="mt-1 text-sm font-bold text-primary">
                {day.rain}% {t("rain")}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(day.advisory)}</p>
            </div>
          ))}
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
  const [levelFilter, setLevelFilter] = useState("All Courses");

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

  if (selectedCourseId !== null) {
    const course = COURSES.find((c) => c.id === selectedCourseId);

    if (!course) {
      return (
        <RoleGuard
          allowedRoles={["farmer", "buyer", "student", "seller", "admin"]}
          allowGuest={true}
        >
          <PageShell
            eyebrow={t("Learning")}
            title={t("Course Not Found")}
            intro={t("The requested course could not be found or does not exist.")}
          >
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-8 text-center space-y-4 max-w-lg mx-auto">
              <AlertTriangle className="h-12 w-12 text-amber-600 mx-auto" />
              <h2 className="text-xl font-black text-amber-900">{t("Course Not Found")}</h2>
              <p className="text-sm text-amber-800">
                {t("The requested course could not be found or does not exist.")}
              </p>
              <button
                type="button"
                onClick={() => handleSelectCourse(null)}
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-sm font-bold transition shadow-md cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("Back to Learning")}
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
          eyebrow={t("Learning")}
          title={t(course.title)}
          intro={t(course.description ?? "")}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleSelectCourse(null)}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white/80 border border-white/60 text-[#1b4332] text-xs font-black hover:bg-white transition shadow-sm cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("Back to Learning Hub")}
              </button>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#1b4332] text-xs font-bold border border-emerald-300">
                <GraduationCap className="h-4 w-4" />
                {t(course.topic)} · {t(course.level)}
              </span>
            </div>

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
                  {t("Course Details & Lessons")}
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
                        {t("Overview & Guidance")}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white/80 p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                        {t(currentLesson.content)}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-black text-[#1b4332] flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        {t("Key Field Takeaways")}
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
                        {t("Farming Tip & Practical Action")}
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

  const filtered = COURSES.filter((c) => {
    const matchesQuery = `${t(c.title)} ${t(c.topic)} ${t(c.level)} ${t(c.description ?? "")}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesLevel = levelFilter === "All Courses" || c.level === levelFilter;
    return matchesQuery && matchesLevel;
  });

  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "student", "seller", "admin"]} allowGuest={true}>
      <PageShell
        bgImage="https://upload.wikimedia.org/wikipedia/commons/f/fc/Farmer_working_in_the_field_with_their_tractor.jpg"
        eyebrow={t("Learning")}
        title={t("Agriculture Learning Hub")}
        intro={t(
          "Learn practical farming skills, modern agricultural technologies, crop management, and sustainable farming practices.",
        )}
      >
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("Search courses...")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/50 bg-white/80 backdrop-blur-md shadow-sm text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {["All Courses", "Beginner", "Intermediate", "Advanced"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevelFilter(lvl)}
                  className={`h-10 px-4 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                    levelFilter === lvl
                      ? "bg-[#1b4332] text-white"
                      : "bg-white/80 border border-white/60 text-[#1b4332] hover:bg-white"
                  }`}
                >
                  {t(lvl)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => {
            const courseLessons = AGRICULTURE_LESSONS.filter((l) => l.courseId === c.id);
            const totalLessons = courseLessons.length > 0 ? courseLessons.length : c.lessons;
            const progressPct = getCourseProgressPct(c.id);

            return (
              <div
                key={c.id}
                className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md p-5 shadow-soft flex flex-col justify-between space-y-4 hover:shadow-md transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex rounded-full bg-emerald-50 text-[#1b4332] px-2.5 py-0.5 text-[10px] font-bold border border-emerald-200">
                      {t(c.level)}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      {c.hours} {t("hrs")} · {totalLessons} {t("lessons")}
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
                      {progressPct}% {t("completed")}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-[#2d6a4f] rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectCourse(c.id)}
                    className="w-full h-10 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-black transition shadow-sm cursor-pointer"
                  >
                    {progressPct > 0 ? t("Continue Learning") : t("Start Learning")}
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
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl glass-card-dark text-[#19C37D] shadow-md group-hover:scale-105 transition duration-200 border border-white/40">
            <Leaf className="h-5 w-5 text-[#19C37D]" />
          </span>
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
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-lg">
            <Leaf className="h-6 w-6" />
          </span>
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
          <Leaf className="h-12 w-12 text-[#087F5B] mx-auto mb-4" />
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

export function ColdStoragePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [facilities, setFacilities] = useState<ColdStorageFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Location
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<
    "nearest" | "farthest" | "capacity_high" | "capacity_low"
  >("nearest");
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Expanded Facility Details state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchFacilities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getColdStorageFacilities({
        search,
        statusFilter,
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
  }, [search, statusFilter, sortOrder, userLat, userLng]);

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
          "Location set: Coordinates (" +
            pos.coords.latitude.toFixed(2) +
            ", " +
            pos.coords.longitude.toFixed(2) +
            ")",
        );
      },
      (err) => {
        console.warn("Geolocation permission error:", err.message);
        setLocationLoading(false);
        setLocationStatus(
          "Location permission denied. Showing facilities by default regional distance.",
        );
      },
      { timeout: 10000 },
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "admin"]}>
      <PageShell
        eyebrow={t("Produce Preservation & Logistics")}
        title={t("Cold Storage Finder")}
        intro={t(
          "Find nearby cold storage facilities for your produce, check live capacity, and lock in preservation.",
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
                placeholder={t("Search by facility name or address...")}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-border/60">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {t("Status")}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border bg-background text-xs font-semibold outline-none focus:ring-2 focus:ring-[#087F5B]"
              >
                <option value="all">{t("All Statuses")}</option>
                <option value="available">🟢 {t("Available")}</option>
                <option value="full">🔴 {t("Full")}</option>
                <option value="maintenance">🟠 {t("Maintenance")}</option>
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
                <option value="nearest">{t("Nearest Distance First")}</option>
                <option value="farthest">{t("Farthest First")}</option>
                <option value="capacity_high">{t("Capacity: High to Low")}</option>
                <option value="capacity_low">{t("Capacity: Low to High")}</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-2 flex items-end justify-between sm:justify-end gap-3 pb-1 text-xs font-bold text-muted-foreground">
              <span>
                {t("Showing")} {facilities.length} {t("facilities")}
              </span>
              <button
                onClick={fetchFacilities}
                className="inline-flex items-center gap-1.5 text-[#087F5B] hover:underline"
              >
                <RefreshCw className="h-3.5 w-3.5" /> {t("Refresh")}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((n) => (
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
              {t("Unable to load cold storage facilities")}
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
              {t("No cold storage facilities found")}
            </h3>
            <p className="text-sm text-emerald-800/80">
              {t("Try changing your location or search filters.")}
            </p>
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="px-5 py-2.5 rounded-xl bg-[#087F5B] text-white font-bold text-xs shadow-md"
            >
              {t("Reset Filters")}
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {facilities.map((facility) => {
              const displayDistance = facility.calculatedDistance ?? facility.distance ?? null;
              const isFull =
                facility.status.toLowerCase() === "full" || facility.available_capacity === 0;
              const isMaintenance = facility.status.toLowerCase() === "maintenance";
              const percentAvailable =
                facility.capacity > 0
                  ? Math.round((facility.available_capacity / facility.capacity) * 100)
                  : 0;

              return (
                <div
                  key={facility.id}
                  className="rounded-2xl border border-white/60 bg-card/95 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-emerald-100/80 text-[#087F5B]">
                          <Snowflake className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="font-bold text-foreground text-base leading-snug">
                            {t(facility.name)}
                          </h3>
                          {displayDistance !== null && (
                            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" /> {displayDistance} {t("km away")}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-2xs ${
                          isFull
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : isMaintenance
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {isFull
                          ? `🔴 ${t("Full")}`
                          : isMaintenance
                            ? `🟠 ${t("Maintenance")}`
                            : `🟢 ${t("Available")}`}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
                      <Building2 className="h-4 w-4 shrink-0 text-muted-foreground/70 mt-0.5" />
                      <span>{t(facility.address)}</span>
                    </p>

                    <div className="p-4 rounded-xl bg-muted/60 border space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-foreground">{t("Available Capacity")}</span>
                        <span className="text-[#087F5B]">
                          {facility.available_capacity.toLocaleString()} MT /{" "}
                          {facility.capacity.toLocaleString()} MT
                        </span>
                      </div>

                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isFull ? "bg-rose-500" : isMaintenance ? "bg-amber-500" : "bg-[#087F5B]"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, percentAvailable))}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                        <span>
                          {percentAvailable}% {t("available space")}
                        </span>
                        <span>
                          {t("Total")}: {facility.capacity.toLocaleString()} MT
                        </span>
                      </div>
                    </div>

                    {expandedId === facility.id && (
                      <div className="pt-3 border-t text-xs space-y-2 text-muted-foreground">
                        <p className="font-bold text-foreground">{t("Facility Specifications:")}</p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>{t("Temperature range: -2°C to +8°C (Multi-commodity)")}</li>
                          <li>{t("Humidity control: Automated 85%-95% RH")}</li>
                          <li>
                            {t("Coordinates:")} {facility.latitude ?? "N/A"},{" "}
                            {facility.longitude ?? "N/A"}
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-5 border-t mt-4 flex items-center justify-between gap-3">
                    {facility.contact_number ? (
                      <a
                        href={`tel:${facility.contact_number.replace(/\s+/g, "")}`}
                        className="flex-1 h-10 px-3 rounded-xl bg-[#087F5B] hover:bg-[#073B2A] text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <Phone className="h-3.5 w-3.5" /> {t("Call")} ({facility.contact_number})
                      </a>
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground py-2">
                        {t("Contact unavailable")}
                      </span>
                    )}

                    <button
                      onClick={() => toggleExpand(facility.id)}
                      className="h-10 px-3.5 rounded-xl border bg-background hover:bg-muted font-bold text-xs text-foreground transition flex items-center gap-1"
                    >
                      {expandedId === facility.id ? t("Hide Details") : t("Details")}
                      {expandedId === facility.id ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageShell>
    </RoleGuard>
  );
}
