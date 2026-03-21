import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { AxisTOC } from "@/components/courses/AxisTOC";
import { PurchaseButton } from "@/components/courses/PurchaseButton";
import { LANGUAGE_COLORS, LANGUAGE_DISPLAY_NAMES } from "@/lib/constants";
import type { CourseLanguage, CourseLevel, PurchaseStatus } from "@/types/database";

type CourseDetailRow = {
  id: string;
  title: string;
  description: string;
  language: CourseLanguage;
  level: CourseLevel;
  price: number;
  objectives: string[];
  prerequisites: string[];
  professor: {
    name: string;
    bio: string | null;
    expertise: string | null;
    avatar_url: string | null;
  } | null;
};

type LessonRow = {
  id: string;
  title: string;
  axis_number: number;
  display_order: number;
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; courseId: string }>;
}) {
  const { locale, courseId } = await params;
  setRequestLocale(locale);

  const [t, tCatalog, tCommon] = await Promise.all([
    getTranslations("course"),
    getTranslations("catalog"),
    getTranslations("common"),
  ]);

  const supabase = await createClient();

  // Fetch course with professor info
  const { data: rawCourse } = await supabase
    .from("courses")
    .select(
      "id, title, description, language, level, price, objectives, prerequisites, professor:users!professor_id(name, bio, expertise, avatar_url)"
    )
    .eq("id", courseId)
    .eq("status", "approved")
    .single();

  if (!rawCourse) {
    notFound();
  }

  const course = rawCourse as unknown as CourseDetailRow;

  // Fetch lessons ordered by axis then display order
  const { data: lessonsData } = await supabase
    .from("lessons")
    .select("id, title, axis_number, display_order")
    .eq("course_id", courseId)
    .order("axis_number", { ascending: true })
    .order("display_order", { ascending: true });

  const lessons = (lessonsData ?? []) as LessonRow[];

  // Check purchase status for the logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let purchaseStatus: PurchaseStatus | null = null;
  if (user) {
    const { data: purchase } = (await supabase
      .from("purchases")
      .select("status")
      .eq("student_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle()) as { data: { status: PurchaseStatus } | null; error: unknown };
    purchaseStatus = purchase?.status ?? null;
  }

  const isPurchased = purchaseStatus === "confirmed";
  const professor = Array.isArray(course.professor)
    ? course.professor[0] ?? null
    : course.professor;

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
          {course.objectives.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {t("objectives")}
              </h2>
              <ul className="space-y-2">
                {course.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-primary-600)] shrink-0" />
                    {obj}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Prerequisites */}
          {course.prerequisites.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {t("prerequisites")}
              </h2>
              <ul className="space-y-2">
                {course.prerequisites.map((prereq, i) => (
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

            <PurchaseButton
              courseId={courseId}
              price={course.price}
              purchaseStatus={purchaseStatus}
              isLoggedIn={!!user}
            />

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
