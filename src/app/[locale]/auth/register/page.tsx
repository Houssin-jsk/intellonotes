import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@i18n/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: `${t("registerTitle")} — IntelloNotes` };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <RegisterPageContent />;
}

function RegisterPageContent() {
  const t = useTranslations("auth");

  return (
    <main className="min-h-screen flex relative overflow-hidden isolate">
      {/* Left side: branding/visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 bg-white/70 backdrop-blur-2xl items-center justify-center p-12 border-r border-white/20">

        <div className="relative z-10 w-full max-w-xl glass rounded-[3.5rem] p-12 shadow-2xl border border-black/5 flex flex-col items-center text-center animate-fade-in-up backdrop-blur-3xl bg-white/40">
          <div className="relative w-56 h-56 flex items-center justify-center mb-8 group isolate">
            <div className="absolute inset-0 bg-[var(--color-primary-100)] rounded-full blur-[60px] opacity-50" />
            <Image
              src="/logo.png"
              alt="IntelloNotes Platform"
              width={220}
              height={220}
              className="w-full h-full object-contain relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)] group-hover:scale-105 transition-transform duration-700"
              priority
            />
          </div>

          <h2 className="text-4xl font-extrabold text-slate-900 mb-5 tracking-tight">
            Join IntelloNotes Today.
          </h2>
          <p className="text-slate-600 text-xl font-medium max-w-sm">
            Unlock structured learning, premium content, and advance your skills.
          </p>
        </div>
      </div>

      {/* Right side: Register form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:px-12 py-16 lg:py-12 relative z-10 bg-[var(--color-primary-900)]/85 backdrop-blur-2xl overflow-y-auto">

        <div className="w-full max-w-md relative z-10 animate-fade-in-scale opacity-0 delay-200 my-auto">

          <div className="neumorph rounded-[2rem] p-8 sm:p-10">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
              {t("registerTitle")}
            </h1>
            <p className="text-slate-500 mb-8 text-sm">
              Create your account to start learning.
            </p>
            <RegisterForm />
          </div>
        </div>
      </div>
    </main>
  );
}
