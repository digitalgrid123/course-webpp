import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const res = intlMiddleware(req);

  const isLogged = req.cookies.get("isLogged")?.value === "true";
  const { pathname } = req.nextUrl;

  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/onboarding",
    "/verify",
    "forgot-password",
    "reset-password",
  ];

  if (isLogged && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
