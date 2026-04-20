import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Noto_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { SessionProvider } from "next-auth/react";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../../i18n/routing";
import { Header } from "@/components/layout/Header";
import { GlobalBackground } from "@/components/ui/AnimatedBackground";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IntelloNotes",
  description: "Cours de programmation pour étudiants marocains",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as "fr" | "ar")) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${notoSansArabic.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-slate-50 text-gray-900 antialiased relative min-h-screen isolate flex flex-col" suppressHydrationWarning>
        <GlobalBackground />
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            <Header />
            <main className="flex-1 w-full relative z-0 flex flex-col">
              {children}
            </main>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
