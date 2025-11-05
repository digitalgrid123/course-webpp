import ResetPasswordPage from "@/components/pages/Auth/ResetPasswordPage";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { use } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ResetPassword");
  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    keywords: t("metadata.keywords"),
  };
}

export default function ResetPassword({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <ResetPasswordPage />;
}
