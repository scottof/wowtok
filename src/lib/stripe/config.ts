import type { PricingPlan, SupportedCurrency } from "@/types";

// NOTE: This file is imported by "use client" components, so it cannot depend
// on the server-only env validation module.

export const defaultCurrency: SupportedCurrency = "USD";
export const euroLocales = new Set(["de", "es", "fr", "it", "pt"]);

export const plans: PricingPlan[] = [
  {
    id: "STARTER",
    name: "Starter",
    nameKey: "starter",
    description: "Perfect for getting started with AI videos",
    descriptionKey: "starterDesc",
    monthlyCredits: 30,
    pricing: {
      USD: {
        price: 29,
        originalPrice: 49,
        stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || "",
      },
      EUR: {
        price: 29,
        originalPrice: 49,
        stripePriceId: process.env.STRIPE_STARTER_PRICE_ID_EUR || "",
      },
    },
    features: [
      "30 credits per month",
      "3 standard AI voices",
      "720p video output",
      "5 basic themes",
      "Email support",
    ],
    featureKeys: [
      "starterFeatureCredits",
      "starterFeature2",
      "starterFeature3",
      "starterFeature4",
      "starterFeature5",
    ],
  },
  {
    id: "CREATOR",
    name: "Creator",
    nameKey: "creator",
    description: "For content creators who need more",
    descriptionKey: "creatorDesc",
    monthlyCredits: 100,
    highlighted: true,
    pricing: {
      USD: {
        price: 59,
        originalPrice: 99,
        stripePriceId: process.env.STRIPE_CREATOR_PRICE_ID || "",
      },
      EUR: {
        price: 59,
        originalPrice: 99,
        stripePriceId: process.env.STRIPE_CREATOR_PRICE_ID_EUR || "",
      },
    },
    features: [
      "100 credits per month",
      "10+ premium AI voices",
      "1080p video output",
      "All themes",
      "Priority generation queue",
      "No watermark",
      "Priority support",
    ],
    featureKeys: [
      "creatorFeatureCredits",
      "creatorFeature2",
      "creatorFeature3",
      "creatorFeature4",
      "creatorFeature5",
      "creatorFeature6",
      "creatorFeature7",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    nameKey: "pro",
    description: "For professionals and teams",
    descriptionKey: "proDesc",
    monthlyCredits: 250,
    pricing: {
      USD: {
        price: 149,
        originalPrice: 199,
        stripePriceId: process.env.STRIPE_PRO_PRICE_ID || "",
      },
      EUR: {
        price: 149,
        originalPrice: 199,
        stripePriceId: process.env.STRIPE_PRO_PRICE_ID_EUR || "",
      },
    },
    features: [
      "250 credits per month",
      "All premium voices",
      "1080p video output",
      "All themes",
      "Priority generation queue",
      "No watermark",
      "Batch generation",
      "Dedicated support",
    ],
    featureKeys: [
      "proFeatureCredits",
      "proFeature2",
      "proFeature3",
      "proFeature4",
      "proFeature5",
      "proFeature6",
      "proFeature7",
      "proFeature8",
    ],
  },
];

export const getPlan = (id: string) =>
  plans.find((p) => p.id === id.toUpperCase());

export function getCurrencyForLocale(locale: string): SupportedCurrency {
  const language = locale.toLowerCase().split("-")[0];
  return euroLocales.has(language) ? "EUR" : defaultCurrency;
}

export function getPlanPricing(
  planOrId: PricingPlan | string,
  currency: SupportedCurrency
) {
  const plan = typeof planOrId === "string" ? getPlan(planOrId) : planOrId;
  return plan?.pricing[currency];
}

export function getPlanPricingForLocale(
  planOrId: PricingPlan | string,
  locale: string
) {
  return getPlanPricing(planOrId, getCurrencyForLocale(locale));
}

export function getCurrencyByPriceId(
  priceId: string
): SupportedCurrency | undefined {
  if (!priceId) return undefined;

  for (const plan of plans) {
    if (plan.pricing.USD.stripePriceId && plan.pricing.USD.stripePriceId === priceId) {
      return "USD";
    }
    if (plan.pricing.EUR.stripePriceId && plan.pricing.EUR.stripePriceId === priceId) {
      return "EUR";
    }
  }
}

export function formatPrice(
  amount: number,
  currency: SupportedCurrency,
  locale = "en"
) {
  const normalizedLocale = locale === "pt" ? "pt-PT" : locale;

  return new Intl.NumberFormat(normalizedLocale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getMonthlyCreditsLimit(plan: string): number {
  const found = getPlan(plan);
  return found?.monthlyCredits ?? 0;
}

export const getVideosLimit = getMonthlyCreditsLimit;

export function estimateCreditsForVideo(narratorText: string): 8 | 10 | 12 {
  const length = narratorText.trim().length;
  if (length <= 250) return 8;
  if (length <= 450) return 10;
  return 12;
}

export function getCreditTopupPricing(
  credits: number,
  currency: SupportedCurrency
) {
  if (credits <= 0) {
    return {
      price: 0,
      amountInCents: 0,
      label: "0 credits",
      currency,
    };
  }

  const amountInCents = credits * 100 - 1;

  return {
    price: amountInCents / 100,
    amountInCents,
    label: `${credits} credits`,
    currency,
  };
}
