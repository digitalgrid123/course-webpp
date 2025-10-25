import React, { use } from "react";
import ClientLayout from "@/components/layouts/ClientLayout";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Cart from "@/components/pages/cart/Cart";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("MyCart");

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    keywords: t("metadata.keywords"),
  };
}

export default function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return (
    <ClientLayout>
      <Cart />
    </ClientLayout>
  );
}
