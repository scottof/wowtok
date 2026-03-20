import { getLocale } from "next-intl/server";
import { siteConfig } from "@/config/site";
import {
  getCurrencyForLocale,
  getPlanPricing,
  plans,
} from "@/lib/stripe/config";

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.png`,
    description: siteConfig.description,
    sameAs: [siteConfig.links.twitter],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export async function ProductJsonLd() {
  const locale = await getLocale();
  const currency = getCurrencyForLocale(locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
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

export function FAQJsonLd() {
  const faqs = [
    {
      question: "What is WowTok?",
      answer:
        "WowTok is an AI-powered platform that generates complete TikTok-ready videos from simple text prompts. Choose a theme, write your prompt, and AI creates a video with scenes, voiceover, and captions.",
    },
    {
      question: "How does the AI video generation work?",
      answer:
        "Our pipeline uses multiple specialized AI models: one breaks your script into scenes, another generates visuals for each scene, a third animates them into video clips, and a fourth creates the voiceover. Everything is assembled into a final 9:16 vertical video.",
    },
    {
      question: "How long does it take to generate a video?",
      answer:
        "Most videos are generated in 3-5 minutes depending on length and complexity.",
    },
    {
      question: "What video format do I get?",
      answer:
        "Videos are generated in 9:16 vertical format (1080x1920) as MP4 files, optimized for TikTok, Instagram Reels, and YouTube Shorts.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel anytime from your dashboard. You keep access until the end of your billing period.",
    },
    {
      question: "Do I own the videos I create?",
      answer:
        "Yes, you have full commercial rights to all videos generated on WowTok.",
    },
  ];

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
