import type { PricingPlan } from "@/types";

// NOTE: This file is imported by "use client" components (pricing-cards.tsx),
// so it CANNOT use the server-only env validation module. Price IDs are only
// needed server-side (checkout/webhooks) — the || "" fallback is safe here.
export const plans: PricingPlan[] = [
  {
    id: "STARTER",
    name: "Starter",
    price: 19,
    originalPrice: 39,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || "",
    description: "Perfect for getting started with AI videos",
    videosPerMonth: 5,
    features: [
      "5 videos per month",
      "3 standard AI voices",
      "720p video output",
      "5 basic themes",
      "Email support",
    ],
  },
  {
    id: "CREATOR",
    name: "Creator",
    price: 59,
    originalPrice: 99,
    stripePriceId: process.env.STRIPE_CREATOR_PRICE_ID || "",
    description: "For content creators who need more",
    videosPerMonth: 20,
    highlighted: true,
    features: [
      "20 videos per month",
      "10+ premium AI voices",
      "1080p video output",
      "All themes + custom themes",
      "Priority generation queue",
      "No watermark",
      "Priority support",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 149,
    originalPrice: 199,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || "",
    description: "For professionals and teams",
    videosPerMonth: 50,
    features: [
      "50 videos per month",
      "All premium voices + voice cloning",
      "1080p video output",
      "All themes + custom themes",
      "Priority generation queue",
      "No watermark",
      "API access",
      "Batch generation",
      "Dedicated support",
    ],
  },
];

export const getPlan = (id: string) =>
  plans.find((p) => p.id === id.toUpperCase());

export const getVideosLimit = (plan: string): number => {
  const found = getPlan(plan);
  return found?.videosPerMonth ?? 0;
};
