const fs = require('fs');
let file = fs.readFileSync('src/components/pages.tsx', 'utf-8');

const replacements = [
  {
    find: /export function SchemesPage\(\) \{\s*const \[query, setQuery\] = useState\(\"\"\);\s*const rows = SCHEMES\.filter\(\(s\) =>\s*\$\{s\.name\} \$\{s\.category\} \$\{s\.eligibility\}\.toLowerCase\(\)\.includes\(query\.toLowerCase\(\)\),\s*\);\s*return \(\s*<RoleGuard allowedRoles=\{\[\"farmer\", \"admin\"\]\}>\s*<CardGridPage\s*eyebrow=\"Schemes\"/g,
    replace: \export function SchemesPage() {
  const [query, setQuery] = useState("");
  const rows = SCHEMES.filter((s) =>
    \\\\ \ \\\\.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <CardGridPage
        bgImage="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2000"
        eyebrow="Schemes"\
  },
  {
    find: /export function InsurancePage\(\) \{\s*return \(\s*<RoleGuard allowedRoles=\{\[\"farmer\", \"admin\"\]\}>\s*<CardGridPage\s*eyebrow=\"Insurance\"/g,
    replace: \export function InsurancePage() {
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <CardGridPage
        bgImage="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2000"
        eyebrow="Insurance"\
  },
  {
    find: /export function WeatherPage\(\) \{\s*return \(\s*<RoleGuard allowedRoles=\{\[\"farmer\", \"admin\"\]\}>\s*<PageShell\s*eyebrow=\"Weather\"/g,
    replace: \export function WeatherPage() {
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=2000"
        eyebrow="Weather"\
  },
  {
    find: /export function CropCalendarPage\(\) \{\s*const \[selected, setSelected\] = useState\(CROPS\[0\]\?\.name \|\| \"\"\);\s*const crop = CROPS\.find\(\(item\) => item\.name === selected\) \|\| CROPS\[0\];\s*return \(\s*<RoleGuard allowedRoles=\{\[\"farmer\", \"admin\"\]\}>\s*<PageShell\s*eyebrow=\"Crop calendar\"/g,
    replace: \export function CropCalendarPage() {
  const [selected, setSelected] = useState(CROPS[0]?.name || "");
  const crop = CROPS.find((item) => item.name === selected) || CROPS[0];
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=2000"
        eyebrow="Crop calendar"\
  },
  {
    find: /export function LearnPage\(\) \{\s*const \[query, setQuery\] = useState\(\"\"\);\s*const rows = COURSES\.filter\(\(c\) =>\s*\$\{c\.title\} \$\{c\.topic\} \$\{c\.level\}\.toLowerCase\(\)\.includes\(query\.toLowerCase\(\)\),\s*\);\s*return \(\s*<RoleGuard allowedRoles=\{\[\"farmer\", \"admin\"\]\}>\s*<CardGridPage\s*eyebrow=\"Learning\"/g,
    replace: \export function LearnPage() {
  const [query, setQuery] = useState("");
  const rows = COURSES.filter((c) =>
    \\\\ \ \\\\.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <CardGridPage
        bgImage="https://upload.wikimedia.org/wikipedia/commons/f/fc/Farmer_working_in_the_field_with_their_tractor.jpg"
        eyebrow="Learning"\
  },
  {
    find: /export function InternshipsPage\(\) \{\s*return \(\s*<RoleGuard allowedRoles=\{\[\"farmer\", \"admin\"\]\}>\s*<CardGridPage\s*eyebrow=\"Internships\"/g,
    replace: \export function InternshipsPage() {
  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <CardGridPage
        bgImage="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=2000"
        eyebrow="Internships"\
  },
  {
    find: /export function NotificationsPage\(\) \{\s*const \[items, setItems\] = useState\(NOTIFICATIONS\);\s*const unread = items\.filter\(\(n\) => !n\.read\)\.length;\s*return \(\s*<RoleGuard allowedRoles=\{\[\"buyer\", \"farmer\", \"seller\", \"admin\"\]\}>\s*<PageShell\s*eyebrow=\"Notifications\"/g,
    replace: \export function NotificationsPage() {
  const [items, setItems] = useState(NOTIFICATIONS);
  const unread = items.filter((n) => !n.read).length;
  return (
    <RoleGuard allowedRoles={["buyer", "farmer", "seller", "admin"]}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000"
        eyebrow="Notifications"\
  },
  {
    find: /export function OrderPage\(\) \{\s*const \[orders, setOrders\] = useState\(ORDERS\);\s*return \(\s*<RoleGuard allowedRoles=\{\[\"buyer\", \"farmer\"\]\}>\s*<PageShell\s*eyebrow=\"Orders\"/g,
    replace: \export function OrderPage() {
  const [orders, setOrders] = useState(ORDERS);
  return (
    <RoleGuard allowedRoles={["buyer", "farmer"]}>
      <PageShell
        bgImage="https://images.unsplash.com/photo-1591955506264-3f5a6834570a?auto=format&fit=crop&w=2000"
        eyebrow="Orders"\
  }
];

let madeChanges = false;
for (let r of replacements) {
    if (file.match(r.find)) {
        file = file.replace(r.find, r.replace);
        madeChanges = true;
    } else {
        console.log("Could not match regex for a replacement.");
        console.log(r.find);
    }
}

if (madeChanges) {
    fs.writeFileSync('src/components/pages.tsx', file, 'utf-8');
    console.log("Updated pages.tsx successfully.");
} else {
    console.log("No changes made.");
}
