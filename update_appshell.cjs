const fs = require('fs');
let file = fs.readFileSync('src/components/AppShell.tsx', 'utf-8');

const oldPageShell = export function PageShell({
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
};

const newPageShell = export function PageShell({
  eyebrow,
  title,
  intro,
  bgImage,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  bgImage?: string;
  children: ReactNode;
}) {
  if (bgImage) {
    return (
      <section className="relative min-h-[calc(100vh-4rem)] bg-cover bg-center bg-fixed" style={{ backgroundImage: \url(\)\ }}>
        <div className="absolute inset-0 bg-[#052d20]/35" />
        <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-10 mx-auto max-w-7xl">
          <div className="mb-7 max-w-3xl">
            {eyebrow ? (
              <p className="text-sm font-black uppercase tracking-wider text-[#a7f3d0] drop-shadow-md">{eyebrow}</p>
            ) : null}
            <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-4xl drop-shadow-lg">
              {title}
            </h1>
            {intro ? <p className="mt-3 text-base leading-7 text-white/95 drop-shadow-md font-medium">{intro}</p> : null}
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
};

file = file.replace(oldPageShell, newPageShell);

if (!file.includes('glassCardClass')) {
    file += \\nexport const glassCardClass = "rounded-[20px] border border-white/45 bg-white/75 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.10)] backdrop-blur-[16px] transition-all duration-200 hover:bg-white/85 text-foreground";\n\;
}

fs.writeFileSync('src/components/AppShell.tsx', file, 'utf-8');
