"use client";

import { useTranslations } from "next-intl";
import { CheckCircle, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { AXIS_LABELS } from "@/lib/constants";

interface AxisStatus {
  axisNumber: number;
  lessonCount: number;
  isCompleted: boolean; // quiz passed
  isCurrent: boolean;   // currently selected
  isUnlocked: boolean;  // can be accessed
}

interface ProgressSidebarProps {
  axes: AxisStatus[];
  onSelectAxis: (axis: number) => void;
  /** Render as a horizontal strip for mobile */
  mobile?: boolean;
}

export function ProgressSidebar({
  axes,
  onSelectAxis,
  mobile = false,
}: ProgressSidebarProps) {
  const t = useTranslations("course");

  if (mobile) {
    return (
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {axes.map((axis) => (
          <MobileAxisButton
            key={axis.axisNumber}
            axis={axis}
            onSelect={onSelectAxis}
            t={t}
          />
        ))}
      </div>
    );
  }

  return (
    <nav className="space-y-1">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {t("tableOfContents")}
      </p>
      {axes.map((axis) => (
        <AxisItem key={axis.axisNumber} axis={axis} onSelect={onSelectAxis} t={t} />
      ))}
    </nav>
  );
}

function AxisItem({
  axis,
  onSelect,
  t,
}: {
  axis: AxisStatus;
  onSelect: (n: number) => void;
  t: ReturnType<typeof useTranslations<"course">>;
}) {
  const { axisNumber, isCompleted, isCurrent, isUnlocked, lessonCount } = axis;

  return (
    <button
      type="button"
      disabled={!isUnlocked}
      onClick={() => onSelect(axisNumber)}
      className={cn(
        "w-full text-start flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
        isUnlocked ? "hover:bg-gray-100 cursor-pointer" : "cursor-not-allowed opacity-50",
        isCurrent && "bg-purple-50 text-[var(--color-primary-600)]"
      )}
    >
      {/* Status icon */}
      <span className="mt-0.5 shrink-0">
        {isCompleted ? (
          <CheckCircle size={16} className="text-green-500" />
        ) : isUnlocked ? (
          <Circle size={16} className={isCurrent ? "text-[var(--color-primary-600)]" : "text-gray-400"} />
        ) : (
          <Lock size={16} className="text-gray-300" />
        )}
      </span>

      <div className="min-w-0">
        <p className={cn("font-medium leading-tight", isCurrent ? "text-[var(--color-primary-600)]" : "text-gray-800")}>
          {t("axis", { number: axisNumber })} — {AXIS_LABELS[axisNumber]}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {lessonCount} {t("lessonsLabel")}
        </p>
      </div>
    </button>
  );
}

function MobileAxisButton({
  axis,
  onSelect,
  t,
}: {
  axis: AxisStatus;
  onSelect: (n: number) => void;
  t: ReturnType<typeof useTranslations<"course">>;
}) {
  const { axisNumber, isCompleted, isCurrent, isUnlocked } = axis;

  return (
    <button
      type="button"
      disabled={!isUnlocked}
      onClick={() => onSelect(axisNumber)}
      className={cn(
        "shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs font-medium transition-colors",
        isCurrent
          ? "border-[var(--color-primary-600)] bg-purple-50 text-[var(--color-primary-600)]"
          : isUnlocked
          ? "border-gray-200 text-gray-600 hover:border-gray-300"
          : "border-gray-100 text-gray-300 cursor-not-allowed"
      )}
    >
      {isCompleted ? (
        <CheckCircle size={14} className="text-green-500" />
      ) : isUnlocked ? (
        <Circle size={14} />
      ) : (
        <Lock size={14} />
      )}
      <span>{t("axis", { number: axisNumber })}</span>
    </button>
  );
}
