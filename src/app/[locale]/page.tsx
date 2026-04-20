import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { ValueSection } from "@/components/home/ValueSection";
import { AxesSection } from "@/components/home/AxesSection";
import { FeaturedCourses } from "@/components/home/FeaturedCourses";
import { RolesSection } from "@/components/home/RolesSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FinalCTA } from "@/components/home/FinalCTA";
import { CourseGridSkeleton } from "@/components/courses/CourseCardSkeleton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Platform value */}
      <ValueSection />

      {/* 3. 5-axis learning structure */}
      <AxesSection />

      {/* 4. Featured courses — real DB data, Suspense skeleton while loading */}
      <Suspense
        fallback={
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <CourseGridSkeleton />
            </div>
          </section>
        }
      >
        <FeaturedCourses />
      </Suspense>

      {/* 5. Role-based explanation */}
      <RolesSection />

      {/* 6. How it works */}
      <HowItWorks />

      {/* 7. Final CTA */}
      <FinalCTA />
    </main>
  );
}
