import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { LANGUAGE_COLORS, LANGUAGE_DISPLAY_NAMES } from "@/lib/constants";
import type { CourseLanguage, CourseLevel } from "@/types";
import { Code2, ArrowRight } from "lucide-react";

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
    <Link href={`/courses/${course.id}`} className="group block h-full outline-none">
      <div className="glass-card rounded-[2rem] border-2 border-white/80 p-1 h-full flex flex-col transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(37,99,235,0.2)] hover:-translate-y-2 relative overflow-hidden backdrop-blur-2xl">
        <div className="bg-white/40 h-full rounded-[1.75rem] p-6 lg:p-8 flex flex-col relative z-10 transition-colors duration-500 group-hover:bg-white/60">
          
          {/* Top Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary-200)] rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none" />

          {/* Header: language badge + level */}
          <div className="flex items-center justify-between gap-2 mb-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-primary-600)] bg-[var(--color-primary-50)] px-3 py-1 rounded-full border border-[var(--color-primary-100)]">
              {t(course.level)}
            </span>
            <Badge className={`${LANGUAGE_COLORS[course.language]} shadow-sm`}>
              {LANGUAGE_DISPLAY_NAMES[course.language]}
            </Badge>
          </div>

          {/* Title + description */}
          <h3 className="font-extrabold text-2xl text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-[var(--color-primary-700)] transition-colors">
            {course.title}
          </h3>
          <p className="text-base text-slate-600 font-medium line-clamp-2 flex-1 leading-relaxed mb-8">
            {course.description}
          </p>

          {/* Footer: professor + price */}
          <div className="flex items-center justify-between pt-5 border-t border-slate-200 mt-auto">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary-200)] to-[var(--color-primary-100)] border-2 border-white shadow-sm flex items-center justify-center text-sm font-bold text-[var(--color-primary-700)]">
                  {course.professor?.name?.[0]?.toUpperCase() ?? "P"}
               </div>
               <span className="text-sm font-bold text-slate-700 truncate max-w-[120px]">
                  {course.professor?.name ?? "—"}
               </span>
            </div>
            
            <div className="flex flex-col items-end">
               <span className="font-extrabold text-xl text-[var(--color-primary-600)] shrink-0">
                  {course.price > 0 ? `${course.price} Dh` : "Gratuit"}
               </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
