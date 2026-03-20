"use server";

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "./client";
import { getCurrencyForLocale, getPlanPricing } from "./config";

export async function createCheckoutSessionByPlan(planId: string) {
  const { plans } = await import("./config");
  const locale = await getLocale();
  const currency = getCurrencyForLocale(locale);
  const plan = plans.find((p) => p.id === planId.toUpperCase());
  const pricing = plan ? getPlanPricing(plan, currency) : undefined;

  if (!plan || !pricing?.stripePriceId) {
    throw new Error("Invalid plan");
  }
  return createCheckoutSession(pricing.stripePriceId, locale);
}

export async function createCheckoutSession(priceId: string, locale?: string) {
  const activeLocale = locale ?? (await getLocale());
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

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${activeLocale}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${activeLocale}/pricing?canceled=true`,
    metadata: { userId: dbUser.id },
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
