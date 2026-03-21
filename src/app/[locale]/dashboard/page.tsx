import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Link } from "@i18n/navigation";
import { BookOpen } from "lucide-react";
import { PurchasedCourseCard } from "@/components/dashboard/PurchasedCourseCard";
import type { PurchasedCourse } from "@/components/dashboard/PurchasedCourseCard";
import { getStudentPurchases, getStudentProgress } from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("meta.title") };
}

type CourseWithAccess = PurchasedCourse & { lastAccessedAt: string };

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  const role = session.user.role;
  if (role !== "student") {
    redirect(`/${locale}`);
  }

  const userId = session.user.id;
  const userName = session.user.name ?? session.user.email ?? "";

  const t = await getTranslations({ locale, namespace: "dashboard" });

  // ── Parallel fetches ────────────────────────────────────────────────────────
  const [purchases, progressList] = await Promise.all([
    getStudentPurchases(userId),
    getStudentProgress(userId),
  ]);

  // ── Merge + sort ────────────────────────────────────────────────────────────
  const progressMap = new Map(progressList.map((p) => [p.course_id, p]));

  const courses: CourseWithAccess[] = purchases
    .filter((p) => p.course !== null)
    .map((p) => {
      const prog = progressMap.get(p.course_id);
      const rawDate = prog?.last_accessed_at;
      const isNeverAccessed = !rawDate;
      const lastAccessedLabel = isNeverAccessed
        ? undefined
        : t("lastAccessed", {
            date: new Intl.DateTimeFormat(locale, {
              day: "numeric",
              month: "short",
            }).format(new Date(rawDate)),
          });
      return {
        courseId: p.course_id,
        title: p.course!.title,
        language: p.course!.language,
        currentAxis: prog?.current_axis ?? 1,
        isCompleted: prog?.is_completed ?? false,
        lastAccessedLabel,
        lastAccessedAt: rawDate ?? new Date(0).toISOString(),
      };
    })
    .sort(
      (a, b) =>
        new Date(b.lastAccessedAt).getTime() -
        new Date(a.lastAccessedAt).getTime()
    );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("welcomeBack", { name: userName })}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t("title")}</p>
      </div>

      {courses.length === 0 ? (
        /* ── Empty state ── */
        <div className="text-center py-16 space-y-4">
          <BookOpen size={48} className="mx-auto text-gray-300" />
          <p className="text-gray-400 text-sm">{t("noCourses")}</p>
          <Link
            href="/"
            className="inline-block text-sm font-medium bg-[var(--color-primary-600)] text-white px-5 py-2 rounded-lg hover:bg-[var(--color-primary-700)] transition-colors"
          >
            {t("browseCoursesLink")}
          </Link>
        </div>
      ) : (
        /* ── Course grid ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <PurchasedCourseCard key={course.courseId} course={course} />
          ))}
        </div>
      )}
    </main>
  );
}
