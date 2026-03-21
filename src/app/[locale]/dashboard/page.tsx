import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/queries";
import { Link } from "@i18n/navigation";
import { BookOpen } from "lucide-react";
import { PurchasedCourseCard } from "@/components/dashboard/PurchasedCourseCard";
import type { PurchasedCourse } from "@/components/dashboard/PurchasedCourseCard";
import type { CourseLanguage } from "@/types/database";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("meta.title") };
}

// Extends the card's type with a sort key not needed by the card component
type CourseWithAccess = PurchasedCourse & { lastAccessedAt: string };

// ── Local types (DB rows returned by Supabase join) ───────────────────────────

type PurchaseRow = {
  course_id: string;
  courses: { id: string; title: string; language: CourseLanguage } | null;
};

type ProgressRow = {
  course_id: string;
  current_axis: number;
  is_completed: boolean;
  last_accessed_at: string; // NOT NULL in DB (DEFAULT now())
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  const role = await getUserRole(supabase, user!.id);

  if (role !== "student") {
    redirect(`/${locale}`);
  }

  const t = await getTranslations({ locale, namespace: "dashboard" });

  // Student's display name — stored in auth metadata at signup
  const userName =
    (user.user_metadata?.name as string | undefined) ?? user.email ?? "";

  // ── Parallel fetches ────────────────────────────────────────────────────────
  const [{ data: purchasesData }, { data: progressData }] = await Promise.all([
    (supabase
      .from("purchases")
      .select("course_id, courses(id, title, language)")
      .eq("student_id", user!.id)
      .eq("status", "confirmed")) as unknown as Promise<{
      data: PurchaseRow[] | null;
      error: unknown;
    }>,

    (supabase
      .from("progress")
      .select("course_id, current_axis, is_completed, last_accessed_at")
      .eq("student_id", user!.id)) as unknown as Promise<{
      data: ProgressRow[] | null;
      error: unknown;
    }>,
  ]);

  // ── Merge + sort ────────────────────────────────────────────────────────────
  const progressMap = new Map(
    (progressData ?? []).map((p) => [p.course_id, p])
  );

  const courses: CourseWithAccess[] = (purchasesData ?? [])
    .filter((p) => p.courses !== null)
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
        title: p.courses!.title,
        language: p.courses!.language,
        currentAxis: prog?.current_axis ?? 1,
        isCompleted: prog?.is_completed ?? false,
        lastAccessedLabel,
        // Fall back to epoch so unvisited courses sort last
        lastAccessedAt: rawDate ?? new Date(0).toISOString(),
      };
    })
    .sort((a, b) =>
      new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
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
