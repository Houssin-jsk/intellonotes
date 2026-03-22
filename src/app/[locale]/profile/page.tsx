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
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t("title")}</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="space-y-2 text-sm text-gray-600 mb-6">
          <p>
            <span className="font-medium text-gray-700">{t("email")}:</span>{" "}
            {user.email}
          </p>
          <p>
            <span className="font-medium text-gray-700">{t("role")}:</span>{" "}
            {t(`roles.${user.role}`)}
          </p>
          <p>
            <span className="font-medium text-gray-700">{t("memberSince")}:</span>{" "}
            {new Intl.DateTimeFormat(locale, {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(user.created_at))}
          </p>
        </div>

        <ProfileForm
          initialName={user.name}
          initialBio={user.bio ?? ""}
          initialExpertise={user.expertise ?? ""}
          showExpertise={user.role === "professor"}
        />
      </div>
    </main>
  );
}
