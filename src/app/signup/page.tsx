import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { SignupPageClient } from "@/components/auth/signup-page-client";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo/locale-urls";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const url = getLocalizedUrl(locale, "/signup");

  return {
    title: "Sign up",
    description: "Create your WowTok account.",
    alternates: {
      canonical: url,
      languages: getLanguageAlternates("/signup"),
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

export default function SignupPage() {
  return <SignupPageClient />;
}
