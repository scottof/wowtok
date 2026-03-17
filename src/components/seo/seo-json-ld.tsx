import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";

interface SeoSoftwareAppJsonLdProps {
  namespace: string;
  slug: string;
}

export async function SeoSoftwareAppJsonLd({
  namespace,
  slug,
}: SeoSoftwareAppJsonLdProps) {
  const t = await getTranslations(namespace);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: t("h1"),
    description: t("metaDescription"),
    url: `${siteConfig.url}/${slug}`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: [
      {
        "@type": "Offer",
        name: "Starter",
        price: "29",
        priceCurrency: "USD",
        priceValidUntil: "2027-12-31",
        description: "3 AI videos per month, 3 standard AI voices, 720p output",
      },
      {
        "@type": "Offer",
        name: "Creator",
        price: "59",
        priceCurrency: "USD",
        priceValidUntil: "2027-12-31",
        description:
          "10 AI videos per month, 10+ premium AI voices, 1080p output, no watermark",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "149",
        priceCurrency: "USD",
        priceValidUntil: "2027-12-31",
        description: "25 AI videos per month, all premium voices, batch generation",
      },
    ],
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
