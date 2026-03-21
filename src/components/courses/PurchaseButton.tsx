"use client";

import { useState, useTransition, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "@i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Toast, type ToastData } from "@/components/ui/Toast";
import { usePurchasePolling } from "@/hooks/usePurchasePolling";
import { createPurchase } from "@/lib/actions/purchase";

type PurchaseStatus = "pending" | "confirmed" | "rejected";

interface PurchaseButtonProps {
  courseId: string;
  price: number;
  purchaseStatus: PurchaseStatus | null;
  /** Pass the authenticated user's ID, or null if not logged in. */
  userId: string | null;
  /** Purchase ID for polling (only needed when status is pending). */
  purchaseId?: string | null;
}

export function PurchaseButton({
  courseId,
  price,
  purchaseStatus,
  userId,
  purchaseId = null,
}: PurchaseButtonProps) {
  const t = useTranslations("course");
  const locale = useLocale();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  // Polling — active only when status is pending and we have a purchaseId
  const handleStatusChange = useCallback(
    (status: PurchaseStatus) => {
      if (status === "confirmed") {
        setToast({ message: t("purchaseConfirmed"), variant: "success" });
        router.refresh();
      } else if (status === "rejected") {
        setToast({ message: t("purchaseRejected"), variant: "error" });
        router.refresh();
      }
    },
    [t, router]
  );

  usePurchasePolling(
    purchaseStatus === "pending" ? purchaseId : null,
    handleStatusChange
  );

  function closeModal() {
    setIsModalOpen(false);
    setSubmitted(false);
    setFormError(null);
  }

  const errorMessages: Record<string, string> = {
    alreadyPurchased: t("paymentModal.errors.alreadyPurchased"),
    forbidden: t("paymentModal.errors.forbidden"),
    courseNotFound: t("paymentModal.errors.courseNotFound"),
    generic: t("paymentModal.errors.generic"),
  };

  function handleConfirmPayment() {
    setFormError(null);
    startTransition(async () => {
      const result = await createPurchase(courseId, price, locale);
      if (result.error) {
        setFormError(errorMessages[result.error] ?? errorMessages.generic);
      } else {
        setSubmitted(true);
        router.refresh();
      }
    });
  }

  const isLoggedIn = userId !== null;

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}

      {purchaseStatus === "confirmed" ? (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => router.push(`/courses/${courseId}/learn`)}
        >
          {t("continueLearning")}
        </Button>
      ) : purchaseStatus === "pending" ? (
        <Button variant="secondary" size="lg" className="w-full" disabled>
          {t("paymentPending")}
        </Button>
      ) : !isLoggedIn ? (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => router.push("/auth/login")}
        >
          {t("loginToBuy")}
        </Button>
      ) : (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => setIsModalOpen(true)}
        >
          {t("buyFor", { price })}
        </Button>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={t("paymentModal.title")}
        closeLabel={t("paymentModal.cancel")}
      >
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

            <p className="text-center text-xl font-bold text-gray-900">{price} Dh</p>

            {formError && (
              <p className="text-sm text-red-600 text-center">{formError}</p>
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
