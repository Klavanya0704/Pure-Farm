import re

with open('src/components/pages.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken MarketPage
broken_market_page = '''                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0fdf4] text-[#2d6a4f] mb-5 group-hover:scale-110 transition-transform duration-300">
                    <val.icon className="h-7 w-7" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2">{val.title}</h4>
                  <p className="text-sm text-muted-foreground">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
    ${s.name}  .toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <CardGridPage
        eyebrow="Schemes"'''

fixed_market_page = '''                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0fdf4] text-[#2d6a4f] mb-5 group-hover:scale-110 transition-transform duration-300">
                    <val.icon className="h-7 w-7" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2">{val.title}</h4>
                  <p className="text-sm text-muted-foreground">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM DECORATIVE AREA */}
        <div className="bg-[#1b4332] relative overflow-hidden h-40 flex items-center justify-center rounded-t-[2.5rem]">
           <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/1/12/Tractor_New_Holland_T6.165_plowing_%28Zadobrova%2C_Ljubljana%29.jpg')] bg-cover bg-center" />
           <p className="relative z-10 text-emerald-50 text-xl md:text-2xl font-serif italic tracking-wide">"Farming Today for a Greener Tomorrow"</p>
        </div>
      </div>
    </RoleGuard>
  );
}

export function SchemesPage() {
  const [query, setQuery] = useState("");
  const rows = SCHEMES.filter((s) =>
    ${s.name}  .toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <CardGridPage
        bgImage="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2000"
        eyebrow="Schemes"'''

content = content.replace(broken_market_page, fixed_market_page)

replacements = [
    (
        '''export function InsurancePage() {
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <CardGridPage
        eyebrow="Insurance"''',
        '''export function InsurancePage() {
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <CardGridPage
        bgImage="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2000"
        eyebrow="Insurance"'''
    ),
    (
        '''export function WeatherPage() {
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <PageShell
        eyebrow="Weather"''',
        '''export function WeatherPage() {
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=2000"
        eyebrow="Weather"'''
    ),
    (
        '''export function CropCalendarPage() {
  const [selected, setSelected] = useState(CROPS[0]?.name || "");
  const crop = CROPS.find((item) => item.name === selected) || CROPS[0];
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <PageShell
        eyebrow="Crop calendar"''',
        '''export function CropCalendarPage() {
  const [selected, setSelected] = useState(CROPS[0]?.name || "");
  const crop = CROPS.find((item) => item.name === selected) || CROPS[0];
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=2000"
        eyebrow="Crop calendar"'''
    ),
    (
        '''export function LearnPage() {
  const [query, setQuery] = useState("");
  const rows = COURSES.filter((c) =>
    ${c.title}  .toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <CardGridPage
        eyebrow="Learning"''',
        '''export function LearnPage() {
  const [query, setQuery] = useState("");
  const rows = COURSES.filter((c) =>
    ${c.title}  .toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <CardGridPage
        bgImage="https://upload.wikimedia.org/wikipedia/commons/f/fc/Farmer_working_in_the_field_with_their_tractor.jpg"
        eyebrow="Learning"'''
    ),
    (
        '''export function InternshipsPage() {
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <CardGridPage
        eyebrow="Internships"''',
        '''export function InternshipsPage() {
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <CardGridPage
        bgImage="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=2000"
        eyebrow="Internships"'''
    ),
    (
        '''export function NotificationsPage() {
  const [items, setItems] = useState(NOTIFICATIONS);
  const unread = items.filter((n) => !n.read).length;
  return (
    <RoleGuard allowedRoles={["buyer", "farmer", "seller", "admin"]}>
      <PageShell
        eyebrow="Notifications"''',
        '''export function NotificationsPage() {
  const [items, setItems] = useState(NOTIFICATIONS);
  const unread = items.filter((n) => !n.read).length;
  return (
    <RoleGuard allowedRoles={["buyer", "farmer", "seller", "admin"]}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000"
        eyebrow="Notifications"'''
    ),
    (
        '''export function OrderPage() {
  const [orders, setOrders] = useState(ORDERS);
  return (
    <RoleGuard allowedRoles={["buyer", "farmer"]}>
      <PageShell
        eyebrow="Orders"''',
        '''export function OrderPage() {
  const [orders, setOrders] = useState(ORDERS);
  return (
    <RoleGuard allowedRoles={["buyer", "farmer"]}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1591955506264-3f5a6834570a?auto=format&fit=crop&w=2000"
        eyebrow="Orders"'''
    )
]

for find, rep in replacements:
    content = content.replace(find, rep)

with open('src/components/pages.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
