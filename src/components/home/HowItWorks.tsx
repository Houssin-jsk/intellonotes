import { useTranslations } from "next-intl";
import { Search, CreditCard, BookMarked, TrendingUp } from "lucide-react";

const stepIcons = [Search, CreditCard, BookMarked, TrendingUp];
const stepColors = [
  "bg-gradient-to-br from-violet-500 to-violet-700 shadow-[0_10px_20px_-10px_rgba(139,92,246,0.5)]",
  "bg-gradient-to-br from-teal-400 to-teal-600 shadow-[0_10px_20px_-10px_rgba(20,184,166,0.5)]",
  "bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_10px_20px_-10px_rgba(245,158,11,0.5)]",
  "bg-gradient-to-br from-rose-500 to-rose-700 shadow-[0_10px_20px_-10px_rgba(225,29,72,0.5)]",
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
    <section className="py-32 bg-[var(--color-primary-50)] relative z-10 overflow-hidden">
      <div className="absolute inset-0 bg-white/40 mix-blend-overlay backdrop-blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-24 animate-fade-in-up">
           <span className="inline-block py-1.5 px-4 rounded-full bg-white text-[var(--color-primary-700)] font-bold text-sm tracking-wide mb-4 shadow-sm border border-white/60">
            Simple Process
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">{t("title")}</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">{t("subtitle")}</p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 lg:gap-y-8 pt-8">
          {steps.map(({ titleKey, descKey }, i) => {
            const Icon = stepIcons[i];
            return (
              <div 
                key={titleKey} 
                className="relative flex flex-col items-center text-center gap-5 p-8 glass-card rounded-[2.5rem] border-white/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl group"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {/* Step circle */}
                <div
                  className={`absolute -top-10 left-1/2 -translate-x-1/2 flex items-center justify-center w-20 h-20 rounded-[1.75rem] text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${stepColors[i]} border-4 border-white`}
                >
                  <Icon className="w-8 h-8" />
                </div>
                
                {/* Text */}
                <div className="mt-8 flex flex-col items-center">
                  <div className="text-sm font-extrabold text-[var(--color-primary-600)] uppercase tracking-widest mb-3 bg-[var(--color-primary-100)] px-3 py-1 rounded-full">
                    Step {i + 1}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{t(titleKey)}</h3>
                  <p className="text-base text-slate-600 leading-relaxed font-medium">{t(descKey)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
