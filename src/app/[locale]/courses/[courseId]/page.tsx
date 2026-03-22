import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Link } from "@i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { AxisTOC } from "@/components/courses/AxisTOC";
import { PurchaseButton } from "@/components/courses/PurchaseButton";
import { LANGUAGE_COLORS, LANGUAGE_DISPLAY_NAMES } from "@/lib/constants";
import {
  getCourseDetail,
  getCourseLessons,
  getPurchaseStatus,
} from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await params;
  const course = getCourseDetail(courseId);
  if (!course) return { title: "IntelloNotes" };
  return {
    title: `${course.title} — IntelloNotes`,
    description: course.description?.slice(0, 160),
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; courseId: string }>;
}) {
  const { locale, courseId } = await params;
  setRequestLocale(locale);

  const [t, tCatalog, tCommon, session] = await Promise.all([
    getTranslations("course"),
    getTranslations("catalog"),
    getTranslations("common"),
    auth(),
  ]);

  // Parallel: course + lessons (purchase depends on session)
  const [course, lessons] = await Promise.all([
    getCourseDetail(courseId),
    getCourseLessons(courseId),
  ]);

  if (!course) {
    notFound();
  }

  // Purchase status depends on session — professors and admins cannot purchase
  const userId = session?.user?.id ?? null;
  const userRole = session?.user?.role ?? null;
  const isStudent = userRole === "student" || userRole === null; // guests treated as potential students

  let purchaseStatus: "pending" | "confirmed" | "rejected" | null = null;
  if (userId && isStudent) {
    const purchase = getPurchaseStatus(userId, courseId);
    purchaseStatus = purchase?.status ?? null;
  }

  const isPurchased = purchaseStatus === "confirmed";
  const professor = course.professor ?? null;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← {tCommon("back")}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ── Main content ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header: badges + title + description */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className={LANGUAGE_COLORS[course.language]}>
                {LANGUAGE_DISPLAY_NAMES[course.language]}
              </Badge>
              <Badge className="bg-gray-100 text-gray-600">
                {tCatalog(course.level)}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
            <p className="text-gray-600 leading-relaxed">{course.description}</p>
          </div>

          {/* Professor card */}
          {professor && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 overflow-hidden flex items-center justify-center">
                {professor.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={professor.avatar_url}
                    alt={professor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 font-medium">
                    {professor.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">{t("professor")}</p>
                <p className="font-semibold text-gray-900">{professor.name}</p>
                {professor.bio && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {professor.bio}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Learning objectives */}
          {(course.objectives ?? []).length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {t("objectives")}
              </h2>
              <ul className="space-y-2">
                {(course.objectives ?? []).map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-primary-600)] shrink-0" />
                    {obj}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Prerequisites */}
          {(course.prerequisites ?? []).length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {t("prerequisites")}
              </h2>
              <ul className="space-y-2">
                {(course.prerequisites ?? []).map((prereq, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                    {prereq}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 5-axis table of contents */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {t("tableOfContents")}
            </h2>
            <AxisTOC lessons={lessons} isPurchased={isPurchased} />
          </section>
        </div>

        {/* ── Sticky sidebar ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <p className="text-3xl font-bold text-gray-900">{course.price} Dh</p>

            {isStudent ? (
              <PurchaseButton
                courseId={courseId}
                price={course.price}
                purchaseStatus={purchaseStatus}
                userId={userId}
              />
            ) : null}

            <div className="pt-4 border-t border-gray-100 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">{t("language")}</span>
                <span className="font-medium text-gray-900">
                  {LANGUAGE_DISPLAY_NAMES[course.language]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">{t("level")}</span>
                <span className="font-medium text-gray-900">
                  {tCatalog(course.level)}
                </span>
              </div>
              {professor && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">{t("professor")}</span>
                  <span className="font-medium text-gray-900 truncate ms-2">
                    {professor.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
