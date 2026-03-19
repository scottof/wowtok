import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { SignupPageClient } from "@/components/auth/signup-page-client";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your WowTok account.",
  alternates: {
    canonical: `${siteConfig.url}/signup`,
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

export default function SignupPage() {
  return <SignupPageClient />;
}
