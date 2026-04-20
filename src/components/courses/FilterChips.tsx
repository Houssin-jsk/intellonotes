"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@i18n/navigation";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { SUPPORTED_LANGUAGES, COURSE_LEVELS, LANGUAGE_DISPLAY_NAMES } from "@/lib/constants";

interface FilterChipsProps {
  language?: string;
  level?: string;
}

interface ChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function Chip({ active, onClick, children }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border duration-300",
        active
          ? "bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-500)] text-white border-[var(--color-primary-400)] shadow-[0_5px_15px_rgba(37,99,235,0.4)] scale-105"
          : "glass text-slate-600 border-white/60 hover:border-slate-300 hover:bg-white hover:-translate-y-0.5 hover:shadow-md"
      )}
    >
      {children}
    </button>
  );
}

export function FilterChips({ language, level }: FilterChipsProps) {
  const t = useTranslations("catalog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="flex flex-col gap-5 pt-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Language filter */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 no-scrollbar flex-1">
          <span className="text-sm font-extrabold text-slate-400 uppercase tracking-widest shrink-0 mr-2">Language</span>
          <Chip active={!language} onClick={() => updateFilter("language", null)}>
            {t("allLanguages")}
          </Chip>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <Chip
              key={lang}
              active={language === lang}
              onClick={() => updateFilter("language", lang)}
            >
              {LANGUAGE_DISPLAY_NAMES[lang]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-t border-slate-200/60 pt-4">
        {/* Level filter */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 no-scrollbar flex-1">
          <span className="text-sm font-extrabold text-slate-400 uppercase tracking-widest shrink-0 mr-2">Level</span>
          <Chip active={!level} onClick={() => updateFilter("level", null)}>
            {t("allLevels")}
          </Chip>
          {COURSE_LEVELS.map((lvl) => (
            <Chip
              key={lvl}
              active={level === lvl}
              onClick={() => updateFilter("level", lvl)}
            >
              {t(lvl)}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
