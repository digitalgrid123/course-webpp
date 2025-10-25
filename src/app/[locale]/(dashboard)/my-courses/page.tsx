import React, { use } from "react";
import ClientLayout from "@/components/layouts/ClientLayout";
import MyCourses from "@/components/pages/my-courses/MyCourses";
import { setRequestLocale, getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("MyCourses");

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    keywords: t("metadata.keywords"),
  };
}

export default function MyLearningPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return (
    <ClientLayout>
      <MyCourses />
    </ClientLayout>
  );
}
