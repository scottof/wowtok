"use server";

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "./client";
import { getCreditTopupPricing, getCurrencyForLocale, getPlanPricing } from "./config";
import { getLocalizedUrl } from "@/lib/seo/locale-urls";

function getCheckoutCancelPath(returnPath?: string) {
  if (!returnPath || !returnPath.startsWith("/")) {
    return "/pricing";
  }

  return returnPath;
}

async function getCheckoutContext(activeLocale: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${activeLocale}/login`);
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });

  if (!dbUser) {
    redirect(`/${activeLocale}/login`);
  }

  let customerId = dbUser.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { userId: dbUser.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { stripeCustomerId: customerId },
    });
  }

  return { user, dbUser, customerId };
}

export async function createCheckoutSessionByPlan(
  planId: string,
  returnPath?: string
) {
  const { plans } = await import("./config");
  const locale = await getLocale();
  const currency = getCurrencyForLocale(locale);
  const plan = plans.find((p) => p.id === planId.toUpperCase());
  const pricing = plan ? getPlanPricing(plan, currency) : undefined;

  if (!plan || !pricing?.stripePriceId) {
    throw new Error("Invalid plan");
  }
  return createCheckoutSession(pricing.stripePriceId, locale, returnPath);
}

export async function createCheckoutSession(
  priceId: string,
  locale?: string,
  returnPath?: string
) {
  const activeLocale = locale ?? (await getLocale());
  const { dbUser, customerId } = await getCheckoutContext(activeLocale);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${activeLocale}/dashboard?success=true`,
    cancel_url: getLocalizedUrl(
      activeLocale,
      getCheckoutCancelPath(returnPath),
      { canceled: true }
    ),
    metadata: { userId: dbUser.id },
  });

  redirect(session.url!);
}

export async function createCreditTopupCheckoutSession(
  {
    requiredCredits,
    draftFingerprint,
    returnPath,
  }: {
    requiredCredits: number;
    draftFingerprint?: string;
    returnPath?: string;
  }
) {
  const activeLocale = await getLocale();
  const currency = getCurrencyForLocale(activeLocale);
  const topup = getCreditTopupPricing(requiredCredits, currency);
  const { dbUser, customerId } = await getCheckoutContext(activeLocale);

  const localizedReturnPath = getCheckoutCancelPath(returnPath ?? "/dashboard/create");

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: `WowTok ${requiredCredits} credit top-up`,
            description: `Credits for one-off AI TikTok video creation`,
          },
          unit_amount: topup.amountInCents,
        },
        quantity: 1,
      },
    ],
    allow_promotion_codes: false,
    success_url: getLocalizedUrl(activeLocale, localizedReturnPath, {
      payg: "success",
    }),
    cancel_url: getLocalizedUrl(activeLocale, localizedReturnPath, {
      payg: "canceled",
    }),
    metadata: {
      userId: dbUser.id,
      checkoutType: "CREDIT_TOPUP",
      credits: String(requiredCredits),
      draftFingerprint: draftFingerprint ?? "",
    },
  });

  redirect(session.url!);
}

export async function createPortalSession() {
  const locale = await getLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });

  if (!dbUser?.stripeCustomerId) {
    redirect(`/${locale}/pricing`);
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/dashboard/billing`,
  });

  redirect(session.url);
}
