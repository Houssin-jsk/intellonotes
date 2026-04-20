import { cn } from "@/lib/utils/cn";
import { AXIS_COUNT } from "@/lib/constants";

interface ProgressBarProps {
  currentAxis: number;  // 1–5: highest unlocked axis
  isCompleted: boolean;
}

export function ProgressBar({ currentAxis, isCompleted }: ProgressBarProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: AXIS_COUNT }, (_, i) => {
        const n = i + 1;
        const isDone = isCompleted || n < currentAxis;
        const isCurrent = !isCompleted && n === currentAxis;
        return (
          <div
            key={n}
            className={cn(
              "h-2 flex-1 rounded-full shadow-inner transition-colors",
              isDone
                ? "bg-emerald-400"
                : isCurrent
                ? "bg-[var(--color-primary-400)]"
                : "bg-slate-100"
            )}
          />
        );
      })}
    </div>
  );
}
