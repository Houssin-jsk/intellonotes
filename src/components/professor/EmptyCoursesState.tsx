"use client";

import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";
import { Button } from "@/components/ui/Button";
import { BookOpen } from "lucide-react";

export function EmptyCoursesState() {
  const t = useTranslations("professor.courses");

  return (
    <div className="glass rounded-[2rem] p-12 text-center shadow-lg border border-white/60 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary-200)] opacity-20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="w-24 h-24 mx-auto bg-slate-50 rounded-[2rem] shadow-inner border border-slate-100 flex items-center justify-center mb-6 relative z-10">
        <BookOpen className="w-10 h-10 text-slate-300" />
      </div>
      <p className="text-slate-900 text-xl font-extrabold mb-2 relative z-10">{t("empty")}</p>
      <p className="text-slate-500 font-medium mb-8 relative z-10">{t("emptyHint")}</p>
      <Link href="/professor/courses/new" className="relative z-10">
        <Button className="px-8 py-3.5 rounded-xl font-bold hover:scale-105 transition-transform shadow-xl btn-3d">{t("createFirst")}</Button>
      </Link>
    </div>
  );
}
