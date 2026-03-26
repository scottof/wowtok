import { prisma } from "@/lib/prisma";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { getMonthlyCreditsLimit } from "@/lib/stripe/config";
import { syncSubscriptionFromStripe } from "@/lib/stripe/sync";
import type { VideoStatus } from "@/types";
import { getCurrentUsageMonth, getDashboardViewer } from "@/lib/dashboard/server";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;
  const { dbUser } = await getDashboardViewer();

  if (!dbUser) {
    return null;
  }

  let subscription = dbUser.subscription;

  // If user just completed checkout but subscription is missing or incomplete,
  // directly sync from Stripe (webhook may not have arrived yet)
  if (
    success === "true" &&
    dbUser.stripeCustomerId &&
    (!subscription || subscription.status !== "ACTIVE")
  ) {
    await syncSubscriptionFromStripe(dbUser.id, dbUser.stripeCustomerId);
    subscription = await prisma.subscription.findUnique({
      where: { userId: dbUser.id },
    });
  }

  const month = getCurrentUsageMonth();
  const [videos, usage] = await Promise.all([
    prisma.video.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.usageRecord.findUnique({
      where: { userId_month: { userId: dbUser.id, month } },
    }),
  ]);

  return (
    <DashboardContent
      purchaseCompleted={success === "true" && !!subscription && subscription.status === "ACTIVE"}
      hasSubscription={!!subscription && subscription.status === "ACTIVE"}
      plan={subscription?.plan ?? null}
      videos={videos.map((v) => ({
          id: v.id,
          title: v.title,
          theme: v.theme,
          status: v.status as VideoStatus,
          thumbnailUrl: v.thumbnailUrl,
          duration: v.duration,
          createdAt: v.createdAt,
        }))}
      used={usage?.creditsUsed ?? 0}
      limit={usage?.creditsLimit ?? (subscription ? getMonthlyCreditsLimit(subscription.plan) : 0)}
    />
  );
}
