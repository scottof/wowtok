import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { LoginPageClient } from "@/components/auth/login-page-client";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your WowTok account.",
  alternates: {
    canonical: `${siteConfig.url}/login`,
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

export default function LoginPage() {
  return <LoginPageClient />;
}
