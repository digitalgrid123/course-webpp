import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["he"],

  // Used when no locale matches
  defaultLocale: "he",
  localeDetection: true,
  //to remove the locale prefix from the url
  localePrefix: "never",
});
