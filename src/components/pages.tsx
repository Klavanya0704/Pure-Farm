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
} from "lucide-react";
import { useMemo, useState } from "react";
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
import { SITE } from "@/data/site";
import type { Category, NotificationItem, Product } from "@/data/types";
import { cardClass, PageShell } from "./AppShell";
import { getCartProducts, useCart } from "./CartContext";
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

export function HomePage() {
  const featured = PRODUCTS.filter((p) => p.badge).slice(0, 4);
  return (
    <>
      <section className="gradient-hero px-4 py-10 text-white sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="inline-flex rounded-full bg-white/14 px-4 py-2 text-sm font-bold">
              Trusted local farm commerce and advisory
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              PureFarm
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/84">
              Buy farm inputs, track mandi prices, follow weather advisories, discover schemes, and
              learn crop practices from one farmer-first dashboard.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 rounded-lg bg-secondary px-5 py-3 font-black text-secondary-foreground"
              >
                Shop inputs <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/market"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-3 font-bold text-white"
              >
                View mandi prices
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Stat value="100" label="catalogued products" />
              <Stat value="8" label="active mandi feeds" />
              <Stat value="24/7" label="support via WhatsApp" />
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-card-lg">
            <img
              src={featured[0]?.image}
              alt="PureFarm agriculture products"
              className="h-72 w-full object-cover sm:h-96"
            />
            <div className="grid grid-cols-3 gap-px bg-white/20">
              {featured.slice(1, 4).map((product) => (
                <img
                  key={product.id}
                  src={product.image}
                  alt=""
                  className="h-24 w-full object-cover"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 md:grid-cols-4">
            {(
              [
                [
                  "Marketplace",
                  "Certified seeds, fertilisers, tools, irrigation kits.",
                  "/marketplace",
                ],
                ["Crop Services", "Weather, crop calendar, insurance, and schemes.", "/weather"],
                ["Learning", "Short field-ready courses for better decisions.", "/learn"],
                ["Support", "Contact forms, FAQs, and WhatsApp assistance.", "/support"],
              ] as const
            ).map(([title, body, to]) => (
              <Link
                key={title}
                to={to}
                className={`${cardClass} block transition hover:-translate-y-0.5 hover:shadow-card-lg`}
              >
                <p className="text-lg font-black">{title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </Link>
            ))}
          </div>

          <div className="mt-12 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-primary">Featured inputs</p>
              <h2 className="mt-2 text-3xl font-black">Popular this season</h2>
            </div>
            <Link
              to="/marketplace"
              className="hidden items-center gap-2 font-bold text-primary sm:inline-flex"
            >
              Browse all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function MarketplacePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(200000);

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
    <PageShell
      eyebrow="Marketplace"
      title="Farm input marketplace"
      intro="Search the full 100-product catalogue, compare prices, filter categories, and add products to your cart."
    >
      <div className="mb-6 grid gap-3 rounded-xl border border-border bg-card p-4 shadow-card lg:grid-cols-[1fr_12rem_12rem_14rem]">
        <label className="relative block">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search seeds, fertiliser, tools..."
            className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none ring-primary focus:ring-2"
          />
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | "all")}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
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
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
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
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
  );
}

export function ProductDetailPage({ id }: { id: string }) {
  const product = getProduct(id);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const navigate = useNavigate();

  if (!product) {
    return (
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
    );
  }

  const related = PRODUCTS.filter(
    (item) => item.category === product.category && item.id !== product.id,
  ).slice(0, 4);

  return (
    <PageShell eyebrow={product.category} title={product.name} intro={product.description}>
      <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
        <img
          src={product.image}
          alt={product.name}
          className="h-80 w-full rounded-xl object-cover shadow-card lg:h-[32rem]"
        />
        <div className={cardClass}>
          <div className="flex flex-wrap items-center gap-2">
            <Pill>{product.brand}</Pill>
            {product.badge ? <Pill>{product.badge}</Pill> : null}
            <Pill>{product.rating} rating</Pill>
          </div>
          <p className="mt-5 text-4xl font-black">
            {formatRupees(product.price)}{" "}
            <span className="text-base font-semibold text-muted-foreground">/{product.unit}</span>
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["Availability", product.stock > 0 ? `${product.stock} units ready` : "Out of stock"],
              ["Seller", product.brand],
              ["Category", product.category],
              ["Delivery", "Local hub dispatch in 1-3 days"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-muted p-4">
                <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
                <p className="mt-1 font-black">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-lg border border-border bg-background">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="h-11 w-11"
                aria-label="Decrease quantity"
              >
                <Minus className="mx-auto h-4 w-4" />
              </button>
              <span className="w-12 text-center font-black">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                className="h-11 w-11"
                aria-label="Increase quantity"
              >
                <Plus className="mx-auto h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => addItem(product.id, qty)}
              className="rounded-lg bg-primary px-5 py-3 font-black text-primary-foreground"
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={() => {
                addItem(product.id, qty);
                void navigate({ to: "/order" });
              }}
              className="rounded-lg bg-secondary px-5 py-3 font-black text-secondary-foreground"
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
  );
}

export function CartPage() {
  const { items, subtotal, updateQty, removeItem } = useCart();
  const rows = getCartProducts(items);
  const delivery = subtotal > 0 && subtotal < 2000 ? 120 : 0;
  const total = subtotal + delivery;

  return (
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
    );
  }

  return (
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
  );
}

export function MarketPage() {
  const [query, setQuery] = useState("");
  const rows = MANDI_PRICES.filter((item) =>
    `${item.crop} ${item.mandi} ${item.state}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
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
  );
}

export function SchemesPage() {
  const [query, setQuery] = useState("");
  const rows = SCHEMES.filter((s) =>
    `${s.name} ${s.category} ${s.eligibility}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
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
  );
}

export function InsurancePage() {
  return (
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
  );
}

export function WeatherPage() {
  return (
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
  );
}

export function CropCalendarPage() {
  const [selected, setSelected] = useState(CROPS[0]?.name || "");
  const crop = CROPS.find((item) => item.name === selected) || CROPS[0];
  return (
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
  );
}

export function LearnPage() {
  const [query, setQuery] = useState("");
  const rows = COURSES.filter((c) =>
    `${c.title} ${c.topic} ${c.level}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
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
  );
}

export function InternshipsPage() {
  return (
    <CardGridPage
      eyebrow="Internships"
      title="Agri internships"
      intro="Field, operations, content, and lab roles for agriculture learners."
      items={INTERNSHIPS.map((i) => ({
        title: i.title,
        meta: `${i.org} · ${i.location} · ${i.type}`,
        body: i.description || "",
        footer: `${i.stipend} · Apply by ${i.deadline} · ${i.skills.join(", ")}`,
      }))}
    />
  );
}

export function NotificationsPage() {
  const [items, setItems] = useState(NOTIFICATIONS);
  const unread = items.filter((n) => !n.read).length;
  return (
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
  return <AuthPage mode="login" />;
}

export function RegisterPage() {
  return <AuthPage mode="register" />;
}

function AuthPage({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const valid =
    form.phone.length >= 10 &&
    form.password.length >= 6 &&
    (mode === "login" || form.name.length > 2);
  return (
    <PageShell
      eyebrow="Account"
      title={mode === "login" ? "Login" : "Register"}
      intro="Frontend-only demo authentication with validation and a success navigation."
    >
      <form
        className={`${cardClass} mx-auto max-w-md space-y-4`}
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) void navigate({ to: "/" });
        }}
      >
        {mode === "register" ? (
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full name"
            className="h-11 w-full rounded-lg border border-input bg-background px-3"
          />
        ) : null}
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Mobile number"
          className="h-11 w-full rounded-lg border border-input bg-background px-3"
        />
        <div className="flex gap-2">
          <input
            type={show ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Password"
            className="h-11 min-w-0 flex-1 rounded-lg border border-input bg-background px-3"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="rounded-lg border border-border px-3 text-sm font-bold"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
        {!valid ? (
          <p className="text-sm text-muted-foreground">
            Use a 10-digit phone number and at least 6 password characters.
          </p>
        ) : null}
        <button
          disabled={!valid}
          className="w-full rounded-lg bg-primary px-4 py-3 font-black text-primary-foreground disabled:opacity-50"
        >
          {mode === "login" ? "Login" : "Create account"}
        </button>
      </form>
    </PageShell>
  );
}

export function AdminPage() {
  return (
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
