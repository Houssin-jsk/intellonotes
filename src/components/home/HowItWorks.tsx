import { useTranslations } from "next-intl";
import { Search, CreditCard, BookMarked, TrendingUp } from "lucide-react";

const stepIcons = [Search, CreditCard, BookMarked, TrendingUp];
const stepColors = [
  "bg-violet-600",
  "bg-teal-600",
  "bg-amber-500",
  "bg-rose-600",
];

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");

  const steps = [
    { titleKey: "step1Title", descKey: "step1Desc" },
    { titleKey: "step2Title", descKey: "step2Desc" },
    { titleKey: "step3Title", descKey: "step3Desc" },
    { titleKey: "step4Title", descKey: "step4Desc" },
  ] as const;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{t("title")}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{t("subtitle")}</p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ titleKey, descKey }, i) => {
            const Icon = stepIcons[i];
            return (
              <div key={titleKey} className="relative flex flex-col items-center text-center gap-4">
                {/* Connector line (hidden on last item and on small screens) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 start-1/2 w-full h-px bg-gray-200 -z-0" />
                )}
                {/* Step circle */}
                <div
                  className={`relative z-10 inline-flex items-center justify-center w-12 h-12 rounded-full text-white shadow-md ${stepColors[i]}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {/* Text */}
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t(titleKey)}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{t(descKey)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
