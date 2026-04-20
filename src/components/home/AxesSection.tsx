import { useTranslations } from "next-intl";

const axisColors = [
  "bg-violet-50 text-violet-800 border-violet-200 shadow-violet-500/20",
  "bg-blue-50 text-blue-800 border-blue-200 shadow-blue-500/20",
  "bg-teal-50 text-teal-800 border-teal-200 shadow-teal-500/20",
  "bg-amber-50 text-amber-800 border-amber-200 shadow-amber-500/20",
  "bg-rose-50 text-rose-800 border-rose-200 shadow-rose-500/20",
];

const axisBadgeBg = [
  "bg-violet-600 shadow-violet-600/50",
  "bg-blue-600 shadow-blue-600/50",
  "bg-teal-600 shadow-teal-600/50",
  "bg-amber-500 shadow-amber-500/50",
  "bg-rose-600 shadow-rose-600/50",
];

export function AxesSection() {
  const t = useTranslations("landing.axes");

  const axes = [
    { nameKey: "axis1Name", descKey: "axis1Desc" },
    { nameKey: "axis2Name", descKey: "axis2Desc" },
    { nameKey: "axis3Name", descKey: "axis3Desc" },
    { nameKey: "axis4Name", descKey: "axis4Desc" },
    { nameKey: "axis5Name", descKey: "axis5Desc" },
  ] as const;

  return (
    <section className="py-24 relative bg-[var(--background)] overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary-200)] to-transparent opacity-50" />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <span className="inline-block py-1.5 px-4 rounded-full glass-dark text-white font-bold text-sm tracking-wide mb-4 shadow-sm">
            Curriculum Flow
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">{t("title")}</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">{t("subtitle")}</p>
        </div>

        {/* Axes row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 xl:gap-8 relative">
          {/* Connecting line behind cards (visible on lg screens) */}
          <div className="hidden lg:block absolute top-[45px] left-[10%] right-[10%] h-1 bg-[var(--color-primary-100)] rounded-full -z-10" />

          {axes.map(({ nameKey, descKey }, i) => (
            <div
              key={nameKey}
              className={`glass rounded-[2rem] p-6 lg:p-8 flex flex-col gap-5 border border-white/80 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] relative overflow-hidden group ${axisColors[i]}`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

              {/* Badge */}
              <div className="flex items-center gap-3 relative z-10">
                <span
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-[1.25rem] text-white text-lg font-extrabold shadow-lg ${axisBadgeBg[i]} transition-transform duration-300 group-hover:rotate-12`}
                >
                  {i + 1}
                </span>
                <span className="text-sm font-bold opacity-80 uppercase tracking-widest bg-white/50 px-2 py-0.5 rounded-md">
                  {t("badge", { number: i + 1 })}
                </span>
              </div>

              <div className="relative z-10 mt-2">
                <h3 className="font-extrabold text-xl leading-tight mb-2 tracking-tight group-hover:text-slate-900 transition-colors">{t(nameKey)}</h3>
                <p className="text-sm font-medium leading-relaxed opacity-80">{t(descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
