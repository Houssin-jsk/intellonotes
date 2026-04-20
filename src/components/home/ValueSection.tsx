import { useTranslations } from "next-intl";
import { BookOpen, ShieldCheck, Users, BarChart3, Code2 } from "lucide-react";

const icons = [BookOpen, ShieldCheck, Users, BarChart3, Code2];

export function ValueSection() {
  const t = useTranslations("landing.value");

  const items = [
    { titleKey: "item1Title", descKey: "item1Desc" },
    { titleKey: "item2Title", descKey: "item2Desc" },
    { titleKey: "item3Title", descKey: "item3Desc" },
    { titleKey: "item4Title", descKey: "item4Desc" },
    { titleKey: "item5Title", descKey: "item5Desc" },
  ] as const;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{t("title")}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{t("subtitle")}</p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(({ titleKey, descKey }, i) => {
            const Icon = icons[i];
            return (
              <div
                key={titleKey}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[var(--color-primary-50)] mb-4">
                  <Icon className="w-5 h-5 text-[var(--color-primary-600)]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t(titleKey)}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{t(descKey)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
