import { Link, useNavigate } from "@tanstack/react-router";
import { getColdStorageFacilities, type ColdStorageFacility } from "@/services/coldStorage";
import { getMarketPrices, syncLiveMarketPrices, type SyncResult } from "@/services/marketPrices";
import type { MarketPrice } from "@/types/database";
import {
  ArrowRight,
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
import { CATEGORIES, getProduct, PRODUCTS } from "@/data/products";
import { SITE, waLink } from "@/data/site";
import type { Category, NotificationItem, Product } from "@/data/types";
import { cardClass, glassCardClass, PageShell } from "./AppShell";
import { getCartProducts, useCart } from "./CartContext";
import { useAuth, type UserRole } from "./AuthContext";
import { formatRupees, ProductCard, NEUTRAL_PRODUCT_FALLBACK } from "./ProductCard";
import { getProducts, getFarmerProducts, createProduct, updateProduct, deleteProduct } from "@/services/products";
import { createRealBuyerOrder, getOrdersByBuyer, getOrdersByFarmer, type OrderWithItems } from "@/services/orders";
import type { DbProduct, ProductCategory, ProductStatus } from "@/types/database";

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
              Browse directly from verified local farmers and certified suppliers. High quality, fair prices, direct sourcing.
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
              <p className="text-xs text-muted-foreground">Find fresh crops, fruits, seeds, and equipment</p>
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
                  <img src={cat.img} alt={cat.name} className="h-full w-full object-cover hover:scale-105 transition duration-300" />
                </div>
                <span className="text-xs font-black text-[#1b4332] tracking-tight block py-1 line-clamp-1">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#1b4332]">Featured Products</h2>
              <p className="text-xs text-muted-foreground">Top quality products available for order</p>
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
              Advance your skills in Web Development, Python, AI/ML, and AgriTech. Explore active internship opportunities and track course progress.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 transition px-4 py-2.5 text-xs font-black text-white shadow-sm"
              >
                Browse All Courses <GraduationCap className="h-4 w-4" />
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
            <p className="text-xs font-semibold text-muted-foreground mt-0.5">Enrolled Courses</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-[#1b4332]">2</p>
            <p className="text-xs font-semibold text-muted-foreground mt-0.5">Active Applications</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-[#1b4332]">2</p>
            <p className="text-xs font-semibold text-muted-foreground mt-0.5">Certificates Earned</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-[#1b4332]">35 hrs</p>
            <p className="text-xs font-semibold text-muted-foreground mt-0.5">Learning Time</p>
          </div>
        </div>

        {/* 6 Sample Courses Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#1b4332]">My Learning Courses</h2>
              <p className="text-xs text-muted-foreground">Continue learning your active tech & AgriTech modules</p>
            </div>
            <Link to="/courses" className="text-xs font-bold text-[#2d6a4f] hover:underline">
              Explore All Courses →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {COURSES.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft flex flex-col justify-between space-y-4">
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
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{c.description}</p>
                </div>

                <div className="space-y-3 pt-2 border-t border-border/60">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-[#2d6a4f]">{c.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-[#2d6a4f] rounded-full transition-all duration-300" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>

                  <Link
                    to="/courses"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] py-2 text-xs font-black text-white transition shadow-sm"
                  >
                    {c.progress > 0 ? "Continue Learning" : "Start Course"} <ArrowRight className="h-3.5 w-3.5" />
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
              <h2 className="text-xl font-black text-[#1b4332]">Featured Internship Opportunities</h2>
              <p className="text-xs text-muted-foreground">Apply for tech and research internships</p>
            </div>
            <Link to="/internships" className="text-xs font-bold text-[#2d6a4f] hover:underline">
              View All Listings →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INTERNSHIPS.slice(0, 4).map((i) => (
              <div key={i.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-[#1b4332]">{i.title}</h3>
                    <p className="text-xs font-bold text-[#2d6a4f] mt-0.5">{i.org} · {i.type} ({i.location})</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-50 text-amber-700 px-2.5 py-1 text-[10px] font-extrabold border border-amber-200">
                    {i.stipend}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{i.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {i.skills.map((skill) => (
                    <span key={skill} className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground/80">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground font-medium">Apply by {i.deadline}</span>
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
                  <span className="text-4xl font-black text-[#1b4332]">28{"\u00B0"}C</span>
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
                        <span className="font-semibold text-muted-foreground w-10">{fc.day}</span>
                        <div className="flex items-center justify-center gap-1.5 flex-1">
                          <IconComponent className={`h-3.5 w-3.5 ${iconColor}`} />
                          <span className="text-foreground/80 font-medium">
                            {fc.condition}
                          </span>
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
          image: p.image_url || "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600",
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
    return items.some((i) => i.isSoldOut || (i.availableQuantity !== undefined && i.availableQuantity <= 0));
  }, [items]);

  const handleQtyChange = (productId: string, currentQty: number, delta: number, availStock?: number) => {
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
        eyebrow="Shopping Cart"
        title="Your Cart & Produce Items"
        intro="Review your items and selected quantities before proceeding to checkout."
      >
        {stockWarning && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold flex items-center justify-between">
            <span>⚠️ {stockWarning}</span>
            <button onClick={() => setStockWarning(null)} className="text-xs font-bold text-amber-900 underline">Dismiss</button>
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
                      <h3 className="font-bold text-lg text-foreground">{product.name}</h3>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">
                        {formatRupees(unitPrice)} / {product.unit}
                      </p>
                      {availStock !== undefined && (
                        <p className="mt-1 text-xs font-medium text-emerald-700">
                          Stock Available: {availStock} {product.unit}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove Item
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
              <h3 className="text-lg font-bold text-foreground">Order Summary</h3>
              <div className="space-y-3 text-sm border-t pt-4">
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
                  <span className="font-bold text-foreground">{formatRupees(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-black text-foreground">
                  <span>Total Amount</span>
                  <span className="text-[#087F5B]">{formatRupees(subtotal)}</span>
                </div>
              </div>

              {hasSoldOutItem ? (
                <div className="w-full mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold text-center">
                  Some items in your cart are sold out. Remove them to proceed.
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
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-12 text-center max-w-xl mx-auto my-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#087F5B] flex items-center justify-center mx-auto mb-2">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-[#073B2A]">Your cart is empty.</h3>
            <p className="text-sm text-emerald-800/80 leading-relaxed">
              Add farm produce from the marketplace to get started with direct purchasing.
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#087F5B] hover:bg-[#073B2A] text-white font-bold text-sm shadow-md transition"
            >
              Browse Marketplace <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </PageShell>
    </RoleGuard>
  );
}

export function OrderPage() {
  const { user } = useAuth();
  const { items, subtotal, clearCart, syncCartWithDatabase } = useCart();
  const rows = getCartProducts(items);

  const [activeTab, setActiveTab] = useState<"checkout" | "my_orders">(items.length > 0 ? "checkout" : "my_orders");
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  // Buyer Form State
  const [buyerName, setBuyerName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [deliveryLocation, setDeliveryLocation] = useState(user?.location || "Rajahmundry, Andhra Pradesh");
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

      const hasSoldOut = items.some((i) => i.isSoldOut || (i.availableQuantity !== undefined && i.availableQuantity <= 0));
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
              activeTab === "checkout" ? "bg-[#087F5B] text-white shadow-sm" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Checkout ({rows.length})
          </button>
          <button
            onClick={() => setActiveTab("my_orders")}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
              activeTab === "my_orders" ? "bg-[#087F5B] text-white shadow-sm" : "bg-muted text-muted-foreground hover:text-foreground"
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
                <p className="text-sm text-emerald-800/80">Add products to the cart before checking out.</p>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#087F5B] text-white font-bold text-sm shadow-md"
                >
                  Start Shopping <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
                {/* Delivery & Contact Details Form */}
                <form onSubmit={handlePlaceOrderSubmit} className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-foreground">Delivery & Contact Information</h3>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Full Name</label>
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
                    <label className="text-xs font-bold text-foreground block mb-1">Phone Number</label>
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
                    <label className="text-xs font-bold text-foreground block mb-1">Delivery Location / Address *</label>
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
                    <label className="text-xs font-bold text-foreground block mb-1">Order Notes (Optional)</label>
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
                    <p className="font-bold text-foreground">Payment Method</p>
                    <p>💳 <strong>Payment integration coming soon (Cash on Delivery)</strong></p>
                    <p className="text-xs">No online payment is processed today. Pay cash or UPI upon crop inspection & delivery.</p>
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
                        <div key={product.id} className="pt-3 first:pt-0 flex items-center justify-between text-sm">
                          <div>
                            <p className="font-bold text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {qty} {product.unit} × {formatRupees(price)}
                            </p>
                          </div>
                          <span className="font-bold text-foreground">{formatRupees(price * qty)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground font-medium">
                      <span>Subtotal</span>
                      <span className="font-bold text-foreground">{formatRupees(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground font-medium">
                      <span>Delivery</span>
                      <span className="font-bold text-emerald-600">FREE</span>
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
                <h3 className="text-xl font-bold text-[#073B2A]">You haven't placed any orders yet.</h3>
                <p className="text-sm text-emerald-800/80 leading-relaxed">
                  Explore fresh produce from local farmers across India and place your first direct order.
                </p>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#087F5B] hover:bg-[#073B2A] text-white font-bold text-sm shadow-md transition"
                >
                  Start Shopping <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              /* Orders List */
              <div className="space-y-6">
                {buyerOrders.map((order) => (
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
                          Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block font-medium">Total Amount</span>
                        <span className="text-xl font-black text-[#087F5B]">{formatRupees(order.total_amount)}</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm py-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#087F5B] flex items-center justify-center font-bold text-xs">
                              📦
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{item.products?.name || "Farm Produce"}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.quantity} {item.products?.unit || "units"} × {formatRupees(item.unit_price)}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-foreground">{formatRupees(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Location */}
                    <div className="pt-3 border-t flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-[#087F5B]" />
                      <span>Delivery Location: <strong>{order.delivery_location}</strong></span>
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
export function MarketPage() {
  const [records, setRecords] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("all");
  const [marketFilter, setMarketFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"recently_updated" | "price_low_high" | "price_high_low">("recently_updated");

  // Dynamic filter options generated from loaded records
  const cropsList = useMemo(() => ["all", ...Array.from(new Set(records.map(r => r.crop_name).filter(Boolean)))], [records]);
  const marketsList = useMemo(() => ["all", ...Array.from(new Set(records.map(r => r.market_name).filter(Boolean)))], [records]);
  const statesList = useMemo(() => ["all", ...Array.from(new Set(records.map(r => r.state).filter(Boolean)))], [records]);

  const fetchPrices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMarketPrices({
        search,
        cropName: cropFilter,
        marketName: marketFilter,
        state: stateFilter,
        sortOrder,
      });
      setRecords(data);
    } catch (err: any) {
      console.error("Failed to load market prices:", err);
      setError(err.message || "Unable to load market prices.");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncLive = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res: SyncResult = await syncLiveMarketPrices();
      if (res.success) {
        setSyncMessage(`✅ ${res.message}`);
        await fetchPrices();
      } else {
        setSyncMessage(`ℹ️ ${res.message}`);
      }
    } catch (err: any) {
      setSyncMessage(`⚠️ Sync failed: ${err?.message || "Server error"}`);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [search, cropFilter, marketFilter, stateFilter, sortOrder]);

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return "Timestamp unavailable";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "admin"]}>
      <PageShell
        eyebrow="Live Mandi Intelligence"
        title="Market Prices"
        intro="Track crop prices across nearby markets"
        bgImage="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2070&auto=format&fit=crop"
      >
        {/* Controls Panel */}
        <div className="mb-8 p-6 rounded-2xl border border-white/50 bg-white/85 backdrop-blur-md shadow-md space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search crops, markets or locations..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
              />
            </div>
            <button
              onClick={handleSyncLive}
              disabled={syncing}
              className="h-11 px-5 rounded-xl bg-[#087F5B] hover:bg-[#073B2A] text-white text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing Mandi API..." : "Sync Live Mandi Data"}
            </button>
          </div>

          {syncMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
              {syncMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-border/60">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Crop</label>
              <select
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border bg-background text-xs font-semibold outline-none focus:ring-2 focus:ring-[#087F5B]"
              >
                <option value="all">All Crops</option>
                {cropsList.filter(c => c !== "all").map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Market</label>
              <select
                value={marketFilter}
                onChange={(e) => setMarketFilter(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border bg-background text-xs font-semibold outline-none focus:ring-2 focus:ring-[#087F5B]"
              >
                <option value="all">All Markets</option>
                {marketsList.filter(m => m !== "all").map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">State</label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border bg-background text-xs font-semibold outline-none focus:ring-2 focus:ring-[#087F5B]"
              >
                <option value="all">All States</option>
                {statesList.filter(s => s !== "all").map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Sort By</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full h-9 px-3 rounded-lg border bg-background text-xs font-semibold outline-none focus:ring-2 focus:ring-[#087F5B]"
              >
                <option value="recently_updated">Recently Updated</option>
                <option value="price_low_high">Price: Low → High</option>
                <option value="price_high_low">Price: High → Low</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs font-bold text-muted-foreground">
            <span>Showing {records.length} market price record(s)</span>
            <button
              onClick={fetchPrices}
              className="inline-flex items-center gap-1.5 text-[#087F5B] hover:underline cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh View
            </button>
          </div>
        </div>

        {/* Content Display */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-56 rounded-2xl border bg-card p-6 animate-pulse space-y-4">
                <div className="h-6 w-3/4 bg-muted rounded"></div>
                <div className="h-4 w-1/2 bg-muted rounded"></div>
                <div className="h-10 w-full bg-muted rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-8 text-center max-w-xl mx-auto my-8 space-y-4">
            <AlertTriangle className="h-12 w-12 text-rose-600 mx-auto" />
            <h3 className="text-lg font-bold text-rose-900">Unable to load market prices.</h3>
            <p className="text-xs text-rose-700">{error}</p>
            <button
              onClick={fetchPrices}
              className="px-6 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-md transition"
            >
              Retry
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-12 text-center max-w-xl mx-auto my-8 space-y-4">
            <TrendingUp className="h-12 w-12 text-[#087F5B] mx-auto mb-2 opacity-80" />
            <h3 className="text-xl font-bold text-[#073B2A]">No market prices available.</h3>
            <p className="text-sm text-emerald-800/80">Market price data will appear here when available.</p>
            <button
              onClick={() => {
                setSearch("");
                setCropFilter("all");
                setMarketFilter("all");
                setStateFilter("all");
                setSortOrder("recently_updated");
              }}
              className="px-5 py-2.5 rounded-xl bg-[#087F5B] text-white font-bold text-xs shadow-md"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {records.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border bg-card/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] flex items-center gap-1">
                        <Sprout className="h-3.5 w-3.5" /> {item.crop_name}
                      </span>
                      <h3 className="text-lg font-extrabold text-foreground mt-0.5">
                        {item.market_name}
                      </h3>
                    </div>
                    <div className="text-right">
                      {item.change_pct != null && item.change_pct !== 0 ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                            item.change_pct >= 0
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {item.change_pct >= 0 ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5" />
                          )}
                          {Math.abs(item.change_pct)}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                          Latest recorded price
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-900">Current Price</span>
                    <span className="text-xl font-black text-[#073B2A]">
                      ₹{Number(item.price || 0).toLocaleString()} <span className="text-xs font-bold text-muted-foreground">/ {item.unit || "unit"}</span>
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-[#087F5B] shrink-0" />
                      <span>{item.location ? `${item.location}, ` : ""}{item.state}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t text-[11px] font-semibold text-muted-foreground">
                      <span>Source: {item.source || "Source unavailable"}</span>
                      <span>Updated: {formatTimestamp(item.recorded_at || item.updated_at)}</span>
                    </div>
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

export function SchemesPage() {
  const [query, setQuery] = useState("");
  const rows = SCHEMES.filter((s) =>
    `${s.name} ${s.category} ${s.eligibility}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <CardGridPage
        bgImage="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2000"
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
        bgImage="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2000"
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
        bgImage="https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=2000"
        eyebrow="Weather"
        title="Farm weather advisory"
        intro="Five-day local forecast with field action notes."
      >
        <div className="grid gap-4 md:grid-cols-5">
          {WEATHER.map((day) => (
            <div key={day.day} className={glassCardClass}>
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
                {item.name}
              </button>
            ))}
          </div>
          {crop ? (
            <div className={glassCardClass}>
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
    <RoleGuard allowedRoles={["student", "farmer", "admin"]}>
      <CardGridPage
        bgImage="https://upload.wikimedia.org/wikipedia/commons/f/fc/Farmer_working_in_the_field_with_their_tractor.jpg"
        eyebrow="Learning"
        title="Learning Hub"
        intro="Short, practical modules for software development, computing, and agriculture."
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

export function CoursesPage() {
  const [query, setQuery] = useState("");
  const filtered = COURSES.filter((c) =>
    `${c.title} ${c.topic} ${c.level}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <RoleGuard allowedRoles={["student", "farmer", "admin"]}>
      <PageShell eyebrow="Education" title="Student Courses Catalog" intro="Explore software development, Python, AI/ML, cloud, and modern tech courses.">
        <div className="mb-6 flex max-w-md items-center rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Search courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex rounded-full bg-emerald-50 text-[#1b4332] px-2.5 py-0.5 text-[10px] font-bold border border-emerald-200">
                    {c.level}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">{c.hours} hrs · {c.lessons} lessons</span>
                </div>
                <h3 className="text-lg font-black text-[#1b4332] leading-snug">{c.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.description}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-border/60">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground">{c.instructor}</span>
                  <span className="text-[#2d6a4f]">{c.progress}% completed</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-[#2d6a4f] rounded-full transition-all duration-300" style={{ width: `${c.progress}%` }} />
                </div>
                <button
                  type="button"
                  className="w-full h-10 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-black transition shadow-sm"
                >
                  {c.progress > 0 ? "Continue Learning" : "Start Course"}
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
  return (
    <RoleGuard allowedRoles={["student", "admin"]}>
      <PageShell eyebrow="Dashboard" title="My Enrolled Courses" intro="Track ongoing learning progress across active tech and engineering courses.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COURSES.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">{c.topic}</span>
                  <h3 className="text-lg font-black text-[#1b4332]">{c.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.instructor} · {c.hours} hrs</p>
                </div>
                <span className="text-xs font-bold text-[#2d6a4f] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {c.progress}% Complete
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-[#2d6a4f] rounded-full" style={{ width: `${c.progress}%` }} />
              </div>
              <button type="button" className="w-full h-10 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-black transition shadow-sm">
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
  const sampleApps = [
    { title: "Frontend Development Intern", org: "PureFarm Tech", location: "Remote", stipend: "Rs. 15,000/month", status: "In Review", date: "Applied 2 days ago" },
    { title: "Python Development Intern", org: "AgriTech Solutions", location: "Hybrid", stipend: "Rs. 12,000/month", status: "Shortlisted", date: "Applied 1 week ago" },
  ];

  return (
    <RoleGuard allowedRoles={["student", "admin"]}>
      <PageShell eyebrow="Career" title="My Internship Applications" intro="Review status and progress of your submitted internship applications.">
        <div className="space-y-4">
          {sampleApps.map((app, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-5 shadow-soft flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#1b4332]">{app.title}</h3>
                <p className="text-xs font-bold text-[#2d6a4f] mt-0.5">{app.org} · {app.location} · {app.stipend}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{app.date}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${app.status === "Shortlisted" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"}`}>
                {app.status}
              </span>
            </div>
          ))}
        </div>
      </PageShell>
    </RoleGuard>
  );
}

export function CertificatesPage() {
  const sampleCertificates = [
    { title: "Web Development Fundamentals", date: "Issued Aug 2026", id: "CERT-9042" },
    { title: "Python Programming Foundations", date: "Issued Jul 2026", id: "CERT-8104" },
  ];

  return (
    <RoleGuard allowedRoles={["student", "admin"]}>
      <PageShell eyebrow="Achievements" title="My Certificates" intro="View and download verified completion certificates.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sampleCertificates.map((cert, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-3">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-amber-500 shrink-0" />
                <div>
                  <h3 className="text-base font-black text-[#1b4332]">{cert.title}</h3>
                  <p className="text-xs text-muted-foreground">{cert.date} · {cert.id}</p>
                </div>
              </div>
              <button type="button" className="w-full h-9 rounded-xl border border-border bg-muted/30 hover:bg-muted text-xs font-bold text-[#1b4332] transition">
                Download Certificate (PDF)
              </button>
            </div>
          ))}
        </div>
      </PageShell>
    </RoleGuard>
  );
}

export function InternshipsPage() {
  const [appliedId, setAppliedId] = useState<string | null>(null);

  return (
    <RoleGuard allowedRoles={["student", "farmer", "admin"]}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=2000"
        eyebrow="Internships"
        title="Student Internship Hub"
        intro="Apply for frontend, python, AI/ML, full-stack, and data science internships."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INTERNSHIPS.map((i) => (
            <div key={i.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-[#1b4332]">{i.title}</h3>
                  <p className="text-xs font-bold text-[#2d6a4f] mt-0.5">{i.org} · {i.type} ({i.location})</p>
                </div>
                <span className="rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-black border border-amber-200">
                  {i.stipend}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{i.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {i.skills.map((skill) => (
                  <span key={skill} className="rounded-md bg-muted px-2.5 py-1 text-[11px] font-bold text-foreground/80">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="pt-3 flex items-center justify-between border-t border-border/60">
                <span className="text-xs text-muted-foreground font-medium">Deadline: {i.deadline}</span>
                <button
                  type="button"
                  onClick={() => setAppliedId(i.id)}
                  disabled={appliedId === i.id}
                  className="rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white px-4 py-2 text-xs font-black transition shadow-sm disabled:bg-emerald-800"
                >
                  {appliedId === i.id ? "Application Submitted ✓" : "Apply Now"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </PageShell>
    </RoleGuard>
  );
}

export function NotificationsPage() {
  const [items, setItems] = useState(NOTIFICATIONS);
  const unread = items.filter((n) => !n.read).length;
  return (
    <RoleGuard allowedRoles={["buyer", "farmer", "seller", "admin"]}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000"
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
                  <p className="text-xs font-medium text-[#E8F5EE]">Every drop counts</p>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER: Login Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md glass-card-dark p-6 sm:p-8 rounded-3xl border border-white/30 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-white">Sign In to PureFarm</h2>
                <p className="text-xs text-white/80 mt-1.5">Enter your account credentials to access your dashboard</p>
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
                <p className="text-[11px] font-semibold text-white/70 text-center mb-2">Quick Demo Accounts:</p>
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
                    Buyer Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoFill("student@purefarm.test")}
                    className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition"
                  >
                    Student Demo
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
                  <p className="text-xs font-medium text-[#E8F5EE]">100% Certified</p>
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
    return (
      name.trim().length >= 3 &&
      isEmail(email) &&
      isPhone(phone) &&
      password.length >= 6
    );
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
        style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/5/56/Two_farmers_driving_a_tractor_towing_a_raft_loaded_with_green_rice_sheaves_in_a_paddy_field_of_Vang_Vieng_Laos.jpg)' }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 35, 25, 0.35)' }} />
      </div>

      {/* Top Left Branding */}
      <div className="absolute top-6 left-6 lg:top-10 lg:left-12 z-10 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-lg">
            <Leaf className="h-6 w-6" />
          </span>
          <div>
            <span className="block text-2xl font-black tracking-wide leading-none text-white drop-shadow-md">PureFarm</span>
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
            Join the Digital<br />Agri Revolution
          </h2>
          <p className="text-lg text-white/90 leading-relaxed max-w-md mb-8 drop-shadow-md">
            Register your profile to access mandi prices, direct produce sales, certified inputs, courses, and internships.
          </p>
          
          <div className="space-y-4">
            <div 
              className="flex items-center gap-4 p-4 max-w-sm"
              style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '18px',
              }}
            >
              <div className="p-2"><Leaf className="h-6 w-6 text-white" /></div>
              <div>
                <h4 className="font-bold text-white text-sm">Direct Market Access</h4>
                <p className="text-white/80 text-xs">Sell harvest at transparent mandi prices</p>
              </div>
            </div>
            
            <div 
              className="flex items-center gap-4 p-4 max-w-sm"
              style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '18px',
              }}
            >
              <div className="p-2"><ShieldCheck className="h-6 w-6 text-white" /></div>
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
              background: 'rgba(255, 255, 255, 0.16)',
              backdropFilter: 'blur(25px) saturate(140%)',
              border: '1px solid rgba(255, 255, 255, 0.45)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
              borderRadius: '28px'
            }}
            className="py-8 px-6 sm:px-10"
          >
            <div className="mb-6 text-center">
              <h3 className="text-2xl font-extrabold text-[#073B2A] drop-shadow-sm">
                Create Account
              </h3>
              <p className="text-xs font-semibold text-[#164F3C] mt-1">
                Choose your role to get started with PureFarm
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
                <label className="text-xs font-bold text-[#073B2A] block">Full Name</label>
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
                <label className="text-xs font-bold text-[#073B2A] block">Location (City, State)</label>
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
      harvest_date: (product.harvest_date ? product.harvest_date.split("T")[0] || "" : "") as string,
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
          <h2 className="text-xl font-bold text-foreground mb-2">Farmer Authentication Required</h2>
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
          <h2 className="text-xl font-bold text-foreground mb-2">Account Role Notice</h2>
          <p className="text-muted-foreground text-sm mb-6">
            You are currently logged in as <strong>{user.role.toUpperCase()}</strong>. Access to this product management interface is strictly restricted to registered Farmers.
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#087F5B] text-white font-bold hover:bg-[#073B2A] transition"
          >
            Go to Marketplace <ArrowRight className="h-4 w-4" />
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
            <Plus className="h-4 w-4" /> List New Produce
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
              <h3 className="text-xl font-bold text-[#073B2A]">No received orders yet.</h3>
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
                        Received on {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block font-medium">Order Total</span>
                      <span className="text-xl font-black text-[#087F5B]">{formatRupees(order.total_amount)}</span>
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
                            <p className="font-bold text-foreground">{item.products?.name || "Farm Produce"}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} {item.products?.unit || "units"} × {formatRupees(item.unit_price)}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-foreground">{formatRupees(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Location */}
                  <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[#087F5B]" />
                      <span>Delivery Destination: <strong>{order.delivery_location}</strong></span>
                    </div>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                      Payment: {order.payment_method?.toUpperCase() || "COD"} ({order.payment_status || "Pending"})
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
          <h3 className="text-xl font-bold text-[#073B2A] mb-2">No products listed yet.</h3>
          <p className="text-sm text-emerald-800/80 mb-6 leading-relaxed">
            You haven't listed any farm produce for sale yet. Start selling directly to verified buyers across India with zero middleman fees.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#087F5B] hover:bg-[#073B2A] text-white font-bold text-sm shadow-lg transition"
          >
            <Plus className="h-4 w-4" /> List Your First Product
          </button>
        </div>
      ) : (
        /* Product Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="rounded-2xl border bg-card overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition">
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
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${product.status === "available" ? "bg-emerald-500 text-white" : "bg-gray-500 text-white"}`}>
                    {(product.status || "available").toUpperCase()}
                  </span>
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold bg-black/60 text-white backdrop-blur-sm">
                    {product.category.toUpperCase()}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-lg text-foreground line-clamp-1">{product.name || (product as any).title}</h3>

                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#087F5B]">{formatRupees(product.price)}</span>
                    <span className="text-xs text-muted-foreground font-semibold">/ {product.unit}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                    <div>
                      <span className="text-muted-foreground block font-medium">Available Stock</span>
                      <span className="font-bold text-foreground">{product.available_quantity} {product.unit}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-medium">Total Quantity</span>
                      <span className="font-bold text-foreground">{product.quantity} {product.unit}</span>
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
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingProduct(product)}
                    className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 text-xs font-bold transition"
                  >
                    Delete
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
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
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
                  <label className="text-xs font-bold text-foreground block mb-1">Unit of Measure *</label>
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
                  <label className="text-xs font-bold text-foreground block mb-1">Price per {formData.unit} (₹) *</label>
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
                  <label className="text-xs font-bold text-foreground block mb-1">Total Quantity *</label>
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
                  <label className="text-xs font-bold text-foreground block mb-1">Available Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formData.available_quantity}
                    onChange={(e) => setFormData({ ...formData, available_quantity: e.target.value })}
                    placeholder="e.g. 100"
                    className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Location / Farm Address *</label>
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
                  <label className="text-xs font-bold text-foreground block mb-1">Harvest Date</label>
                  <input
                    type="date"
                    value={formData.harvest_date}
                    onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/... or leave blank for default image"
                  className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Description (Optional)</label>
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
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                  className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
                >
                  <option value="available">Active (Visible on Marketplace)</option>
                  <option value="inactive">Inactive (Hidden from Marketplace)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl border text-xs font-bold hover:bg-muted transition"
                >
                  Cancel
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
            <h3 className="text-lg font-bold text-foreground">Confirm Delete Product</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to remove <strong>"{deletingProduct.name || (deletingProduct as any).title}"</strong> from your catalog? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => setDeletingProduct(null)}
                disabled={submitting}
                className="px-4 py-2 rounded-xl border text-xs font-bold hover:bg-muted"
              >
                Cancel
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
          <p className="text-2xl font-black text-[#087F5B] mt-1">{user?.role?.toUpperCase() || "ADMIN"}</p>
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
    icon?: React.ReactNode;
  }[];
}) {
  const currentCardClass = bgImage ? glassCardClass : cardClass;
  return (
    <PageShell eyebrow={eyebrow} title={title} intro={intro} {...(bgImage ? { bgImage } : {})}>
      {setQuery ? (
        <input
          value={query || ""}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className={`mb-5 h-12 w-full max-w-xl rounded-xl border px-4 shadow-sm outline-none transition-all ${bgImage ? "bg-white/80 border-white/50 backdrop-blur-md focus:bg-white focus:ring-2 focus:ring-white" : "border-input bg-card"}`}
        />
      ) : null}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const content = (
            <div className={`${currentCardClass} h-full`}>
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


// ============================================================================
// COLD STORAGE FINDER PAGE
// ============================================================================

export function ColdStoragePage() {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState<ColdStorageFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Location
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"nearest" | "farthest" | "capacity_high" | "capacity_low">("nearest");
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
        setLocationStatus("Location set: Coordinates (" + pos.coords.latitude.toFixed(2) + ", " + pos.coords.longitude.toFixed(2) + ")");
      },
      (err) => {
        console.warn("Geolocation permission error:", err.message);
        setLocationLoading(false);
        setLocationStatus("Location permission denied. Showing facilities by default regional distance.");
      },
      { timeout: 10000 }
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <RoleGuard allowedRoles={["farmer", "buyer", "admin"]}>
      <PageShell
        eyebrow="Produce Preservation & Logistics"
        title="Cold Storage Finder"
        intro="Find nearby cold storage facilities for your produce, check live capacity, and lock in preservation."
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
                placeholder="Search by facility name or address..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
              />
            </div>

            <button
              onClick={handleUseMyLocation}
              disabled={locationLoading}
              className="h-11 px-5 rounded-xl bg-[#087F5B] hover:bg-[#073B2A] text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
            >
              <Navigation className={`h-4 w-4 ${locationLoading ? "animate-spin" : ""}`} />
              {locationLoading ? "Detecting..." : "Use My Location"}
            </button>
          </div>

          {locationStatus && (
            <div className="text-xs font-semibold text-emerald-800 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200/60 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-[#087F5B]" />
              <span>{locationStatus}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-border/60">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border bg-background text-xs font-semibold outline-none focus:ring-2 focus:ring-[#087F5B]"
              >
                <option value="all">All Statuses</option>
                <option value="available">🟢 Available</option>
                <option value="full">🔴 Full</option>
                <option value="maintenance">🟠 Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Sort By</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full h-9 px-3 rounded-lg border bg-background text-xs font-semibold outline-none focus:ring-2 focus:ring-[#087F5B]"
              >
                <option value="nearest">Nearest Distance First</option>
                <option value="farthest">Farthest First</option>
                <option value="capacity_high">Capacity: High to Low</option>
                <option value="capacity_low">Capacity: Low to High</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-2 flex items-end justify-between sm:justify-end gap-3 pb-1 text-xs font-bold text-muted-foreground">
              <span>Showing {facilities.length} facility(ies)</span>
              <button
                onClick={fetchFacilities}
                className="inline-flex items-center gap-1.5 text-[#087F5B] hover:underline"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
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
            <h3 className="text-lg font-bold text-rose-900">Unable to load cold storage facilities</h3>
            <p className="text-xs text-rose-700">{error}</p>
            <button
              onClick={fetchFacilities}
              className="px-6 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-md transition"
            >
              Retry Loading
            </button>
          </div>
        ) : facilities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-12 text-center max-w-xl mx-auto my-8 space-y-4">
            <Snowflake className="h-12 w-12 text-[#087F5B] mx-auto mb-2 opacity-80" />
            <h3 className="text-xl font-bold text-[#073B2A]">No cold storage facilities found</h3>
            <p className="text-sm text-emerald-800/80">Try changing your location or search filters.</p>
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="px-5 py-2.5 rounded-xl bg-[#087F5B] text-white font-bold text-xs shadow-md"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {facilities.map((facility) => {
              const displayDistance = facility.calculatedDistance ?? facility.distance ?? null;
              const isFull = facility.status.toLowerCase() === "full" || facility.available_capacity === 0;
              const isMaintenance = facility.status.toLowerCase() === "maintenance";
              const percentAvailable = facility.capacity > 0
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
                          <h3 className="font-bold text-foreground text-base leading-snug">{facility.name}</h3>
                          {displayDistance !== null && (
                            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" /> {displayDistance} km away
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
                        {isFull ? "🔴 Full" : isMaintenance ? "🟠 Maintenance" : "🟢 Available"}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
                      <Building2 className="h-4 w-4 shrink-0 text-muted-foreground/70 mt-0.5" />
                      <span>{facility.address}</span>
                    </p>

                    <div className="p-4 rounded-xl bg-muted/60 border space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-foreground">Available Capacity</span>
                        <span className="text-[#087F5B]">
                          {facility.available_capacity.toLocaleString()} MT / {facility.capacity.toLocaleString()} MT
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
                        <span>{percentAvailable}% available space</span>
                        <span>Total: {facility.capacity.toLocaleString()} MT</span>
                      </div>
                    </div>

                    {expandedId === facility.id && (
                      <div className="pt-3 border-t text-xs space-y-2 text-muted-foreground">
                        <p className="font-bold text-foreground">Facility Specifications:</p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>Temperature range: -2°C to +8°C (Multi-commodity)</li>
                          <li>Humidity control: Automated 85%-95% RH</li>
                          <li>Coordinates: {facility.latitude ?? "N/A"}, {facility.longitude ?? "N/A"}</li>
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
                        <Phone className="h-3.5 w-3.5" /> Call ({facility.contact_number})
                      </a>
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground py-2">
                        Contact unavailable
                      </span>
                    )}

                    <button
                      onClick={() => toggleExpand(facility.id)}
                      className="h-10 px-3.5 rounded-xl border bg-background hover:bg-muted font-bold text-xs text-foreground transition flex items-center gap-1"
                    >
                      {expandedId === facility.id ? "Hide Details" : "Details"}
                      {expandedId === facility.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
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
