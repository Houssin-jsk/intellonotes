import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "./ProgressBar";
import { LANGUAGE_COLORS, LANGUAGE_DISPLAY_NAMES } from "@/lib/constants";
import type { CourseLanguage } from "@/types";
import { PlayCircle, CheckCircle2 } from "lucide-react";

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
    <div className="glass-card rounded-[2.5rem] border border-white/60 p-1 flex flex-col hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] transition-all duration-500 group relative">
      {/* Decorative pulse background */}
      <div className="absolute inset-x-8 top-0 h-1/2 bg-[var(--color-primary-100)] rounded-full blur-[40px] opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none" />

      <div className="bg-white/50 backdrop-blur-xl h-full rounded-[2.25rem] p-6 sm:p-8 flex flex-col gap-6 relative z-10 border border-white/40">
        {/* Language badge + completion badge */}
        <div className="flex items-start justify-between gap-2">
          <Badge className={`shadow-sm ${LANGUAGE_COLORS[course.language]}`}>
            {LANGUAGE_DISPLAY_NAMES[course.language]}
          </Badge>
          {course.isCompleted && (
            <span className="shrink-0 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              {t("completed")}
            </span>
          )}
        </div>

        {/* Course title */}
        <h3 className="font-extrabold text-slate-900 text-xl md:text-2xl line-clamp-2 leading-tight flex-1 group-hover:text-[var(--color-primary-700)] transition-colors">
          {course.title}
        </h3>

        {/* Progress bar + label */}
        <div className="space-y-3 relative p-4 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-inner">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-[var(--color-primary-600)] uppercase tracking-widest">
              {course.isCompleted
                ? t("completed")
                : t("axis", { current: course.currentAxis, total: 5 })}
            </p>
            {course.lastAccessedLabel && (
              <p className="text-xs text-slate-400 font-medium">{course.lastAccessedLabel}</p>
            )}
          </div>
          <ProgressBar currentAxis={course.currentAxis} isCompleted={course.isCompleted} />
        </div>

        {/* CTA */}
        <div className="pt-2">
           <Link
            href={`/courses/${course.courseId}/learn`}
            className={`flex items-center justify-center gap-2 w-full text-center font-bold text-lg py-4 rounded-[1.25rem] transition-all duration-300 btn-3d shadow-md hover:-translate-y-1 ${course.isCompleted ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-600/30 border-emerald-400' : 'bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-500)] text-white shadow-[var(--color-primary-600)]/30 border-[var(--color-primary-400)]'}`}
          >
            {course.isCompleted ? (
               <><CheckCircle2 className="w-5 h-5"/> {t("reviewCourse")}</>
            ) : (
               <><PlayCircle className="w-5 h-5"/> {t("continueLearning")}</>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
