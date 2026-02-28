"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/dashboard/video-card";
import { UsageBar } from "@/components/dashboard/usage-bar";
import { useTranslations } from "next-intl";
import type { VideoStatus } from "@/types";

interface VideoData {
  id: string;
  title: string;
  theme: string;
  status: VideoStatus;
  thumbnailUrl: string | null;
  duration: number | null;
  createdAt: Date;
}

interface DashboardContentProps {
  hasSubscription: boolean;
  videos: VideoData[];
  used: number;
  limit: number;
}

export function DashboardContent({
  hasSubscription,
  videos,
  used,
  limit,
}: DashboardContentProps) {
  const t = useTranslations("Dashboard");

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("myVideosTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("myVideosSubtitle")}
          </p>
        </div>
        <Button className="gradient-bg border-0 text-white hover:opacity-90" asChild>
          <Link href="/dashboard/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("createVideoButton")}
          </Link>
        </Button>
      </div>

      {/* Usage bar */}
      {hasSubscription && (
        <div className="mb-8">
          <UsageBar used={used} limit={limit} />
        </div>
      )}

      {/* No subscription */}
      {!hasSubscription && (
        <div className="mb-8 rounded-xl border border-violet-200 bg-violet-50/50 p-6 text-center">
          <h3 className="font-semibold">{t("noSubscription")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("noSubscriptionDesc")}
          </p>
          <Button className="mt-4 gradient-bg border-0 text-white hover:opacity-90" size="sm" asChild>
            <Link href="/pricing">{t("viewPlans")}</Link>
          </Button>
        </div>
      )}

      {/* Video grid */}
      {videos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              id={video.id}
              title={video.title}
              theme={video.theme}
              status={video.status}
              thumbnailUrl={video.thumbnailUrl}
              duration={video.duration}
              createdAt={video.createdAt}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center">
          <PlusCircle className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <h3 className="mt-4 font-medium">{t("noVideos")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("noVideosDesc")}
          </p>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link href="/dashboard/create">{t("createFirst")}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
