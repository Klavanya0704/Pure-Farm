import re
import os

with open('src/components/pages.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

def replace_safely(pattern, repl, text):
    if re.search(pattern, text):
        return re.sub(pattern, repl, text)
    else:
        print(f"Warning: Could not find {pattern}")
        return text

# Import glassCardClass
content = replace_safely(
    r'import \{ cardClass, PageShell \} from "\./AppShell";',
    r'import { cardClass, glassCardClass, PageShell } from "./AppShell";',
    content
)

# Update CardGridPage definition
content = replace_safely(
    r'function CardGridPage\(\{\n  eyebrow,\n  title,\n  intro,\n  query,\n  setQuery,\n  items,\n\}: \{\n  eyebrow: string;\n  title: string;\n  intro: string;\n  query\?: string;\n  setQuery\?: \(value: string\) => void;\n  items: \{\n    title: string;\n    meta: string;\n    body: string;\n    footer: string;\n    url\?: string;\n    icon\?: React\.ReactNode;\n  \}\[\];\n\}\) \{\n  return \(\n    <PageShell eyebrow=\{eyebrow\} title=\{title\} intro=\{intro\}>\n      \{setQuery \? \(\n        <input\n          value=\{query \|\| ""\}\n          onChange=\{\(e\) => setQuery\(e\.target\.value\)\}\n          placeholder="Search\.\.\."\n          className="mb-5 h-11 w-full max-w-xl rounded-lg border border-input bg-card px-4"\n        />\n      \) : null\}\n      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">\n        \{items\.map\(\(item\) => \{\n          const content = \(\n            <div className=\{\\$\{cardClass\} h-full\\}>',
    '''function CardGridPage({
  eyebrow,
  title,
  intro,
  query,
  setQuery,
  bgImage,
  items,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  query?: string;
  setQuery?: (value: string) => void;
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
  const currentClass = bgImage ? glassCardClass : cardClass;
  return (
    <PageShell eyebrow={eyebrow} title={title} intro={intro} bgImage={bgImage}>
      {setQuery ? (
        <input
          value={query || ""}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className={mb-5 h-12 w-full max-w-xl rounded-xl border px-4 shadow-sm outline-none transition-all }
        />
      ) : null}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const content = (
            <div className={${currentClass} h-full}>''',
    content
)

# Schemes
content = replace_safely(
    r'<CardGridPage\s+eyebrow="Schemes"',
    r'<CardGridPage\n        bgImage="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2000"\n        eyebrow="Schemes"',
    content
)

# Insurance
content = replace_safely(
    r'<CardGridPage\s+eyebrow="Insurance"',
    r'<CardGridPage\n        bgImage="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2000"\n        eyebrow="Insurance"',
    content
)

# Weather
content = replace_safely(
    r'<PageShell\s+eyebrow="Weather"',
    r'<PageShell\n        bgImage="https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=2000"\n        eyebrow="Weather"',
    content
)
content = replace_safely(
    r'export function WeatherPage.*?(<div key=\{day\.day\} className=\{cardClass\})',
    r'\g<0>'.replace('cardClass', 'glassCardClass'),
    content
) # This might be tricky, let's just do a specific replace for WeatherPage
weather_find = '            <div key={day.day} className={cardClass}>'
weather_rep = '            <div key={day.day} className={glassCardClass}>'
content = content.replace(weather_find, weather_rep)


# Crop Calendar
content = replace_safely(
    r'<PageShell\s+eyebrow="Crop calendar"',
    r'<PageShell\n        bgImage="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=2000"\n        eyebrow="Crop calendar"',
    content
)
cc_find = '<div className={cardClass}>'
cc_rep = '<div className={glassCardClass}>'
# There are multiple cardClass in CropCalendar. Replace them inside the CropCalendarPage function.
start_idx = content.find('export function CropCalendarPage')
end_idx = content.find('export function LearnPage')
if start_idx != -1 and end_idx != -1:
    cc_part = content[start_idx:end_idx].replace(cc_find, cc_rep)
    content = content[:start_idx] + cc_part + content[end_idx:]


# Learn
content = replace_safely(
    r'<CardGridPage\s+eyebrow="Learning"',
    r'<CardGridPage\n        bgImage="https://upload.wikimedia.org/wikipedia/commons/f/fc/Farmer_working_in_the_field_with_their_tractor.jpg"\n        eyebrow="Learning"',
    content
)

# Internships
content = replace_safely(
    r'<CardGridPage\s+eyebrow="Internships"',
    r'<CardGridPage\n        bgImage="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=2000"\n        eyebrow="Internships"',
    content
)

# Notifications
content = replace_safely(
    r'<PageShell\s+eyebrow="Notifications"',
    r'<PageShell\n        bgImage="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000"\n        eyebrow="Notifications"',
    content
)
notif_find1 = 'className={lock w-full rounded-xl border p-4 text-left shadow-card }'
notif_rep1 = 'className={lock w-full rounded-2xl border p-4 text-left shadow-card }'
content = content.replace(notif_find1, notif_rep1)


# Order
content = replace_safely(
    r'<PageShell\s+eyebrow="Orders"',
    r'<PageShell\n        bgImage="https://images.unsplash.com/photo-1591955506264-3f5a6834570a?auto=format&fit=crop&w=2000"\n        eyebrow="Orders"',
    content
)
content = replace_safely(
    r'<PageShell\s+eyebrow="Checkout"',
    r'<PageShell\n        bgImage="https://images.unsplash.com/photo-1591955506264-3f5a6834570a?auto=format&fit=crop&w=2000"\n        eyebrow="Checkout"',
    content
)
content = replace_safely(
    r'<PageShell\s+title="Order confirmed"',
    r'<PageShell\n          bgImage="https://images.unsplash.com/photo-1591955506264-3f5a6834570a?auto=format&fit=crop&w=2000"\n          title="Order confirmed"',
    content
)

order_find = 'className={${cardClass} space-y-4}'
order_rep = 'className={${glassCardClass} space-y-4}'
content = content.replace(order_find, order_rep)

order_find2 = '<div className={cardClass}>'
order_rep2 = '<div className={glassCardClass}>'
start_idx2 = content.find('export function OrderPage')
end_idx2 = content.find('export function MarketPage')
if start_idx2 != -1 and end_idx2 != -1:
    order_part = content[start_idx2:end_idx2].replace(order_find2, order_rep2)
    content = content[:start_idx2] + order_part + content[end_idx2:]


with open('src/components/pages.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Safely replaced pages.tsx content!")
