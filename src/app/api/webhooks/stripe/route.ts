import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/prisma";
import { getVideosLimit } from "@/lib/stripe/config";
import { mapPriceToPlan, mapStatus } from "@/lib/stripe/mappers";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = session.subscription as string;
      const userId = session.metadata?.userId;

      if (!userId || !subscriptionId) break;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const item = subscription.items.data[0];
      const priceId = item.price.id;
      const plan = mapPriceToPlan(priceId, {
        starter: [
          env.STRIPE_STARTER_PRICE_ID,
          env.STRIPE_STARTER_PRICE_ID_EUR,
        ],
        creator: [
          env.STRIPE_CREATOR_PRICE_ID,
          env.STRIPE_CREATOR_PRICE_ID_EUR,
        ],
        pro: [env.STRIPE_PRO_PRICE_ID, env.STRIPE_PRO_PRICE_ID_EUR],
      });
      const periodStart = new Date(item.current_period_start * 1000);
      const periodEnd = new Date(item.current_period_end * 1000);

      const isCanceling =
        subscription.cancel_at_period_end || subscription.cancel_at != null;

      await prisma.subscription.upsert({
        where: { userId },
        update: {
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          plan,
          status: mapStatus(subscription.status),
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: isCanceling,
        },
        create: {
          userId,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          plan,
          status: mapStatus(subscription.status),
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: isCanceling,
        },
      });

      // Create usage record for current month
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
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const updatedItem = subscription.items.data[0];
      const priceId = updatedItem.price.id;
      const plan = mapPriceToPlan(priceId, {
        starter: [
          env.STRIPE_STARTER_PRICE_ID,
          env.STRIPE_STARTER_PRICE_ID_EUR,
        ],
        creator: [
          env.STRIPE_CREATOR_PRICE_ID,
          env.STRIPE_CREATOR_PRICE_ID_EUR,
        ],
        pro: [env.STRIPE_PRO_PRICE_ID, env.STRIPE_PRO_PRICE_ID_EUR],
      });

      const isUpdatedCanceling =
        subscription.cancel_at_period_end || subscription.cancel_at != null;

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          stripePriceId: priceId,
          plan,
          status: mapStatus(subscription.status),
          currentPeriodStart: new Date(updatedItem.current_period_start * 1000),
          currentPeriodEnd: new Date(updatedItem.current_period_end * 1000),
          cancelAtPeriodEnd: isUpdatedCanceling,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: "CANCELED" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
