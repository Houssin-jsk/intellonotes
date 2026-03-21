import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { LANGUAGE_COLORS, LANGUAGE_DISPLAY_NAMES } from "@/lib/constants";
import type { CourseLanguage, CourseLevel } from "@/types/database";

export interface CourseCardData {
  id: string;
  title: string;
  description: string;
  language: CourseLanguage;
  level: CourseLevel;
  price: number;
  professor: { name: string; avatar_url: string | null } | null;
}

export function CourseCard({ course }: { course: CourseCardData }) {
  const t = useTranslations("catalog");

  return (
    <Link href={`/courses/${course.id}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-200 p-5 h-full flex flex-col transition-shadow group-hover:shadow-md">
        {/* Header: language badge + level */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge className={LANGUAGE_COLORS[course.language]}>
            {LANGUAGE_DISPLAY_NAMES[course.language]}
          </Badge>
          <span className="text-xs text-gray-500 shrink-0">
            {t(course.level)}
          </span>
        </div>

        {/* Title + description */}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 leading-snug">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
          {course.description}
        </p>

        {/* Footer: professor + price */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-600 truncate me-2">
            {course.professor?.name ?? "—"}
          </span>
          <span className="font-bold text-[var(--color-primary-600)] shrink-0">
            {course.price} Dh
          </span>
        </div>
      </div>
    </Link>
  );
}
