import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getProfessorEarnings,
  getProfessorTransactions,
  getProfessorWithdrawals,
} from "@/lib/db/queries";
import { MIN_WITHDRAWAL_AMOUNT } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "professor.earnings" });
  return { title: t("metaTitle") };
}

export default async function ProfessorEarningsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, session] = await Promise.all([
    getTranslations("professor.earnings"),
    auth(),
  ]);

  if (!session?.user || session.user.role !== "professor") {
    redirect(`/${locale}/auth/login`);
  }

  const earnings = getProfessorEarnings(session.user.id);
  const transactions = getProfessorTransactions(session.user.id);
  const withdrawalHistory = getProfessorWithdrawals(session.user.id);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t("title")}</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
            {t("totalEarned")}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {earnings.totalEarned.toFixed(2)} Dh
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
            {t("availableBalance")}
          </p>
          <p className="text-2xl font-bold text-green-600">
            {earnings.availableBalance.toFixed(2)} Dh
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
            {t("pendingWithdrawals")}
          </p>
          <p className="text-2xl font-bold text-amber-600">
            {earnings.pendingWithdrawals.toFixed(2)} Dh
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
            {t("totalWithdrawn")}
          </p>
          <p className="text-2xl font-bold text-gray-500">
            {earnings.totalWithdrawn.toFixed(2)} Dh
          </p>
        </div>
      </div>

      {/* Commission info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-10">
        <p className="text-sm text-purple-700">
          {t("commissionInfo")}
        </p>
        <p className="text-xs text-purple-500 mt-1">
          {t("minWithdrawal", { amount: MIN_WITHDRAWAL_AMOUNT })}
        </p>
      </div>

      {/* Transaction history */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("transactionHistory")}</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">{t("noTransactions")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-start">
                  <th className="py-3 pe-4 text-start font-semibold text-gray-500">{t("date")}</th>
                  <th className="py-3 pe-4 text-start font-semibold text-gray-500">{t("course")}</th>
                  <th className="py-3 pe-4 text-start font-semibold text-gray-500">{t("student")}</th>
                  <th className="py-3 pe-4 text-end font-semibold text-gray-500">{t("amount")}</th>
                  <th className="py-3 text-end font-semibold text-gray-500">{t("yourCommission")}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-100">
                    <td className="py-3 pe-4 text-gray-600">
                      {new Intl.DateTimeFormat(locale, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(tx.purchased_at))}
                    </td>
                    <td className="py-3 pe-4 text-gray-900 font-medium">{tx.course_title}</td>
                    <td className="py-3 pe-4 text-gray-600">{tx.student_name}</td>
                    <td className="py-3 pe-4 text-end text-gray-600">{tx.amount_paid} Dh</td>
                    <td className="py-3 text-end font-semibold text-green-600">
                      +{tx.professor_commission} Dh
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Withdrawal history */}
      {withdrawalHistory.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("withdrawalHistory")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-start">
                  <th className="py-3 pe-4 text-start font-semibold text-gray-500">{t("date")}</th>
                  <th className="py-3 pe-4 text-end font-semibold text-gray-500">{t("amount")}</th>
                  <th className="py-3 text-end font-semibold text-gray-500">{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {withdrawalHistory.map((w) => (
                  <tr key={w.id} className="border-b border-gray-100">
                    <td className="py-3 pe-4 text-gray-600">
                      {new Intl.DateTimeFormat(locale, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(w.requested_at))}
                    </td>
                    <td className="py-3 pe-4 text-end text-gray-900 font-medium">{w.amount} Dh</td>
                    <td className="py-3 text-end">
                      <span
                        className={
                          w.status === "processed"
                            ? "text-green-600 font-medium"
                            : w.status === "pending"
                              ? "text-amber-600 font-medium"
                              : "text-red-600 font-medium"
                        }
                      >
                        {t(`withdrawalStatus.${w.status}`)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
