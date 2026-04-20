import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/db/queries";
import { ProfileForm } from "@/components/profile/ProfileForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "profile" });
  return { title: t("metaTitle") };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, session] = await Promise.all([
    getTranslations("profile"),
    auth(),
  ]);

  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  const user = getUserById(session.user.id);
  if (!user) redirect(`/${locale}/auth/login`);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{t("title")}</h1>
      </div>

      <div className="glass rounded-[2rem] p-8 sm:p-12 shadow-xl border border-white/60 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary-200)] opacity-20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 border-b border-slate-200/50 pb-8">
          <div className="glass rounded-xl p-5 border border-white/40 shadow-sm flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t("email")}</span>
            <span className="font-extrabold text-slate-900 break-all">{user.email}</span>
          </div>
          <div className="glass rounded-xl p-5 border border-white/40 shadow-sm flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t("role")}</span>
            <span className="font-extrabold text-[var(--color-primary-600)] capitalize">{t(`roles.${user.role}`)}</span>
          </div>
          <div className="glass rounded-xl p-4 border border-white/40 shadow-sm flex flex-col justify-center sm:col-span-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t("memberSince")}</span>
            <span className="font-bold text-slate-700">
              {new Intl.DateTimeFormat(locale, {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(new Date(user.created_at))}
            </span>
          </div>
        </div>

        <div className="relative z-10">
          <ProfileForm
            initialName={user.name}
            initialBio={user.bio ?? ""}
            initialExpertise={user.expertise ?? ""}
            showExpertise={user.role === "professor"}
          />
        </div>
      </div>
    </main>
  );
}
