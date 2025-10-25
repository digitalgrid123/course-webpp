import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import OnboardingPage from "@/components/pages/boarding/OnboardingPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Onboarding");

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    keywords: t("metadata.keywords"),
  };
}

export default function OnBoarding({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <OnboardingPage />;
}
