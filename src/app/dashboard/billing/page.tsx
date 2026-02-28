import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getPlan } from "@/lib/stripe/config";
import { BillingContent } from "@/components/dashboard/billing-content";

export default async function BillingPage() {
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
        plan
          ? {
              name: plan.name,
              price: plan.price,
              videosPerMonth: plan.videosPerMonth,
            }
          : null
      }
    />
  );
}
