"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

interface SearchBarProps {
  initialQ?: string;
}

export function SearchBar({ initialQ = "" }: SearchBarProps) {
  const t = useTranslations("catalog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Use a ref to avoid stale closure in the debounce effect
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const [value, setValue] = useState(initialQ);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  // Intentionally omitting router/pathname/searchParams to prevent re-trigger on URL change

  return (
    <div className="relative max-w-2xl w-full group">
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-200)] to-[var(--color-primary-400)] rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"></div>
      <Search className="absolute start-6 top-1/2 -translate-y-1/2 h-6 w-6 text-[var(--color-primary-500)] group-focus-within:text-[var(--color-primary-600)] transition-colors pointer-events-none z-10" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("search")}
        className="relative w-full rounded-full border-2 border-white/80 bg-white/60 backdrop-blur-xl ps-16 pe-8 py-5 text-lg font-medium shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-200)] focus:border-[var(--color-primary-400)] focus:bg-white focus:shadow-xl placeholder:text-slate-400 text-slate-800"
      />
    </div>
  );
}
