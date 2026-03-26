import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/prisma";
import { getMonthlyCreditsLimit } from "@/lib/stripe/config";
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
      const userId = session.metadata?.userId;
      const checkoutType = session.metadata?.checkoutType;

      if (!userId) break;

      if (checkoutType === "CREDIT_TOPUP") {
        const credits = Number(session.metadata?.credits || "0");
        const currency = (session.currency?.toUpperCase() || "USD") as "USD" | "EUR";
        const amount = session.amount_total ?? 0;

        if (credits <= 0) break;

        await prisma.creditPurchase.upsert({
          where: { stripeCheckoutSessionId: session.id },
          update: {
            stripePaymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
            creditsPurchased: credits,
            creditsRemaining: credits,
            amount,
            currency,
            status: "COMPLETED",
          },
          create: {
            userId,
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
            creditsPurchased: credits,
            creditsRemaining: credits,
            amount,
            currency,
            status: "COMPLETED",
          },
        });
        break;
      }

      const subscriptionId = session.subscription as string;

      if (!subscriptionId) break;

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
        update: { creditsLimit: getMonthlyCreditsLimit(plan) },
        create: {
          userId,
          month,
          creditsUsed: 0,
          creditsLimit: getMonthlyCreditsLimit(plan),
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

      const linkedSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
        select: { userId: true },
      });

      if (linkedSubscription) {
        const now = new Date();
        const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        await prisma.usageRecord.upsert({
          where: { userId_month: { userId: linkedSubscription.userId, month } },
          update: {
            creditsLimit: getMonthlyCreditsLimit(plan),
          },
          create: {
            userId: linkedSubscription.userId,
            month,
            creditsUsed: 0,
            creditsLimit: getMonthlyCreditsLimit(plan),
          },
        });
      }
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
