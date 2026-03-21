import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@i18n/navigation";
import { CourseForm } from "@/components/professor/CourseForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "professor.meta" });
  return { title: t("createTitle") };
}

export default async function NewCoursePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tCommon] = await Promise.all([
    getTranslations("professor.courseForm"),
    getTranslations("common"),
  ]);

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/professor/courses"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← {tCommon("back")}
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t("createTitle")}</h1>

      <CourseForm />
    </main>
  );
}
