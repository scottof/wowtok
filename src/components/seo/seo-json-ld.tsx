import { getLocale, getTranslations } from "next-intl/server";
import {
  getCurrencyForLocale,
  getPlanPricing,
  plans,
} from "@/lib/stripe/config";
import { getLocalizedUrl } from "@/lib/seo/locale-urls";

interface SeoSoftwareAppJsonLdProps {
  namespace: string;
  slug: string;
}

export async function SeoSoftwareAppJsonLd({
  namespace,
  slug,
}: SeoSoftwareAppJsonLdProps) {
  const locale = await getLocale();
  const t = await getTranslations(namespace);
  const currency = getCurrencyForLocale(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: t("h1"),
    description: t("metaDescription"),
    url: getLocalizedUrl(locale, `/${slug}`),
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: plans.map((plan) => {
      const pricing = getPlanPricing(plan, currency)!;

      return {
        "@type": "Offer",
        name: plan.name,
        price: String(pricing.price),
        priceCurrency: currency,
        priceValidUntil: "2027-12-31",
        description: plan.features.slice(0, 3).join(", "),
      };
    }),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface SeoFaqJsonLdProps {
  namespace: string;
  faqCount: number;
}

export async function SeoFaqJsonLd({
  namespace,
  faqCount,
}: SeoFaqJsonLdProps) {
  const t = await getTranslations(namespace);

  const faqs = Array.from({ length: faqCount }, (_, i) => ({
    question: t(`faq${i + 1}Q`),
    answer: t(`faq${i + 1}A`),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
