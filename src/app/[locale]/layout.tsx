import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getMessages, setRequestLocale } from "next-intl/server";

import { Courgette } from "next/font/google";
import "../globals.css";
import ReduxProvider from "@/providers/ReduxProvider";

import ToastProvider from "@/providers/ToastProvider";

// Load the font using next/font/google
const courgette = Courgette({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-courgette", // Optional: create a CSS variable
});

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
      <body className={`antialiased ${courgette.variable}`}>
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
