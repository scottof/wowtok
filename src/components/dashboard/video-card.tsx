"use client";

import Link from "next/link";
import { Play, Clock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { VideoStatus } from "@/types";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface VideoCardProps {
  id: string;
  title: string;
  theme: string;
  status: VideoStatus;
  thumbnailUrl: string | null;
  duration: number | null;
  createdAt: Date;
}

function useStatusConfig() {
  const t = useTranslations("Dashboard");
  return {
    PENDING: { label: t("statusQueued"), icon: Clock, color: "bg-yellow-100 text-yellow-800" },
    SCENES: { label: t("statusScenes"), icon: Loader2, color: "bg-blue-100 text-blue-800" },
    IMAGES: { label: t("statusImages"), icon: Loader2, color: "bg-blue-100 text-blue-800" },
    VIDEO: { label: t("statusVideo"), icon: Loader2, color: "bg-blue-100 text-blue-800" },
    VOICEOVER: { label: t("statusAddingVoice"), icon: Loader2, color: "bg-blue-100 text-blue-800" },
    COMPOSING: { label: t("statusComposingShort"), icon: Loader2, color: "bg-purple-100 text-purple-800" },
    COMPLETED: { label: t("statusReady"), icon: CheckCircle2, color: "bg-green-100 text-green-800" },
    FAILED: { label: t("statusFailed"), icon: AlertCircle, color: "bg-red-100 text-red-800" },
  } as Record<VideoStatus, { label: string; icon: typeof Clock; color: string }>;
}

export function VideoCard({
  id,
  title,
  theme,
  status,
  thumbnailUrl,
  duration,
  createdAt,
}: VideoCardProps) {
  const statusConfig = useStatusConfig();
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const isProcessing = !["COMPLETED", "FAILED"].includes(status);

  return (
    <Link
      href={`/dashboard/videos/${id}`}
      className="group overflow-hidden rounded-xl border border-border/60 bg-card transition-all hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5"
    >
      {/* Thumbnail */}
      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {isProcessing ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/40" />
            ) : (
              <Play className="h-8 w-8 text-muted-foreground/40" />
            )}
          </div>
        )}

        {/* Status badge */}
        <div className="absolute left-2 top-2">
          <Badge
            variant="secondary"
            className={cn("gap-1 text-[10px] font-medium", config.color)}
          >
            <StatusIcon
              className={cn("h-3 w-3", isProcessing && "animate-spin")}
            />
            {config.label}
          </Badge>
        </div>

        {/* Duration */}
        {duration && (
          <div className="absolute bottom-2 right-2">
            <span className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="truncate text-sm font-medium">{title}</h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs capitalize text-muted-foreground">
            {theme}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
