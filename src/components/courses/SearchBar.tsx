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
    <div className="relative">
      <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("search")}
        className="w-full rounded-xl border border-gray-200 bg-white ps-10 pe-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-transparent placeholder:text-gray-400"
      />
    </div>
  );
}
