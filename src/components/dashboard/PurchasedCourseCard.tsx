import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "./ProgressBar";
import { LANGUAGE_COLORS, LANGUAGE_DISPLAY_NAMES } from "@/lib/constants";
import type { CourseLanguage } from "@/types/database";

export interface PurchasedCourse {
  courseId: string;
  title: string;
  language: CourseLanguage;
  currentAxis: number;
  isCompleted: boolean;
  lastAccessedLabel?: string;
}

export function PurchasedCourseCard({ course }: { course: PurchasedCourse }) {
  const t = useTranslations("dashboard");

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Language badge + completion badge */}
      <div className="flex items-start justify-between gap-2">
        <Badge className={LANGUAGE_COLORS[course.language]}>
          {LANGUAGE_DISPLAY_NAMES[course.language]}
        </Badge>
        {course.isCompleted && (
          <span className="shrink-0 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            {t("completed")}
          </span>
        )}
      </div>

      {/* Course title */}
      <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug flex-1">
        {course.title}
      </h3>

      {/* Progress bar + label */}
      <div className="space-y-1.5">
        <ProgressBar currentAxis={course.currentAxis} isCompleted={course.isCompleted} />
        <p className="text-xs text-gray-500">
          {course.isCompleted
            ? t("completed")
            : t("axis", { current: course.currentAxis, total: 5 })}
        </p>
        {course.lastAccessedLabel && (
          <p className="text-xs text-gray-400">{course.lastAccessedLabel}</p>
        )}
      </div>

      {/* CTA */}
      <Link
        href={`/courses/${course.courseId}/learn`}
        className="block text-center text-sm font-medium bg-[var(--color-primary-600)] text-white py-2 rounded-lg hover:bg-[var(--color-primary-700)] transition-colors"
      >
        {course.isCompleted ? t("reviewCourse") : t("continueLearning")}
      </Link>
    </div>
  );
}
