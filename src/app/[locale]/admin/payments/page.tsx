import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { getPendingPurchases } from "@/lib/db/queries";
import { PaymentQueue } from "@/components/admin/PaymentQueue";
import type { PurchaseItem } from "@/components/admin/PaymentConfirmCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin.payments" });
  return { title: t("title") };
}

export default async function AdminPaymentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "admin.payments" });

  const rows = getPendingPurchases();

  const purchases: PurchaseItem[] = rows
    .filter((p) => p.student !== null && p.course !== null)
    .map((p) => ({
      id: p.id,
      amount_paid: p.amount_paid,
      purchased_at: p.purchased_at,
      student_name: p.student!.name,
      student_email: p.student!.email ?? "",
      course_title: p.course!.title,
      course_language: p.course!.language,
    }));

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        {purchases.length > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            {purchases.length} {t("pending").toLowerCase()}
          </p>
        )}
      </div>

      <PaymentQueue purchases={purchases} />
    </main>
  );
}
