import { cn } from "@/lib/utils/cn";
import { type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  id,
  className,
  rows = 4,
  ...props
}: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={cn(
          "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white resize-y",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "placeholder:text-gray-400",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
