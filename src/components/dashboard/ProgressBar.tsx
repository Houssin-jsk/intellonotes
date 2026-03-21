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
              "h-1.5 flex-1 rounded-full",
              isDone
                ? "bg-green-500"
                : isCurrent
                ? "bg-[var(--color-primary-500)]"
                : "bg-gray-200"
            )}
          />
        );
      })}
    </div>
  );
}
