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
    <section className="py-32 bg-transparent relative z-10 overflow-hidden">
      {/* Decorative Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[var(--color-primary-200)] rounded-full blur-[100px] opacity-20 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[var(--color-primary-300)] rounded-full blur-[100px] opacity-15 translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in-up">
          <span className="inline-block py-1.5 px-4 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] font-bold text-sm tracking-wide mb-4 border border-[var(--color-primary-200)] shadow-sm">
            Core Values
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">{t("title")}</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">{t("subtitle")}</p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map(({ titleKey, descKey }, i) => {
            const Icon = icons[i];
            return (
              <div
                key={titleKey}
                className="glass rounded-[2rem] p-8 md:p-10 hover:neumorph border border-white/60 transition-all duration-500 group hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] flex flex-col"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-primary-50)] mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:shadow-[0_10px_20px_-10px_rgba(37,99,235,0.4)] border border-white">
                  <Icon className="w-7 h-7 text-[var(--color-primary-600)]" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight group-hover:text-[var(--color-primary-700)] transition-colors">{t(titleKey)}</h3>
                <p className="text-base text-slate-600 leading-relaxed font-medium">{t(descKey)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
