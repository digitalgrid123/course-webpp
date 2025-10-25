import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import VerifyPage from "@/components/pages/Auth/VerifyPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Verify");

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
  };
}

export default function Verify({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <VerifyPage />;
}
