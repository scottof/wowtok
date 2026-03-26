import { prisma } from "@/lib/prisma";
import { getMonthlyCreditsLimit } from "@/lib/stripe/config";
import { CreateVideoForm } from "@/components/dashboard/create-video-form";
import { getCurrentUsageMonth, getDashboardViewer } from "@/lib/dashboard/server";
import { getPurchasedCreditsAvailable } from "@/lib/credits";

export default async function CreateVideoPage() {
  const { dbUser } = await getDashboardViewer();

  if (!dbUser) {
    return null;
  }

  const hasSubscription =
    !!dbUser?.subscription && dbUser.subscription.status === "ACTIVE";
  const plan = dbUser?.subscription?.plan ?? null;

  const month = getCurrentUsageMonth();
  const usage = await prisma.usageRecord.findUnique({
    where: { userId_month: { userId: dbUser.id, month } },
  });
  const purchasedCreditsAvailable = await getPurchasedCreditsAvailable(dbUser.id);

  const used = usage?.creditsUsed ?? 0;
  const limit = usage?.creditsLimit ?? (dbUser?.subscription ? getMonthlyCreditsLimit(dbUser.subscription.plan) : 0);

  return (
    <CreateVideoForm
      plan={plan}
      used={used}
      limit={limit}
      hasSubscription={hasSubscription}
      purchasedCreditsAvailable={purchasedCreditsAvailable}
    />
  );
}
