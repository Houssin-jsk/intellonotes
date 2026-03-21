"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "@i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { createPurchase } from "@/lib/actions/purchase";
import type { PurchaseStatus } from "@/types/database";

interface PurchaseButtonProps {
  courseId: string;
  price: number;
  purchaseStatus: PurchaseStatus | null;
  isLoggedIn: boolean;
}

export function PurchaseButton({
  courseId,
  price,
  purchaseStatus,
  isLoggedIn,
}: PurchaseButtonProps) {
  const t = useTranslations("course");
  const locale = useLocale();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function closeModal() {
    setIsModalOpen(false);
    setSubmitted(false);
    setError(null);
  }

  if (purchaseStatus === "confirmed") {
    return (
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={() => router.push(`/courses/${courseId}/learn`)}
      >
        {t("continueLearning")}
      </Button>
    );
  }

  if (purchaseStatus === "pending") {
    return (
      <Button variant="secondary" size="lg" className="w-full" disabled>
        {t("paymentPending")}
      </Button>
    );
  }

  if (!isLoggedIn) {
    return (
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={() => router.push("/auth/login")}
      >
        {t("loginToBuy")}
      </Button>
    );
  }

  function handleConfirmPayment() {
    setError(null);
    startTransition(async () => {
      const result = await createPurchase(courseId, price, locale);
      if (result.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
      }
    });
  }

  return (
    <>
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={() => setIsModalOpen(true)}
      >
        {t("buyFor", { price })}
      </Button>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={t("paymentModal.title")}>
        {submitted ? (
          <div className="text-center py-4 space-y-4">
            <p className="text-gray-700">{t("paymentModal.confirmMessage")}</p>
            <Button variant="secondary" onClick={closeModal}>
              {t("paymentModal.cancel")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* CashPlus */}
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="font-medium text-orange-900 text-sm mb-1">
                {t("paymentModal.cashplus")}
              </p>
              <p className="text-sm text-orange-700 font-mono">+212 6XX-XXX-XXX</p>
            </div>

            {/* Bank transfer */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-medium text-blue-900 text-sm mb-1">
                {t("paymentModal.bankTransfer")}
              </p>
              <p className="text-sm text-blue-700 font-mono">
                RIB: 000 000 0000000000000000 00
              </p>
            </div>

            <p className="text-center text-xl font-bold text-gray-900">
              {price} Dh
            </p>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={closeModal}
                disabled={isPending}
              >
                {t("paymentModal.cancel")}
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                isLoading={isPending}
                onClick={handleConfirmPayment}
              >
                {t("paymentModal.iHavePaid")}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
