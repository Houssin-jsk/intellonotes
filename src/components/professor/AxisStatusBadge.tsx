"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { Check } from "lucide-react";

interface AxisStatusBadgeProps {
  status: "filled" | "empty";
}

export function AxisStatusBadge({ status }: AxisStatusBadgeProps) {
  const t = useTranslations("professor.courseEditor.axisStatus");

  if (status === "filled") {
    return (
      <Badge className="bg-green-100 text-green-700">
        <Check size={12} className="me-1" />
        {t("filled")}
      </Badge>
    );
  }

  return (
    <Badge className="bg-gray-100 text-gray-500">{t("empty")}</Badge>
  );
}
