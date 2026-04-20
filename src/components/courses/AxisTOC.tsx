"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Lesson {
  id: string;
  title: string;
  axis_number: number;
  display_order: number;
}

interface AxisTOCProps {
  lessons: Lesson[];
  isPurchased: boolean;
}

export function AxisTOC({ lessons, isPurchased }: AxisTOCProps) {
  const t = useTranslations("course");
  const [openAxis, setOpenAxis] = useState<number | null>(1);

  // Pre-resolve axis names to avoid template-literal key issues with next-intl
  const axisNames = [
    t("axisNames.1"),
    t("axisNames.2"),
    t("axisNames.3"),
    t("axisNames.4"),
    t("axisNames.5"),
  ];

  const axisGroups = Array.from({ length: 5 }, (_, i) => {
    const axisNumber = i + 1;
    return {
      axis: axisNumber,
      lessons: lessons.filter((l) => l.axis_number === axisNumber),
    };
  });

  return (
    <div className="space-y-4">
      {axisGroups.map(({ axis, lessons: axisLessons }) => {
        const isOpen = openAxis === axis;
        const isLocked = axis > 1 && !isPurchased;
        const isPreview = axis === 1;

        return (
          <div key={axis} className="glass rounded-2xl border border-white/60 shadow-sm overflow-hidden transition-all duration-300">
            <button
              type="button"
              className="w-full flex items-center justify-between px-6 py-4 text-start hover:bg-white/40 transition-colors"
              onClick={() => setOpenAxis(isOpen ? null : axis)}
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-4 min-w-0">
                {isLocked ? (
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Lock size={14} className="text-slate-400" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-600)] flex items-center justify-center shrink-0 font-bold text-sm">
                    {axis}
                  </div>
                )}
                <span className="font-bold text-slate-800 text-base truncate">
                  {axisNames[axis - 1]}
                </span>
                {isPreview && (
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full shadow-sm">
                    {t("freePreview")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 ms-4 shrink-0">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {axisLessons.length} {t("lessonsLabel")}
                </span>
                <ChevronDown
                  size={18}
                  className={cn(
                    "text-slate-400 transition-transform duration-300",
                    isOpen && "rotate-180"
                  )}
                />
              </div>
            </button>

            <div
              className={cn(
                "transition-all duration-300 ease-in-out px-6 overflow-hidden",
                isOpen ? "max-h-[1000px] pb-5 opacity-100" : "max-h-0 pb-0 opacity-0"
              )}
            >
              <div className="pt-2 border-t border-slate-200/50 mt-2">
                {isLocked ? (
                  <p className="text-sm text-slate-500 py-3 flex items-center gap-2 font-medium bg-slate-50/50 p-4 rounded-xl">
                    <Lock size={16} className="shrink-0" />
                    {t("lockedAxisMessage")}
                  </p>
                ) : axisLessons.length > 0 ? (
                  <ul className="space-y-3 mt-3">
                    {axisLessons.map((lesson, idx) => (
                      <li
                        key={lesson.id}
                        className="text-sm text-slate-700 flex items-start gap-3 py-1 group cursor-default"
                      >
                        <span className="mt-1 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0 group-hover:border-[var(--color-primary-400)] group-hover:text-[var(--color-primary-600)] transition-colors">
                          {idx + 1}
                        </span>
                        <span className="font-medium group-hover:text-slate-900 transition-colors">{lesson.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 py-3 italic bg-slate-50/50 p-4 rounded-xl text-center">
                    {t("noLessonsYet")}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
