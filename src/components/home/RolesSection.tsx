"use client";

import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";
import { GraduationCap, BookOpen, ShieldCheck } from "lucide-react";

export function RolesSection() {
  const t = useTranslations("landing.roles");

  const roles = [
    {
      icon: GraduationCap,
      titleKey: "studentTitle",
      descKey: "studentDesc",
      ctaKey: "studentCTA",
      href: "/auth/register" as const,
      accentClass: "bg-violet-50 border-violet-200",
      iconClass: "bg-violet-100 text-violet-700",
      ctaClass:
        "border border-[var(--color-primary-600)] text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)]",
    },
    {
      icon: BookOpen,
      titleKey: "professorTitle",
      descKey: "professorDesc",
      ctaKey: "professorCTA",
      href: "/auth/register" as const,
      accentClass: "bg-teal-50 border-teal-200",
      iconClass: "bg-teal-100 text-teal-700",
      ctaClass:
        "border border-[var(--color-secondary-600)] text-[var(--color-secondary-600)] hover:bg-[var(--color-secondary-50)]",
    },
    {
      icon: ShieldCheck,
      titleKey: "adminTitle",
      descKey: "adminDesc",
      ctaKey: "adminCTA",
      href: "/auth/login" as const,
      accentClass: "bg-slate-50 border-slate-200",
      iconClass: "bg-slate-100 text-slate-700",
      ctaClass:
        "border border-slate-500 text-slate-600 hover:bg-slate-50",
    },
  ] as const;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{t("title")}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{t("subtitle")}</p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map(({ icon: Icon, titleKey, descKey, ctaKey, href, accentClass, iconClass, ctaClass }) => (
            <div
              key={titleKey}
              className={`rounded-2xl border p-7 flex flex-col gap-5 ${accentClass}`}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${iconClass}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t(titleKey)}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t(descKey)}</p>
              </div>
              <Link
                href={href}
                className={`inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${ctaClass}`}
              >
                {t(ctaKey)}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
