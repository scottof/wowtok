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
  const title = "AI TikTok Video Generator Pricing";
  const description =
    "Compare WowTok pricing plans for AI TikTok video generation, voiceovers, and automated content creation. Start free and upgrade anytime.";

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: getLanguageAlternates("/pricing"),
    },
    openGraph: {
      title,
      description,
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
