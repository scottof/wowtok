"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/dashboard/video-card";
import { UsageBar } from "@/components/dashboard/usage-bar";
import { PlanSelectionDialog } from "@/components/dashboard/plan-selection-dialog";
import { useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";
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
  plan: string | null;
  videos: VideoData[];
  used: number;
  limit: number;
  purchaseCompleted?: boolean;
}

const nextPlan: Record<string, { name: string; videos: number }> = {
  STARTER: { name: "Creator", videos: 20 },
  CREATOR: { name: "Pro", videos: 50 },
};

export function DashboardContent({
  hasSubscription,
  plan,
  videos,
  used,
  limit,
  purchaseCompleted,
}: DashboardContentProps) {
  const t = useTranslations("Dashboard");
  const [showPlanDialog, setShowPlanDialog] = useState(false);

  useEffect(() => {
    if (purchaseCompleted && plan) {
      trackEvent("purchase", { plan });
    }
  }, [purchaseCompleted, plan]);
  const isAtLimit = hasSubscription && limit > 0 && used >= limit;
  const upgrade = plan ? nextPlan[plan] : null;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("myVideosTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("myVideosSubtitle")}
          </p>
        </div>
        {hasSubscription ? (
          <Button className="w-full sm:w-auto gradient-bg border-0 text-white hover:opacity-90" asChild>
            <Link href="/dashboard/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("createVideoButton")}
            </Link>
          </Button>
        ) : (
          <Button
            className="w-full sm:w-auto gradient-bg border-0 text-white hover:opacity-90 cursor-pointer"
            onClick={() => setShowPlanDialog(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("createVideoButton")}
          </Button>
        )}
      </div>

      {/* Usage bar */}
      {hasSubscription && (
        <div className="mb-8">
          <UsageBar used={used} limit={limit} />
        </div>
      )}

      {/* Limit reached upsell */}
      {isAtLimit && upgrade && (
        <div className="mb-8 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100">
              <Zap className="h-5 w-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{t("limitReachedTitle")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("limitReachedDesc", { plan: upgrade.name, videos: upgrade.videos })}
              </p>
              <Button className="mt-3 gradient-bg border-0 text-white hover:opacity-90" size="sm" asChild>
                <Link href="/pricing">
                  <Zap className="mr-2 h-3 w-3" />
                  {t("upgradeTo", { plan: upgrade.name })}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* No subscription */}
      {!hasSubscription && (
        <div className="mb-8 rounded-xl border border-violet-200 bg-violet-50/50 p-6 text-center">
          <h3 className="font-semibold">{t("noSubscription")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("noSubscriptionDesc")}
          </p>
          <Button
            className="mt-4 gradient-bg border-0 text-white hover:opacity-90 cursor-pointer"
            size="sm"
            onClick={() => setShowPlanDialog(true)}
          >
            {t("viewPlans")}
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
          {hasSubscription ? (
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/dashboard/create">{t("createFirst")}</Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 cursor-pointer"
              onClick={() => setShowPlanDialog(true)}
            >
              {t("createFirst")}
            </Button>
          )}
        </div>
      )}

      <PlanSelectionDialog
        open={showPlanDialog}
        onOpenChange={setShowPlanDialog}
      />
    </div>
  );
}
