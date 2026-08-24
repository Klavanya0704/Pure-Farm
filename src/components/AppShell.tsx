import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  CalendarDays,
  CloudSun,
  Home,
  Leaf,
  LifeBuoy,
  LogIn,
  Menu,
  MessageCircle,
  PackageSearch,
  PanelLeft,
  ShieldCheck,
  ShoppingCart,
  Store,
  UserPlus,
  X,
  MapPin,
  Sun,
  TrendingUp,
  Shield,
  GraduationCap,
  Briefcase,
  ShoppingBag,
  User,
  Heart,
  Info,
  Phone,
  Search
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { SITE, waLink } from "@/data/site";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";

const mainNav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/marketplace", label: "Marketplace", icon: Store },
  { to: "/market", label: "Market Prices", icon: TrendingUp },
  { to: "/schemes", label: "Schemes", icon: ShieldCheck },
  { to: "/crop-insurance", label: "Crop Insurance", icon: Shield },
  { to: "/weather", label: "Weather", icon: CloudSun },
  { to: "/learn", label: "Learn", icon: GraduationCap },
  { to: "/internships", label: "Internships", icon: Briefcase },
  { to: "/crop-calendar", label: "Crop Calendar", icon: CalendarDays },
  { to: "/notifications", label: "Notifications", icon: Bell },
] as const;

const accountNav = [
  { to: "/order", label: "My Orders", icon: ShoppingBag },
  { to: "/cart", label: "My Cart", icon: ShoppingCart },
  { to: "/admin", label: "My Profile", icon: User },
  { to: "/marketplace", label: "Wishlist", icon: Heart },
] as const;

const moreNav = [
  { to: "/about", label: "About Us", icon: Info },
  { to: "/support", label: "Support", icon: LifeBuoy },
  { to: "/contact", label: "Contact Us", icon: Phone },
] as const;

function NavLink({ to, label, icon: Icon }: { to: string; label: string; icon: typeof Home }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-sidebar-accent hover:text-foreground transition-all duration-200"
      activeProps={{
        className:
          "flex items-center gap-3 rounded-xl bg-sidebar-primary px-3 py-2 text-sm font-bold text-sidebar-primary-foreground shadow-sm transition-all duration-200",
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
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/marketplace", search: { query: searchQuery } as any });
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between">
      <div className="space-y-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2d6a4f] text-white">
            <Leaf className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <span className="block text-lg font-black text-[#1b4332]">PureFarm</span>
            <span className="block text-[10px] font-semibold text-[#2d6a4f]/70 uppercase tracking-wider">
              Connect • Grow • Prosper
            </span>
          </div>
        </Link>

        {/* Groups */}
        <div className="space-y-5 overflow-y-auto no-scrollbar max-h-[calc(100vh-16rem)] pr-1">
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Main
            </p>
            <nav className="mt-2 flex flex-col gap-0.5">
              {mainNav.map((item) => (
                <NavLink key={item.to} {...item} />
              ))}
            </nav>
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Account
            </p>
            <nav className="mt-2 flex flex-col gap-0.5">
              {accountNav.map((item) => (
                <NavLink key={item.to} {...item} />
              ))}
            </nav>
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              More
            </p>
            <nav className="mt-2 flex flex-col gap-0.5">
              {moreNav.map((item) => (
                <NavLink key={item.to} {...item} />
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Sell card */}
      <div className="mt-6 rounded-2xl border border-border bg-[#f4f9f6] p-4 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 opacity-[0.03]">
          <Leaf className="h-24 w-24 text-primary" />
        </div>
        <p className="text-sm font-bold text-[#1b4332]">Sell Your Produce</p>
        <p className="mt-1 text-xs leading-normal text-[#2d6a4f]">
          Join thousands of farmers and grow your business.
        </p>
        <Link
          to="/register"
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[#2d6a4f] py-2 text-xs font-bold text-white transition hover:bg-[#1b4332] shadow-sm"
        >
          Become a Seller
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Sidebar Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[230px] flex-col border-r border-border bg-sidebar p-5 text-sidebar-foreground lg:flex">
        {sidebarContent}
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
                  placeholder="Search for products, crops, tools, seeds..."
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
                <span>Rajahmundry, AP</span>
              </div>

              {/* Weather */}
              <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-foreground/80 border-l border-border pl-3">
                <Sun className="h-3.5 w-3.5 text-amber-500 fill-amber-100" />
                <span>28°C, Sunny</span>
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
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                      alt={user.name}
                      className="h-9 w-9 rounded-full object-cover border border-[#2d6a4f]/20"
                    />
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold leading-none text-foreground">{user.name}</p>
                      <p className="mt-1.5 text-[10px] leading-none text-muted-foreground">{user.role}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-card px-2.5 text-[10px] font-bold text-destructive hover:bg-muted/50 transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="border-l border-border pl-3">
                  <Link
                    to="/login"
                    className="inline-flex h-9 items-center justify-center rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white px-4 text-xs font-bold shadow-sm transition"
                  >
                    Sign In
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
                {SITE.tagline} for farm inputs, mandi prices, crop advisories, schemes, and local
                support.
              </p>
            </div>
            <div className="text-sm">
              <p className="font-bold text-[#1b4332]">Contact</p>
              <p className="mt-2 text-muted-foreground">{SITE.phone}</p>
              <p className="text-muted-foreground">{SITE.email}</p>
            </div>
            <div className="text-sm">
              <p className="font-bold text-[#1b4332]">Address</p>
              <p className="mt-2 text-muted-foreground leading-relaxed">{SITE.address}</p>
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
            <div onClick={() => setOpen(false)}>{sidebarContent}</div>
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
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 max-w-3xl">
          {eyebrow ? (
            <p className="text-sm font-black uppercase tracking-wider text-primary">{eyebrow}</p>
          ) : null}
          <h1 className="mt-2 text-3xl font-black tracking-normal text-foreground sm:text-4xl">
            {title}
          </h1>
          {intro ? <p className="mt-3 text-base leading-7 text-muted-foreground">{intro}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export const cardClass = "rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-200 hover:shadow-card-lg";
