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
    <div className="border border-gray-200 rounded-xl divide-y divide-gray-200 overflow-hidden">
      {axisGroups.map(({ axis, lessons: axisLessons }) => {
        const isOpen = openAxis === axis;
        const isLocked = axis > 1 && !isPurchased;
        const isPreview = axis === 1;

        return (
          <div key={axis}>
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-start hover:bg-gray-50 transition-colors"
              onClick={() => setOpenAxis(isOpen ? null : axis)}
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3 min-w-0">
                {isLocked ? (
                  <Lock size={16} className="text-gray-400 shrink-0" />
                ) : (
                  <span className="w-4 h-4 shrink-0 rounded-full border-2 border-[var(--color-primary-600)]" />
                )}
                <span className="font-medium text-gray-900 text-sm truncate">
                  {t("axis", { number: axis })} — {axisNames[axis - 1]}
                </span>
                {isPreview && (
                  <span className="shrink-0 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {t("freePreview")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 ms-3 shrink-0">
                <span className="text-xs text-gray-400">
                  {axisLessons.length} {t("lessonsLabel")}
                </span>
                <ChevronDown
                  size={16}
                  className={cn(
                    "text-gray-400 transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </div>
            </button>

            {isOpen && (
              <div className="bg-gray-50 px-4 pb-3 pt-1">
                {isLocked ? (
                  <p className="text-sm text-gray-500 py-2 flex items-center gap-2">
                    <Lock size={14} className="shrink-0" />
                    {t("lockedAxisMessage")}
                  </p>
                ) : axisLessons.length > 0 ? (
                  <ul className="space-y-1.5">
                    {axisLessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="text-sm text-gray-700 flex items-start gap-2 py-0.5"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                        {lesson.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 py-2 italic">
                    {t("noLessonsYet")}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
