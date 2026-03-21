import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { SearchBar } from "@/components/courses/SearchBar";
import { FilterChips } from "@/components/courses/FilterChips";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { CourseGridSkeleton } from "@/components/courses/CourseCardSkeleton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; language?: string; level?: string }>;
}) {
  const { locale } = await params;
  const { q, language, level } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations("catalog");

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-2 text-gray-600">{t("subtitle")}</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-4 mb-8">
        <SearchBar initialQ={q} />
        <FilterChips language={language} level={level} />
      </div>

      {/* Course grid — Suspense boundary shows skeleton while fetching */}
      <Suspense fallback={<CourseGridSkeleton />}>
        <CourseGrid q={q} language={language} level={level} />
      </Suspense>
    </main>
  );
}
