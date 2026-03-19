import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PricingCards } from "@/components/landing/pricing-cards";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";
import { getLocale } from "next-intl/server";
import {
  OrganizationJsonLd,
  ProductJsonLd,
  FAQJsonLd,
} from "@/components/shared/json-ld";
import type { Metadata } from "next";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo/locale-urls";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const localeUrl = getLocalizedUrl(locale);

  return {
    alternates: {
      canonical: localeUrl,
      languages: getLanguageAlternates(),
    },
    openGraph: {
      url: localeUrl,
    },
  };
}

export default function Home() {
  return (
    <>
      <OrganizationJsonLd />
      <ProductJsonLd />
      <FAQJsonLd />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <PricingCards />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
