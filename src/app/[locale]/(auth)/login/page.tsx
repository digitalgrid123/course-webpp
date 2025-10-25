import { setRequestLocale, getTranslations } from "next-intl/server";
import { use } from "react";
import LoginPage from "@/components/pages/Auth/LoginPage";

// generateMetadata also receives params as a Promise in Next.js 15
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Login");
  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    keywords: t("metadata.keywords"),
  };
}

// The page component receives params as a Promise
export default function Login({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <LoginPage />;
}
