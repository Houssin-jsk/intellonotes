"use client";

import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";
import { GraduationCap, BookOpen, ChevronRight } from "lucide-react";

export function RolesSection() {
  const t = useTranslations("landing.roles");

  const roles = [
    {
      icon: GraduationCap,
      titleKey: "studentTitle",
      descKey: "studentDesc",
      ctaKey: "studentCTA",
      href: "/auth/register" as const,
      accentColor: "var(--color-primary-500)",
      bgGradient: "from-[var(--color-primary-50)] to-white",
      iconClass: "bg-[var(--color-primary-100)] text-[var(--color-primary-600)] shadow-[0_0_20px_rgba(37,99,235,0.2)]",
      ctaClass: "bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-lg shadow-[var(--color-primary-600)]/30",
    },
    {
      icon: BookOpen,
      titleKey: "professorTitle",
      descKey: "professorDesc",
      ctaKey: "professorCTA",
      href: "/auth/register" as const,
      accentColor: "var(--color-secondary-500)",
      bgGradient: "from-[var(--color-secondary-50)] to-white",
      iconClass: "bg-[var(--color-secondary-100)] text-[var(--color-secondary-600)] shadow-[0_0_20px_rgba(15,118,110,0.2)]",
      ctaClass: "bg-[var(--color-secondary-600)] text-white hover:bg-[var(--color-secondary-700)] shadow-lg shadow-[var(--color-secondary-600)]/30",
    },
  ] as const;

  return (
    <section className="py-24 relative overflow-hidden bg-transparent">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-primary-50)]/30 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <span className="inline-block py-1.5 px-4 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] font-bold text-sm tracking-wide mb-4 border border-[var(--color-primary-200)] shadow-sm">
            {t("subtitle")}
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            {t("title")}
          </h2>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch max-w-5xl mx-auto w-full">
          {roles.map(({ icon: Icon, titleKey, descKey, ctaKey, href, bgGradient, iconClass, ctaClass }, index) => (
            <div
              key={titleKey}
              className={`relative rounded-[2.5rem] bg-gradient-to-br ${bgGradient} p-8 md:p-10 flex flex-col gap-6 border-2 border-white/60 neumorph transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] group overflow-hidden w-full`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Decorative background circle */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white rounded-full blur-[40px] opacity-60 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
              
              <div className={`relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-2xl ${iconClass} transition-transform duration-300 group-hover:scale-110 mb-2`}>
                <Icon className="w-8 h-8" />
              </div>
              
              <div className="flex-1 relative z-10">
                <h3 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">{t(titleKey)}</h3>
                <p className="text-base text-slate-600 leading-relaxed font-medium">{t(descKey)}</p>
              </div>
              
              <div className="pt-4 mt-auto relative z-10">
                <Link
                  href={href}
                  className={`inline-flex w-full sm:w-auto items-center justify-center px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300 gap-2 ${ctaClass} hover:gap-4`}
                >
                  {t(ctaKey)}
                  <ChevronRight className="w-5 h-5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
