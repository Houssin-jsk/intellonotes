"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LANGUAGE_COLORS, LANGUAGE_DISPLAY_NAMES } from "@/lib/constants";
import { confirmPurchase, rejectPurchase } from "@/lib/actions/admin";
import type { CourseLanguage } from "@/types";

export interface PurchaseItem {
  id: string;
  amount_paid: number;
  purchased_at: string;
  student_name: string;
  student_email: string;
  course_title: string;
  course_language: CourseLanguage;
}

export function PaymentConfirmCard({ purchase }: { purchase: PurchaseItem }) {
  const t = useTranslations("admin.payments");
  const locale = useLocale();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const isProcessing = isConfirming || isRejecting;

  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(purchase.purchased_at));

  async function handleConfirm() {
    setIsConfirming(true);
    await confirmPurchase(purchase.id, locale);
    setIsConfirming(false);
  }

  async function handleReject() {
    setIsRejecting(true);
    await rejectPurchase(purchase.id, locale);
    setIsRejecting(false);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
      {/* Course title + language badge */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 flex-1">
          {purchase.course_title}
        </h3>
        <Badge className={LANGUAGE_COLORS[purchase.course_language]}>
          {LANGUAGE_DISPLAY_NAMES[purchase.course_language]}
        </Badge>
      </div>

      {/* Student info */}
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-gray-800">{purchase.student_name}</p>
        <p className="text-xs text-gray-500">{purchase.student_email}</p>
      </div>

      {/* Amount + date */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-gray-900">{purchase.amount_paid} Dh</span>
        <span className="text-gray-400 text-xs">{formattedDate}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          isLoading={isConfirming}
          disabled={isProcessing}
          onClick={handleConfirm}
        >
          {t("confirm")}
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="flex-1"
          isLoading={isRejecting}
          disabled={isProcessing}
          onClick={handleReject}
        >
          {t("reject")}
        </Button>
      </div>
    </div>
  );
}
