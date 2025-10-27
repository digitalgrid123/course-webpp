import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";

import ClientLayout from "@/components/layouts/ClientLayout";
import Settings from "@/components/pages/Settings/Settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Settings");

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    keywords: t("metadata.keywords"),
  };
}

export default function Courses({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <ClientLayout>
      <Settings />
    </ClientLayout>
  );
}
