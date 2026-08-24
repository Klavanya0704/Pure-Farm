import { Link, useRouterState } from "@tanstack/react-router";
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
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { SITE, waLink } from "@/data/site";
import { useCart } from "./CartContext";

const primaryNav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/marketplace", label: "Marketplace", icon: Store },
  { to: "/market", label: "Mandi Prices", icon: PackageSearch },
  { to: "/schemes", label: "Schemes", icon: ShieldCheck },
  { to: "/weather", label: "Weather", icon: CloudSun },
  { to: "/learn", label: "Learning", icon: BookOpen },
  { to: "/crop-calendar", label: "Crop Calendar", icon: CalendarDays },
  { to: "/notifications", label: "Alerts", icon: Bell },
] as const;

const supportNav = [
  { to: "/crop-insurance", label: "Insurance" },
  { to: "/internships", label: "Internships" },
  { to: "/support", label: "Support" },
  { to: "/contact", label: "Contact" },
  { to: "/about", label: "About" },
  { to: "/admin", label: "Admin" },
] as const;

function NavLink({ to, label, icon: Icon }: { to: string; label: string; icon?: typeof Home }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/78 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
      activeProps={{
        className:
          "flex items-center gap-3 rounded-lg bg-sidebar-primary px-3 py-2 text-sm font-bold text-sidebar-primary-foreground shadow-sm",
      }}
    >
      {Icon ? (
        <Icon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      <span>{label}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const page =
    [...primaryNav, ...supportNav].find((item) => item.to === pathname)?.label || "PureFarm";

  const nav = (
    <nav className="flex flex-col gap-1">
      {primaryNav.map((item) => (
        <NavLink key={item.to} {...item} />
      ))}
      <div className="my-3 border-t border-sidebar-border" />
      {supportNav.map((item) => (
        <NavLink key={item.to} {...item} />
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col bg-sidebar p-5 text-sidebar-foreground lg:flex">
        <Link to="/" className="mb-7 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Leaf className="h-6 w-6" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-xl font-black">{SITE.name}</span>
            <span className="block text-xs text-sidebar-foreground/70">{SITE.tagline}</span>
          </span>
        </Link>
        {nav}
        <div className="mt-auto rounded-xl border border-sidebar-border bg-sidebar-accent p-4">
          <p className="text-sm font-bold">Need farm help?</p>
          <p className="mt-1 text-xs text-sidebar-foreground/72">
            Chat with a PureFarm advisor for orders and crop support.
          </p>
          <a
            href={waLink("Hello PureFarm, I need help with my farm.")}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-sidebar-primary px-3 py-2 text-xs font-bold text-sidebar-primary-foreground"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-border bg-background/92 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <PanelLeft className="hidden h-5 w-5 text-primary lg:block" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{page}</p>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  Amritsar service area · prices and fulfilment are demo data
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/cart"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {count > 0 ? (
                  <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-secondary px-1.5 text-center text-[11px] font-black text-secondary-foreground">
                    {count}
                  </span>
                ) : null}
              </Link>
              <Link
                to="/login"
                className="hidden items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground sm:inline-flex"
              >
                <LogIn className="h-4 w-4" /> Login
              </Link>
              <Link
                to="/register"
                className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold sm:inline-flex"
              >
                <UserPlus className="h-4 w-4" /> Register
              </Link>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <footer className="border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <p className="text-lg font-black">{SITE.name}</p>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                {SITE.tagline} for farm inputs, mandi prices, crop advisories, schemes, and local
                support.
              </p>
            </div>
            <div className="text-sm">
              <p className="font-bold">Contact</p>
              <p className="mt-2 text-muted-foreground">{SITE.phone}</p>
              <p className="text-muted-foreground">{SITE.email}</p>
            </div>
            <div className="text-sm">
              <p className="font-bold">Address</p>
              <p className="mt-2 text-muted-foreground">{SITE.address}</p>
            </div>
          </div>
        </footer>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-black/45"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full w-[min(22rem,86vw)] overflow-y-auto bg-sidebar p-5 text-sidebar-foreground shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-lg font-black"
              >
                <Leaf className="h-6 w-6 text-sidebar-primary" /> {SITE.name}
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-accent"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div onClick={() => setOpen(false)}>{nav}</div>
          </div>
        </div>
      ) : null}

      <a
        href={waLink("Hello PureFarm, I want to connect with an advisor.")}
        className="fixed bottom-5 right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-card-lg"
        aria-label="WhatsApp PureFarm"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
      <Link
        to="/support"
        className="fixed bottom-5 left-5 z-30 hidden h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-card lg:inline-flex"
        aria-label="Support"
      >
        <LifeBuoy className="h-5 w-5" />
      </Link>
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

export const cardClass = "rounded-xl border border-border bg-card p-5 shadow-card";
