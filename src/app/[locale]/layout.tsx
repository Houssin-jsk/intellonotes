import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Noto_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { SessionProvider } from "next-auth/react";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../../i18n/routing";
import { Header } from "@/components/layout/Header";
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
        {/* Global Premium Animated Background */}
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden isolate bg-slate-50">
          <div 
            className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] min-w-[600px] min-h-[600px] bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-secondary-100)] rounded-full blur-[130px] opacity-60 animate-[pulse_12s_ease-in-out_infinite]" 
            style={{ animationDuration: '12s' }} 
          />
          <div 
            className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vw] min-w-[800px] min-h-[800px] bg-gradient-to-bl from-purple-200 to-[var(--color-primary-200)] rounded-full blur-[150px] opacity-50 animate-[pulse_15s_ease-in-out_infinite]" 
            style={{ animationDuration: '15s', animationDelay: '3s' }} 
          />
          <div 
            className="absolute bottom-[-20%] left-[10%] w-[50vw] h-[50vw] min-w-[600px] min-h-[600px] bg-gradient-to-tr from-[var(--color-secondary-200)] to-[var(--color-primary-100)] rounded-full blur-[140px] opacity-50 animate-[pulse_18s_ease-in-out_infinite]" 
            style={{ animationDuration: '18s', animationDelay: '6s' }} 
          />
        </div>

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
