import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { getVideosLimit } from "@/lib/stripe/config";
import type { VideoStatus } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user!.id },
    include: {
      subscription: true,
      videos: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const usage = await prisma.usageRecord.findUnique({
    where: { userId_month: { userId: dbUser!.id, month } },
  });

  return (
    <DashboardContent
      hasSubscription={!!dbUser?.subscription}
      plan={dbUser?.subscription?.plan ?? null}
      videos={
        dbUser?.videos.map((v) => ({
          id: v.id,
          title: v.title,
          theme: v.theme,
          status: v.status as VideoStatus,
          thumbnailUrl: v.thumbnailUrl,
          duration: v.duration,
          createdAt: v.createdAt,
        })) ?? []
      }
      used={usage?.videosGenerated ?? 0}
      limit={usage?.videosLimit ?? (dbUser?.subscription ? getVideosLimit(dbUser.subscription.plan) : 0)}
    />
  );
}
