# PureFarm — Reference Analysis & Rebuild Plan

Inspected the live reference at desktop (1280px) and mobile (390px), crawled every internal link, and read its computed design tokens. Findings below; no code written yet.

## 1. Route inventory

All routes are public — nothing gates on a real session. `/admin` is password-prompt gated (client-side), `/login` is a form that does not lead anywhere authenticated in the reference.

| Route                             | Page                    | Purpose                      | Main sections                                                                                                                                         | Key components                                           | Auth                   |
| --------------------------------- | ----------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------- |
| `/`                               | Farmer Home / Dashboard | Personalised farmer overview | Greeting header, 4 KPI stat cards, Featured Crop Prices, Recent Activity, Weekly Yield Overview bar chart                                             | StatCard, PriceRow, ActivityItem, BarChart               | No (shows demo farmer) |
| `/marketplace`                    | Marketplace             | Browse 100 farm inputs       | Title, search bar, category pills (All/Seeds/Fertilizers/Agriculture Tools), result count, product grid                                               | SearchBar, CategoryPills, ProductCard, QtyStepper, Badge | No                     |
| `/market`                         | Live Market Prices      | Mandi rates                  | Title, "3 Price Alerts" button, state filter pills, price cards with % change and "Big Gainer" badges                                                 | FilterPills, PriceCard, TrendBadge                       | No                     |
| `/schemes`                        | Government Schemes      | Subsidy/welfare programs     | Title, "Saved (n)" toggle, scheme cards (issuer, category, deadline, eligibility, external apply CTA)                                                 | SchemeCard, SaveToggle                                   | No                     |
| `/crop-insurance`                 | Crop Insurance          | Insurance schemes explainer  | Emoji hero, 3 highlight cards, "All Major Schemes" list (PMFBY/WBCIS/CPIS/UPIS) with premium/manager/states/category spec grid, WhatsApp help CTA     | HeroBanner, FeatureCard, SchemeDetailCard                | No                     |
| `/weather`                        | Weather                 | Local conditions             | Current conditions card (temp, condition, H/L, humidity/wind/rain), 5-day forecast strip                                                              | WeatherCard, ForecastDay                                 | No                     |
| `/learn`                          | E-Patashala             | Courses                      | Course cards: title, level badge, instructor, duration, lessons, progress bar, topic tag                                                              | CourseCard, ProgressBar, Badge                           | No                     |
| `/internships`                    | Internship Portal       | Agri internships             | Title, "Saved (n)", internship cards (org, type, location, stipend, posted, skill tags, Apply + WhatsApp)                                             | InternshipCard, TagList                                  | No                     |
| `/crop-calendar`                  | Crop Calendar           | Sowing/harvest guide         | Season Overview 12-month band with Kharif/Rabi/Zaid rows, season filter pills, crop cards (emoji, sowing, harvest, duration, water need, states, tip) | SeasonTimeline, FilterPills, CropCard                    | No                     |
| `/notifications`                  | Notifications           | Alerts feed                  | Chronological notification list with type dot and relative timestamps                                                                                 | NotificationItem                                         | No                     |
| `/about` (`#mission`)             | About                   | Story + founder              | Emoji hero, 4 stat counters, founder profile card, Mission section (anchor)                                                                           | HeroBanner, StatCounter, ProfileCard                     | No                     |
| `/support` (`#privacy`, `#terms`) | Help & Support          | Support hub                  | 4 contact cards, emergency notice, FAQ accordion (8 items), message form, Privacy + Terms anchor sections                                             | ContactCard, Accordion, ContactForm                      | No                     |
| `/contact`                        | Contact                 | Enquiry form                 | Form (name, phone, email, subject select, message) submitting via WhatsApp deep link, contact info sidebar (call/WhatsApp/email/hours/address)        | ContactForm, InfoList                                    | No                     |
| `/order`                          | Order Form              | Manual order confirmation    | Customer Details (name, phone, village, district, state select), Product Details (product, qty, address, payment method select), WhatsApp confirm     | OrderForm, Select                                        | No                     |
| `/login`                          | Login                   | Sign in                      | Brand header, "Register free" link, Google button, email/password, forgot password, Sign In, legal note                                               | AuthCard, Input, Button                                  | No (public)            |
| `/admin`                          | Admin gate              | Password prompt              | Restricted-access card with password field + Access button                                                                                            | AdminGate                                                | Password-gated         |

Implied-but-required routes for discovered flows (reference links to them without dedicated pages): `/register` (from "Register free"), `/cart` (cart icon in topbar), `/wishlist` (heart icon), and a product detail view. I will add these only as minimal pages that complete the flows.

## 2. User flows

- Visitor → `/` dashboard → sidebar to any section.
- Marketplace: search/filter → adjust qty on card → **Add to Cart** (cart badge increments) / **Book** (WhatsApp deep link with product prefilled) / **Fill Order Form** (→ `/order` with product prefilled).
- Cart → `/order` form → **Confirm Order via WhatsApp** → `wa.me` deep link with full order text.
- Schemes: **Apply on Official Portal** → external gov site; **Save** → local saved count.
- Internships: **Apply Now** → external/apply modal; **WhatsApp** → deep link; Save toggle.
- Support/Contact: form → WhatsApp deep link (no backend submit in reference).
- Login: `/login` ↔ `/register`; Google button; on success → `/`.
- Admin: `/admin` password → admin panel.
- Global floating WhatsApp FAB on every page.

Note: the reference is entirely front-end with static demo data and WhatsApp-based ordering — no real auth, cart persistence, or order backend.

