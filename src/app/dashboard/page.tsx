import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/dashboard/video-card";
import { UsageBar } from "@/components/dashboard/usage-bar";
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
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Videos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage your AI-generated videos
          </p>
        </div>
        <Button className="gradient-bg border-0 text-white hover:opacity-90" asChild>
          <Link href="/dashboard/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Video
          </Link>
        </Button>
      </div>

      {/* Usage bar */}
      {dbUser?.subscription && (
        <div className="mb-8">
          <UsageBar
            used={usage?.videosGenerated ?? 0}
            limit={usage?.videosLimit ?? 0}
          />
        </div>
      )}

      {/* No subscription */}
      {!dbUser?.subscription && (
        <div className="mb-8 rounded-xl border border-violet-200 bg-violet-50/50 p-6 text-center">
          <h3 className="font-semibold">No active subscription</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Subscribe to a plan to start creating videos
          </p>
          <Button className="mt-4 gradient-bg border-0 text-white hover:opacity-90" size="sm" asChild>
            <Link href="/pricing">View Plans</Link>
          </Button>
        </div>
      )}

      {/* Video grid */}
      {dbUser?.videos && dbUser.videos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {dbUser.videos.map((video) => (
            <VideoCard
              key={video.id}
              id={video.id}
              title={video.title}
              theme={video.theme}
              status={video.status as VideoStatus}
              thumbnailUrl={video.thumbnailUrl}
              duration={video.duration}
              createdAt={video.createdAt}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center">
          <PlusCircle className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <h3 className="mt-4 font-medium">No videos yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first AI video to get started
          </p>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link href="/dashboard/create">Create your first video</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
