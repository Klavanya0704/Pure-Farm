import React, { ReactNode } from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import { LucideIcon } from "lucide-react";

export interface StudentPortalHeroProps {
  eyebrow?: string;
  eyebrowIcon?: LucideIcon;
  title: string;
  description?: string;
  badges?: Array<{ label: string; icon?: LucideIcon }>;
  actions?: ReactNode;
  children?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
  bannerImage?: string;
}

export function StudentPortalHero({
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  title,
  description,
  badges,
  actions,
  children,
  size = "md",
  className = "",
  bannerImage = "/images/student-learning-banner.png",
}: StudentPortalHeroProps) {
  const { t } = useTranslation();

  const minHeightClass =
    size === "lg"
      ? "min-h-[260px] sm:min-h-[290px] lg:min-h-[320px]"
      : size === "sm"
        ? "min-h-[170px] sm:min-h-[190px]"
        : "min-h-[210px] sm:min-h-[240px] lg:min-h-[260px]";

  const paddingClass =
    size === "lg" ? "p-6 sm:p-8 lg:p-10" : size === "sm" ? "p-5 sm:p-6" : "p-6 sm:p-7 lg:p-8";

  return (
    <section
      className={`relative rounded-3xl overflow-hidden border border-emerald-950/20 shadow-xs bg-[#052e1d] ${minHeightClass} ${className}`}
      style={{
        backgroundImage: `url('${bannerImage}')`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right center",
      }}
    >
      {/* 
        Composition-Optimized PureFarm Overlay:
        - The attached banner features open dark emerald green on the left (~45%) and agriculture students, greenhouse, and solar IoT sensor on the right (~55%).
        - The gradient subtly darkens the left side to guarantee WCAG AAA contrast for text across all display densities,
          while remaining clear and bright on the right so the students and technology remain completely visible.
        - On mobile screens (<640px), the gradient smoothly bridges across to ensure readability on narrow screens.
      */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#092b1b]/95 via-[#0b3320]/80 sm:via-[#0b3320]/65 md:via-[#0b3320]/45 to-black/25 sm:to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#092b1b]/80 via-transparent to-transparent pointer-events-none sm:hidden" />

      {/* Hero Content positioned over the left green open area */}
      <div
        className={`relative z-10 flex flex-col justify-center h-full max-w-2xl ${paddingClass} space-y-3.5`}
      >
        {eyebrow ? (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/25 backdrop-blur-xs border border-emerald-400/35 text-emerald-200 text-xs font-bold w-fit shadow-2xs">
            {EyebrowIcon ? <EyebrowIcon className="h-3.5 w-3.5 text-emerald-300" /> : null}
            <span>{t(eyebrow)}</span>
          </div>
        ) : null}

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
          {t(title)}
        </h1>

        {description ? (
          <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed max-w-xl drop-shadow-xs">
            {t(description)}
          </p>
        ) : null}

        {badges && badges.length > 0 ? (
          <div className="pt-1 flex flex-wrap items-center gap-2.5">
            {badges.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-white/80 shadow-xs text-xs font-bold text-[#1b4332]"
                >
                  {Icon ? (
                    <div className="h-5 w-5 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-800">
                      <Icon className="h-3 w-3" />
                    </div>
                  ) : null}
                  <span>{t(b.label)}</span>
                </div>
              );
            })}
          </div>
        ) : null}

        {actions ? <div className="pt-2 flex flex-wrap items-center gap-3">{actions}</div> : null}

        {children}
      </div>
    </section>
  );
}
