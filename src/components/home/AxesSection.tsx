import { useTranslations } from "next-intl";

const axisColors = [
  "bg-violet-50 text-violet-700 border-violet-200",
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-teal-50 text-teal-700 border-teal-200",
  "bg-amber-50 text-amber-700 border-amber-200",
  "bg-rose-50 text-rose-700 border-rose-200",
];

const axisBadgeBg = [
  "bg-violet-600",
  "bg-blue-600",
  "bg-teal-600",
  "bg-amber-500",
  "bg-rose-600",
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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{t("title")}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{t("subtitle")}</p>
        </div>

        {/* Axes row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {axes.map(({ nameKey, descKey }, i) => (
            <div
              key={nameKey}
              className={`rounded-2xl border p-5 flex flex-col gap-3 ${axisColors[i]}`}
            >
              {/* Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold ${axisBadgeBg[i]}`}
                >
                  {i + 1}
                </span>
                <span className="text-xs font-semibold opacity-70 uppercase tracking-wide">
                  {t("badge", { number: i + 1 })}
                </span>
              </div>
              {/* Axis name */}
              <h3 className="font-semibold text-sm leading-snug">{t(nameKey)}</h3>
              {/* Description */}
              <p className="text-xs leading-relaxed opacity-80">{t(descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
