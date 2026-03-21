"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PaymentConfirmCard } from "./PaymentConfirmCard";
import type { PurchaseItem } from "./PaymentConfirmCard";

export function PaymentQueue({ purchases }: { purchases: PurchaseItem[] }) {
  const t = useTranslations("admin.payments");
  const router = useRouter();

  // Poll every 10 seconds for new pending purchases
  useEffect(() => {
    const POLL_INTERVAL_MS = 10_000;
    const id = setInterval(() => router.refresh(), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [router]);

  if (purchases.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-sm">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {purchases.map((purchase) => (
        <PaymentConfirmCard key={purchase.id} purchase={purchase} />
      ))}
    </div>
  );
}
