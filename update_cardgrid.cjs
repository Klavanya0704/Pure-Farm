const fs = require('fs');
let file = fs.readFileSync('src/components/pages.tsx', 'utf-8');

// Also update imports for AppShell
if (!file.includes('glassCardClass')) {
    file = file.replace('import { cardClass, PageShell } from "./AppShell";', 'import { cardClass, glassCardClass, PageShell } from "./AppShell";');
}

const oldCardGrid = unction CardGridPage({
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
            <div className={\\ h-full\}>;

const newCardGrid = unction CardGridPage({
  eyebrow,
  title,
  intro,
  query,
  setQuery,
  items,
  bgImage,
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
  const currentCardClass = bgImage ? glassCardClass : cardClass;
  return (
    <PageShell eyebrow={eyebrow} title={title} intro={intro} bgImage={bgImage}>
      {setQuery ? (
        <input
          value={query || ""}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className={\mb-5 h-12 w-full max-w-xl rounded-xl border px-4 shadow-sm outline-none transition-all \\}
        />
      ) : null}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const content = (
            <div className={\\ h-full\}>;

file = file.replace(oldCardGrid, newCardGrid);
fs.writeFileSync('src/components/pages.tsx', file, 'utf-8');
