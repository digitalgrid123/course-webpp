import { use } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";

import ClientLayout from "@/components/layouts/ClientLayout";
import InstructorsPage from "@/components/pages/Instructors/InstructorsPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Instructors");

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    keywords: t("metadata.keywords"),
  };
}

export default function Instructors({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <ClientLayout>
      <InstructorsPage />
    </ClientLayout>
  );
}
