import type { Plan, SubStatus } from "@prisma/client";

/**
 * Map a Stripe price ID to the internal Plan enum.
 * Falls back to STARTER if the price ID is unrecognized.
 *
 * Accepts a lookup object so the function stays pure (no env reads).
 */
export function mapPriceToPlan(
  priceId: string,
  priceLookup: { starter: string; creator: string; pro: string }
): Plan {
  if (priceId === priceLookup.starter) return "STARTER";
  if (priceId === priceLookup.creator) return "CREATOR";
  if (priceId === priceLookup.pro) return "PRO";
  return "STARTER";
}

/**
 * Map a Stripe subscription status string to the internal SubStatus enum.
 * Falls back to INCOMPLETE for any unrecognized status.
 */
export function mapStatus(status: string): SubStatus {
  switch (status) {
    case "active":
    case "trialing":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "unpaid":
      return "CANCELED";
    default:
      return "INCOMPLETE";
  }
}
