import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { PricingCards } from "@/components/landing/pricing-cards";
import { FAQ } from "@/components/landing/faq";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo/locale-urls";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const url = getLocalizedUrl(locale, "/pricing");

  return {
    title: "Pricing",
    description:
      "Simple, transparent pricing for WowTok. Start free, upgrade when you're ready. Cancel anytime.",
    alternates: {
      canonical: url,
      languages: getLanguageAlternates("/pricing"),
    },
    openGraph: {
      title: "Pricing",
      description:
        "Simple, transparent pricing for WowTok. Start free, upgrade when you're ready. Cancel anytime.",
      url,
      type: "website",
    },
  };
}

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Navbar />
      <main className="pt-8">
        <PricingCards isLoggedIn={!!user} />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
