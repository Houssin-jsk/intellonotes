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
  const t = await getTranslations({ locale, namespace: "catalogPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function CoursesPage({
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
    <main className="min-h-screen bg-[var(--background)] pb-24 top-0">
      {/* Decorative Hero Background */}
      <div className="relative overflow-hidden bg-[var(--color-primary-900)] pt-16 pb-32 mb-[-80px] z-0 isolate">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-[var(--color-primary-600)] rounded-full blur-[100px] opacity-40 animate-pulse" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[var(--color-primary-400)] rounded-full blur-[120px] opacity-30" />
          <div className="absolute inset-0 bg-[url('/noise.png')] mix-blend-overlay opacity-10"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-sm">{t("title")}</h1>
          <p className="text-lg text-[var(--color-primary-100)] max-w-2xl mx-auto font-medium">{t("subtitle")}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="glass rounded-[2rem] p-6 lg:p-8 shadow-xl border border-white/60 mb-10 animate-fade-in-scale">
          {/* Search + Filters */}
          <div className="flex flex-col gap-6">
            <SearchBar initialQ={q} />
            <FilterChips language={language} level={level} />
          </div>
        </div>

        {/* Course grid — Suspense boundary shows skeleton while fetching */}
        <div className="animate-fade-in-up delay-200">
          <Suspense fallback={<CourseGridSkeleton />}>
            <CourseGrid q={q} language={language} level={level} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
