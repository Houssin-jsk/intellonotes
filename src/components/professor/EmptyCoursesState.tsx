"use client";

import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";
import { Button } from "@/components/ui/Button";
import { BookOpen } from "lucide-react";

export function EmptyCoursesState() {
  const t = useTranslations("professor.courses");

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <BookOpen className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-gray-900 font-medium mb-1">{t("empty")}</p>
      <p className="text-sm text-gray-500 mb-6">{t("emptyHint")}</p>
      <Link href="/professor/courses/new">
        <Button>{t("createFirst")}</Button>
      </Link>
    </div>
  );
}
