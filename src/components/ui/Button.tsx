"use client";

import { cn } from "@/lib/utils/cn";
import { type ButtonHTMLAttributes } from "react";
import { Spinner } from "./Spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variants = {
  primary: "bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-500)] text-white hover:from-[var(--color-primary-700)] hover:to-[var(--color-primary-600)] btn-3d border border-white/10",
  secondary: "neumorph text-gray-700 hover:text-[var(--color-primary-600)] transition-all active:neumorph-inner",
  ghost: "text-gray-600 hover:bg-gray-100/50 hover:glass transition-all",
  danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border border-white/10 shadow-[0_4px_0_0_#991b1b] active:shadow-none active:translate-y-[4px]",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)] focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" className="me-2" />}
      <span className="flex items-center gap-2 relative z-10">{children}</span>
    </button>
  );
}
