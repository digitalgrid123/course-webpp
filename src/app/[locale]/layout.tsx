import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getMessages, setRequestLocale } from "next-intl/server";

import "../globals.css";
import ReduxProvider from "@/providers/ReduxProvider";

import ToastProvider from "@/providers/ToastProvider";

const locales = ["en", "he"] as const;
type Locale = (typeof locales)[number];

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} dir="rtl">
      <body>
        <ReduxProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
            <ToastProvider />
          </NextIntlClientProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
