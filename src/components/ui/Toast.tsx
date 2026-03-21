"use client";

import { useEffect, useRef } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ToastData {
  message: string;
  variant: "success" | "error";
}

interface ToastProps extends ToastData {
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, variant, onDismiss, duration = 6000 }: ToastProps) {
  // Store onDismiss in a ref so the timer is not reset when the parent
  // re-renders (e.g. after router.refresh()), which would create a new
  // arrow function reference on every render.
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    const timer = setTimeout(() => onDismissRef.current(), duration);
    return () => clearTimeout(timer);
  }, [duration]); // intentionally excludes onDismiss — handled via ref

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed top-4 end-4 z-50 flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg max-w-sm w-full",
        variant === "success"
          ? "bg-green-50 border border-green-200 text-green-800"
          : "bg-red-50 border border-red-200 text-red-800"
      )}
    >
      {variant === "success" ? (
        <CheckCircle size={18} className="shrink-0 text-green-600 mt-0.5" />
      ) : (
        <XCircle size={18} className="shrink-0 text-red-600 mt-0.5" />
      )}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
