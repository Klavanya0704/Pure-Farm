import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  CloudSun,
  Snowflake,
  Home,
  Leaf,
  LifeBuoy,
  Menu,
  MessageCircle,
  ShieldCheck,
  ShoppingCart,
  Store,
  X,
  MapPin,
  Sun,
  TrendingUp,
  Shield,
  GraduationCap,
  Briefcase,
  ShoppingBag,
  Info,
  Phone,
  Search,
  BookOpen,
  FileText,
  Award,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { SITE, waLink } from "@/data/site";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { useTranslation } from "@/i18n/LanguageContext";

export function LanguageSelector() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="relative inline-flex items-center">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as any)}
        className="h-9 rounded-xl border border-border bg-card px-2.5 text-xs font-bold text-foreground hover:bg-muted/50 transition cursor-pointer outline-none focus:ring-1 focus:ring-[#2d6a4f]"
        aria-label="Select Language"
      >
        <option value="en">🌐 English</option>
        <option value="te">🌐 తెలుగు</option>
      </select>
    </div>
  );
}

function NavLinkItem({
  to,
  label,
  icon: Icon,
  onClick,
}: {
  to: string;
  label: string;
  icon: any;
  onClick?: (() => void) | undefined;
}) {
  return (
    <Link
      to={to as any}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-sidebar-accent hover:text-foreground transition-all duration-200 cursor-pointer"
      activeProps={{
        className:
          "flex items-center gap-3 rounded-xl bg-sidebar-primary px-3 py-2 text-sm font-bold text-sidebar-primary-foreground shadow-sm transition-all duration-200 cursor-pointer",
      }}
    >
      <Icon className="h-4.5 w-4.5 text-[#2d6a4f]" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { count } = useCart();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/marketplace", search: { query: searchQuery } as any });
    }
  };

  // Dynamic Role-Based Navigation
  const getMainNav = () => {
    if (user?.role === "admin") {
      return [
        { to: "/admin", label: t("Admin Console"), icon: ShieldCheck },
        { to: "/marketplace", label: t("Marketplace"), icon: Store },
        { to: "/market-prices", label: t("Market Prices"), icon: TrendingUp },
        { to: "/cold-storage", label: t("Cold Storage"), icon: Snowflake },
        { to: "/schemes", label: t("Schemes"), icon: Shield },
        { to: "/weather", label: t("Weather"), icon: CloudSun },
        { to: "/crop-calendar", label: t("Crop Calendar"), icon: CalendarDays },
        { to: "/notifications", label: t("Notifications"), icon: Bell },
      ];
    }

    if (user?.role === "buyer") {
      return [
        { to: "/", label: t("Home"), icon: Home },
        { to: "/marketplace", label: t("Marketplace"), icon: Store },
      ];
    }

    if (user?.role === "student") {
      return [
        { to: "/", label: t("Home"), icon: Home },
        { to: "/learn", label: t("Learn"), icon: GraduationCap },
        { to: "/courses", label: t("Courses"), icon: BookOpen },
        { to: "/internships", label: t("Internships"), icon: Briefcase },
      ];
    }

    // Default / Farmer
    return [
      { to: "/", label: t("Home"), icon: Home },
      { to: "/marketplace", label: t("Marketplace"), icon: Store },
      { to: "/market-prices", label: t("Market Prices"), icon: TrendingUp },
      { to: "/cold-storage", label: t("Cold Storage"), icon: Snowflake },
      { to: "/schemes", label: t("Schemes"), icon: ShieldCheck },
      { to: "/crop-insurance", label: t("Crop Insurance"), icon: Shield },
      { to: "/weather", label: t("Weather"), icon: CloudSun },
      { to: "/learn", label: t("Learn"), icon: GraduationCap },
      { to: "/internships", label: t("Internships"), icon: Briefcase },
      { to: "/crop-calendar", label: t("Crop Calendar"), icon: CalendarDays },
      { to: "/notifications", label: t("Notifications"), icon: Bell },
    ];
  };

  const getAccountNav = () => {
    if (user?.role === "admin") {
      return [
        { to: "/admin", label: t("Admin Overview"), icon: ShieldCheck },
        { to: "/seller", label: t("Manage Products"), icon: Store },
        { to: "/order", label: t("All Orders"), icon: ShoppingBag },
      ];
    }

    if (user?.role === "buyer") {
      return [
        { to: "/order", label: t("My Orders"), icon: ShoppingBag },
        { to: "/cart", label: t("My Cart"), icon: ShoppingCart },
        { to: "/marketplace", label: t("Browse Catalog"), icon: Store },
        { to: "/notifications", label: t("Notifications"), icon: Bell },
      ];
    }

    if (user?.role === "student") {
      return [
        { to: "/my-courses", label: t("My Courses"), icon: BookOpen },
        { to: "/my-applications", label: t("My Applications"), icon: FileText },
        { to: "/certificates", label: t("Certificates"), icon: Award },
        { to: "/notifications", label: t("Notifications"), icon: Bell },
      ];
    }

    // Farmer
    return [
      { to: "/seller", label: t("My Products (Sell)"), icon: Store },
      { to: "/order", label: t("My Orders"), icon: ShoppingBag },
      { to: "/cart", label: t("My Cart"), icon: ShoppingCart },
      { to: "/marketplace", label: t("Browse Catalog"), icon: Store },
    ];
  };

  const mainNav = getMainNav();
  const accountNav = getAccountNav();

  const moreNav = [
    { to: "/about", label: t("About Us"), icon: Info },
    { to: "/support", label: t("Support"), icon: LifeBuoy },
    { to: "/contact", label: t("Contact Us"), icon: Phone },
  ];

  const renderSidebarContent = (onItemClick?: () => void) => (
    <div className="flex h-full flex-col justify-between min-h-0">
      <div className="flex flex-1 flex-col space-y-5 min-h-0 overflow-hidden">
        {/* Logo */}
        <Link to="/" onClick={onItemClick} className="flex items-center gap-3 px-2 shrink-0">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2d6a4f] text-white shadow-sm">
            <Leaf className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <span className="block text-lg font-black text-[#1b4332]">PureFarm</span>
            <span className="block text-[10px] font-semibold text-[#2d6a4f]/70 uppercase tracking-wider">
              {t("Connect - Grow - Prosper")}
            </span>
          </div>
        </Link>

        {/* Navigation Groups */}
        <div className="space-y-5 flex-1 min-h-0 overflow-y-auto no-scrollbar pr-1">
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {user?.role === "admin" ? t("Management") : t("Main Navigation")}
            </p>
            <nav className="mt-2 flex flex-col gap-0.5">
              {mainNav.map((item) => (
                <NavLinkItem key={item.to} {...item} onClick={onItemClick} />
              ))}
            </nav>
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {user?.role === "buyer" ? t("Account & Shopping") : user?.role === "student" ? t("Career") : t("Account & Activity")}
            </p>
            <nav className="mt-2 flex flex-col gap-0.5">
              {accountNav.map((item) => (
                <NavLinkItem key={item.to} {...item} onClick={onItemClick} />
              ))}
            </nav>
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("More Information")}
            </p>
            <nav className="mt-2 flex flex-col gap-0.5">
              {moreNav.map((item) => (
                <NavLinkItem key={item.to} {...item} onClick={onItemClick} />
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Seller callout card for non-sellers/buyers */}
      {(!user || user.role === "buyer") ? (
        <div className="mt-4 rounded-2xl border border-border bg-[#f4f9f6] p-4 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-[0.03]">
            <Leaf className="h-24 w-24 text-primary" />
          </div>
          <p className="text-sm font-bold text-[#1b4332]">{t("Sell Your Produce")}</p>
          <p className="mt-1 text-xs leading-normal text-[#2d6a4f]">
            {t("Register as a Farmer to sell your harvest directly.")}
          </p>
          <Link
            to="/register"
            onClick={onItemClick}
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[#2d6a4f] py-2 text-xs font-bold text-white transition hover:bg-[#1b4332] shadow-sm"
          >
            {t("Farmer Registration")}
          </Link>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Sidebar Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[230px] flex-col border-r border-border bg-sidebar p-5 text-sidebar-foreground lg:flex">
        {renderSidebarContent()}
      </aside>

      {/* Main Container */}
      <div className="lg:pl-[230px]">
        {/* Header Topbar */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-1 items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Large search input */}
              <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
                <input
                  type="text"
                  placeholder={t("Search for products, crops, tools, seeds...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 rounded-l-xl border border-r-0 border-border bg-background pl-4 pr-10 text-sm outline-none focus:ring-1 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
                />
                <button
                  type="submit"
                  className="h-10 px-4 rounded-r-xl bg-[#2d6a4f] text-white hover:bg-[#1b4332] transition font-medium text-sm flex items-center justify-center"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Right details */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              {/* Location */}
              <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-foreground/80">
                <MapPin className="h-3.5 w-3.5 text-[#2d6a4f]" />
                <span>{t(user?.location || "Rajahmundry, AP")}</span>
              </div>

              {/* Weather */}
              <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-foreground/80 border-l border-border pl-3">
                <Sun className="h-3.5 w-3.5 text-amber-500 fill-amber-100" />
                <span>28°C, {t("Sunny")}</span>
              </div>

              {/* Language Selector */}
              <div className="border-l border-border pl-3">
                <LanguageSelector />
              </div>

              {/* Notifications */}
              <Link
                to="/notifications"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card hover:bg-muted/50 transition text-foreground"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-background" />
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card hover:bg-muted/50 transition text-foreground"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {count > 0 ? (
                  <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-amber-500 px-1.5 text-center text-[10px] font-black text-white shadow-sm">
                    {count}
                  </span>
                ) : null}
              </Link>

              {/* User profile / Auth status */}
              {user ? (
                <div className="flex items-center gap-3 border-l border-border pl-3">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-[#2d6a4f] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold leading-none text-foreground">{user.name}</p>
                      <p className="mt-1 text-[10px] font-semibold leading-none uppercase text-[#2d6a4f]">
                        {t(user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Farmer")}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-card px-2.5 text-[10px] font-bold text-destructive hover:bg-muted/50 transition"
                  >
                    {t("Logout")}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 border-l border-border pl-3">
                  <Link
                    to="/login"
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-card hover:bg-muted/50 px-3 text-xs font-bold transition"
                  >
                    {t("Sign In")}
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex h-9 items-center justify-center rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white px-3.5 text-xs font-bold shadow-sm transition"
                  >
                    {t("Register")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>

        {/* Footer */}
        <footer className="border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <p className="text-lg font-black text-[#1b4332]">{SITE.name}</p>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground leading-relaxed">
                {t("Digital Agriculture Platform for farm inputs, mandi prices, crop advisories, schemes, and local support.")}
              </p>
            </div>
            <div className="text-sm">
              <p className="font-bold text-[#1b4332]">{t("Contact Us")}</p>
              <p className="mt-2 text-muted-foreground">{SITE.phone}</p>
              <p className="text-muted-foreground">{SITE.email}</p>
            </div>
            <div className="text-sm">
              <p className="font-bold text-[#1b4332]">{t("Address")}</p>
              <p className="mt-2 text-muted-foreground leading-relaxed">{t(SITE.address)}</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Drawer */}
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full w-[240px] overflow-y-auto bg-sidebar p-5 text-sidebar-foreground shadow-2xl transition-transform duration-300">
            <div className="mb-6 flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2d6a4f] text-white">
                <Leaf className="h-4.5 w-4.5" />
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-accent"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>
            <div>{renderSidebarContent(() => setOpen(false))}</div>
          </div>
        </div>
      ) : null}

      {/* WhatsApp Floating Action */}
      <a
        href={waLink("Hello PureFarm, I want to connect with an advisor.")}
        className="fixed bottom-5 right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-card-lg hover:scale-105 transition-all duration-200"
        aria-label="WhatsApp PureFarm"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}

export function PageShell({
  eyebrow,
  title,
  intro,
  bgImage,
  darkOverlay,
  lightTheme,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  bgImage?: string;
  darkOverlay?: boolean;
  lightTheme?: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const translatedTitle = t(title);
  const translatedEyebrow = eyebrow ? t(eyebrow) : undefined;
  const translatedIntro = intro ? t(intro) : undefined;

  if (bgImage) {
    return (
      <section className="relative min-h-[calc(100vh-4rem)] bg-cover bg-center bg-fixed bg-emerald-50" style={{ backgroundImage: "url(" + bgImage + ")" }}>
        <div className={`absolute inset-0 ${
          lightTheme
            ? "bg-[#F4FBF7]/55 backdrop-blur-[2px]"
            : darkOverlay
            ? "bg-gradient-to-b from-[#041C15]/85 via-[#071F18]/92 to-[#041C15]/96"
            : "bg-[#052d20]/35"
        }`} />
        <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-10 mx-auto max-w-7xl">
          <div className="mb-7 max-w-3xl">
            {translatedEyebrow ? (
              <p className={`text-sm font-black uppercase tracking-wider ${lightTheme ? "text-[#0D6E48]" : "text-[#a7f3d0] drop-shadow-md"}`}>
                {translatedEyebrow}
              </p>
            ) : null}
            <h1 className={`mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[44px] ${lightTheme ? "text-[#0F382A]" : "text-white drop-shadow-lg"}`}>
              {translatedTitle}
            </h1>
            {translatedIntro ? (
              <p className={`mt-3 text-base leading-7 sm:text-[18px] font-semibold ${lightTheme ? "text-[#1C4837]" : "text-[#A3D9C9] drop-shadow-md"}`}>
                {translatedIntro}
              </p>
            ) : null}
          </div>
          {children}
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 max-w-3xl">
          {translatedEyebrow ? (
            <p className="text-sm font-black uppercase tracking-wider text-primary">{translatedEyebrow}</p>
          ) : null}
          <h1 className="mt-2 text-3xl font-black tracking-normal text-foreground sm:text-4xl">
            {translatedTitle}
          </h1>
          {translatedIntro ? <p className="mt-3 text-base leading-7 text-muted-foreground">{translatedIntro}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export const glassCardClass = "rounded-[20px] border border-white/45 bg-white/75 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.10)] backdrop-blur-[16px] transition-all duration-200 hover:bg-white/85 text-foreground";
export const cardClass = "rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-200 hover:shadow-card-lg";
