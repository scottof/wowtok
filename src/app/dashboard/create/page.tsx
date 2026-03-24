import { prisma } from "@/lib/prisma";
import { getVideosLimit } from "@/lib/stripe/config";
import { CreateVideoForm } from "@/components/dashboard/create-video-form";
import { getCurrentUsageMonth, getDashboardViewer } from "@/lib/dashboard/server";

export default async function CreateVideoPage() {
  const { dbUser } = await getDashboardViewer();

  if (!dbUser) {
    return null;
  }

  const hasSubscription =
    !!dbUser?.subscription && dbUser.subscription.status === "ACTIVE";
  const plan = dbUser?.subscription?.plan ?? "STARTER";

  const month = getCurrentUsageMonth();
  const usage = await prisma.usageRecord.findUnique({
    where: { userId_month: { userId: dbUser.id, month } },
  });

  const used = usage?.videosGenerated ?? 0;
  const limit = usage?.videosLimit ?? (dbUser?.subscription ? getVideosLimit(dbUser.subscription.plan) : 0);

  return <CreateVideoForm plan={plan} used={used} limit={limit} hasSubscription={hasSubscription} />;
}
