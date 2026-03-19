import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { LoginPageClient } from "@/components/auth/login-page-client";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo/locale-urls";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const url = getLocalizedUrl(locale, "/login");

  return {
    title: "Log in",
    description: "Log in to your WowTok account.",
    alternates: {
      canonical: url,
      languages: getLanguageAlternates("/login"),
    },
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

export default function LoginPage() {
  return <LoginPageClient />;
}
