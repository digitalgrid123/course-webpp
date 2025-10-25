import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import LoginPage from "@/components/pages/Auth/LoginPage";

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  // Enable static rendering
  setRequestLocale(locale);

  return <LoginPage />;
}
