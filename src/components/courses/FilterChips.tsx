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
        "shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
        active
          ? "bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)]"
          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
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
    <div className="flex flex-col gap-3">
      {/* Language filter — horizontally scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
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

      {/* Level filter */}
      <div className="flex gap-2">
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
  );
}
