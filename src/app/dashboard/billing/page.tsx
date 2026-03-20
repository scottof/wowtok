import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  formatPrice,
  getCurrencyByPriceId,
  getCurrencyForLocale,
  getPlan,
  getPlanPricing,
} from "@/lib/stripe/config";
import { BillingContent } from "@/components/dashboard/billing-content";
import { getLocale } from "next-intl/server";

export default async function BillingPage() {
  const locale = await getLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user!.id },
    include: { subscription: true },
  });

  const subscription = dbUser?.subscription;
  const plan = subscription ? getPlan(subscription.plan) : null;
  const currency = subscription?.stripePriceId
    ? getCurrencyByPriceId(subscription.stripePriceId) ?? getCurrencyForLocale(locale)
    : undefined;
  const pricing = plan && currency ? getPlanPricing(plan, currency) : null;

  return (
    <BillingContent
      subscription={
        subscription
          ? {
              status: subscription.status,
              plan: subscription.plan,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
              currentPeriodEnd: subscription.currentPeriodEnd,
            }
          : null
      }
      plan={
        plan && pricing
          ? {
              id: plan.id,
              priceDisplay: formatPrice(pricing.price, currency!, locale),
              videosPerMonth: plan.videosPerMonth,
            }
          : null
      }
    />
  );
}
