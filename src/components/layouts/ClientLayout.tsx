"use client";

import { Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "../common/Sidebar/Sidebar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const getActiveItem = () => {
    if (pathname.includes("/dashboard")) return "dashboard";
    if (pathname.includes("/my-courses")) return "myCourses";
    if (pathname.includes("/cart")) return "cart";
    if (pathname.includes("/settings")) return "settings";
    return "dashboard";
  };

  const handleNavigate = (itemId: string) => {
    const routes: Record<string, string> = {
      dashboard: "/dashboard",
      myCourses: "/my-courses",
      cart: "/cart",
      settings: "/settings",
    };

    if (routes[itemId]) {
      router.push(routes[itemId]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      <Sidebar activeItem={getActiveItem()} onItemClick={handleNavigate} />
      <main className="flex-1 lg:mr-0 overflow-auto h-full">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </main>
    </div>
  );
}
