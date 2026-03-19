import { siteConfig } from "@/config/site";
import { defaultLocale, locales } from "@/i18n/config";

type QueryValue = string | number | boolean | null | undefined;

function normalizePath(path: string) {
  const pathname = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  return pathname !== "/" && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}

function toSearchParams(query?: Record<string, QueryValue>) {
  const searchParams = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : "";
}

export function getLocalizedPath(
  locale: string,
  path = "/",
  query?: Record<string, QueryValue>
) {
  const pathname = normalizePath(path);
  const localizedPath = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return `${localizedPath}${toSearchParams(query)}`;
}

export function getLocalizedUrl(
  locale: string,
  path = "/",
  query?: Record<string, QueryValue>
) {
  return `${siteConfig.url}${getLocalizedPath(locale, path, query)}`;
}

export function getLanguageAlternates(
  path = "/",
  query?: Record<string, QueryValue>
) {
  return {
    ...Object.fromEntries(
      locales.map((locale) => [locale, getLocalizedUrl(locale, path, query)])
    ),
    "x-default": getLocalizedUrl(defaultLocale, path, query),
  };
}
