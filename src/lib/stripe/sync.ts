import { stripe } from "./client";
import { prisma } from "@/lib/prisma";
import { mapPriceToPlan, mapStatus } from "./mappers";
import { getVideosLimit } from "./config";
import { env } from "@/lib/env";

/**
 * Directly sync subscription from Stripe for a given user.
 * Used as a fallback when the webhook hasn't arrived yet
 * (e.g. right after checkout redirect).
 */
export async function syncSubscriptionFromStripe(
  userId: string,
  stripeCustomerId: string
) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      limit: 1,
      expand: ["data.items.data.price"],
    });

    const sub = subscriptions.data[0];
    if (!sub) return;

    const item = sub.items.data[0];
    if (!item) return;

    const priceId = item.price.id;
    const plan = mapPriceToPlan(priceId, {
      starter: env.STRIPE_STARTER_PRICE_ID,
      creator: env.STRIPE_CREATOR_PRICE_ID,
      pro: env.STRIPE_PRO_PRICE_ID,
    });
    const status = mapStatus(sub.status);
    const periodStart = new Date(item.current_period_start * 1000);
    const periodEnd = new Date(item.current_period_end * 1000);

    const isCanceling =
      sub.cancel_at_period_end || sub.cancel_at != null;

    await prisma.subscription.upsert({
      where: { userId },
      update: {
        stripeSubscriptionId: sub.id,
        stripePriceId: priceId,
        plan,
        status,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: isCanceling,
      },
      create: {
        userId,
        stripeSubscriptionId: sub.id,
        stripePriceId: priceId,
        plan,
        status,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: isCanceling,
      },
    });

    // Ensure usage record exists for current month
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    await prisma.usageRecord.upsert({
      where: { userId_month: { userId, month } },
      update: { videosLimit: getVideosLimit(plan) },
      create: {
        userId,
        month,
        videosGenerated: 0,
        videosLimit: getVideosLimit(plan),
      },
    });
  } catch (error) {
    console.error("Failed to sync subscription from Stripe:", error);
  }
}