## 3. Design system

- **Fonts:** DM Sans (`--app-font-sans`), Georgia serif fallback, Menlo mono. H1 48px/700.
- **Primary:** deep farm green `hsl(123 46% 34%)`; foreground white.
- **Secondary/accent:** marigold amber `hsl(37 94% 56%)` (CTAs, active sidebar item, badges).
- **Sidebar:** dark forest `hsl(124 56% 16%)`, border `124 45% 22%`, active item amber.
- **Backgrounds:** warm off-white page (`50 15% 93%` muted, cream body), white cards.
- **Accent surface:** `123 30% 90%`; muted foreground `123 15% 45%`; destructive `0 70% 50%`.
- **Charts:** green, amber, teal `180 40% 40%`, orange `25 85% 55%`, deep blue `200 80% 30%`.
- **Radius:** `0.75rem` base with sm/md/lg/xl derivations; pills fully rounded.
- **Shadows:** `0 1px 3px #0000000f`, `0 4px 12px -2px #00000012`, `0 8px 24px -4px #00000014`, `0 20px 40px -8px #0000001a`.
- **Cards:** white, 1px warm border, radius-xl, subtle shadow, 20–24px padding.
- **Buttons:** solid green primary, gradient-green "Book", ghost/outline secondary, amber full-width sidebar CTA, icon buttons in topbar.
- **Badges:** amber "Best Seller"/"Top Rated"/"Featured" top-left on images, green "In Stock" top-right, category caps label, "Big Gainer" trend pill.
- **Icons:** Lucide-style line icons throughout; emoji used decoratively on crop/insurance pages.
- **Imagery:** photographic crop/product images on marketplace cards (I'll generate our own).
- **Spacing/grid:** 280px fixed sidebar + fluid content, max content width ~960–1200px, 24px gutters, 3-col product grid.

## 4. Shared components

AppShell, Sidebar (grouped MAIN/MORE nav + footer CTA), Topbar (search, theme, wishlist, cart, Login), MobileNav (hamburger drawer), Footer (4-column), WhatsAppFab, PageHeader, StatCard, Card, Button, Input, Select, Textarea, Badge, FilterPills, SearchBar, ProductCard, QtyStepper, PriceCard, SchemeCard, CourseCard, InternshipCard, CropCard, SeasonTimeline, WeatherCard, ForecastStrip, NotificationItem, ActivityFeed, Accordion, ContactForm, OrderForm, AuthCard, EmptyState, Toast.

## 5. Data models

Product (id, name, brand, category, description, price, unit, rating, stock, image, badge), Category, CartItem, Order (customer, product, qty, address, paymentMethod, state), MandiPrice (crop, mandi, state, price, changePct, bigGainer), Scheme, InsuranceScheme, Course, Internship, Crop (season, sowing, harvest, duration, water, states, tip), WeatherNow + ForecastDay, Notification, Activity, FarmerProfile, User, FaqItem.

Storage: all demo content ships as typed local data modules; cart/saved/wishlist in local state + localStorage. No backend needed unless you want real auth/orders — say the word and I'll add Lovable Cloud.

## 6. Responsive behaviour

- **Desktop ≥1024px:** fixed dark sidebar, topbar icons, 3-col product grid, 2-col dashboard panels, 4-col stat row, 4-col footer.
- **Tablet 768–1023px:** sidebar collapses to drawer, 2-col product grid, 2-col stats, filters stay horizontal (scrollable), footer 2-col.
- **Mobile <768px:** hamburger + centered brand topbar, full-screen nav drawer, single-column everything (stats stack as full-width cards, confirmed in capture), horizontally scrollable filter pills and month timeline, stacked forms, full-width buttons, H1 ~30px, tighter 16px gutters, WhatsApp FAB stays bottom-right.

## 7. Implementation plan

- **Phase 1 — Foundation:** route scaffolding for all 16 routes, typed data modules, per-route head() metadata.
- **Phase 2 — Design system:** oklch tokens in `src/styles.css` (green/amber/cream), DM Sans, radii, shadows, button/badge/card variants.
- **Phase 3 — Global layout:** AppShell, Sidebar, Topbar, MobileNav drawer, Footer, WhatsAppFab.
- **Phase 4 — Public pages:** About, Support (FAQ + privacy/terms anchors), Contact.
- **Phase 5 — Marketplace:** search, category filters, 100-product dataset, ProductCard with qty stepper and three CTAs, generated product imagery.
- **Phase 6 — Detail flows:** product detail view, cart drawer/page, wishlist.
- **Phase 7 — Auth:** `/login`, `/register`, `/admin` gate (UI-level; real auth only if you want Cloud).
- **Phase 8 — Farmer features:** Market Prices, Weather, Crop Calendar, Crop Insurance.
- **Phase 9 — Growth features:** E-Patashala, Internships, Notifications.
- **Phase 10 — Dashboard:** home KPIs, featured prices, activity feed, weekly yield chart.
- **Phase 11 — Order flow:** `/order` prefilled from product/cart, WhatsApp deep-link confirmation.
- **Phase 12 — Responsive pass + visual QA:** desktop/tablet/mobile screenshots compared against the reference, build check.

## Decisions I need from you

1. Real backend (Lovable Cloud auth + orders + cart persistence) or front-end demo data like the reference?
2. Keep the WhatsApp-based ordering with your number, or replace with an in-app checkout?
3. Keep the founder/about content and branding as-is, or substitute your own name, stats, and contact details?
