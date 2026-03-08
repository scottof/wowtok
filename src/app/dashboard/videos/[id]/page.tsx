"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { VideoStatus } from "@/types";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface VideoData {
  id: string;
  title: string;
  theme: string;
  prompt: string;
  narratorText: string;
  status: VideoStatus;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  errorMessage: string | null;
  createdAt: string;
}

function getStatusSteps(t: (key: string) => string) {
  return [
    { key: "PENDING" as VideoStatus, label: t("statusQueued") },
    { key: "SCENES" as VideoStatus, label: t("statusScenes") },
    { key: "IMAGES" as VideoStatus, label: t("statusImages") },
    { key: "VIDEO" as VideoStatus, label: t("statusVideo") },
    { key: "VOICEOVER" as VideoStatus, label: t("statusVoiceover") },
    { key: "COMPOSING" as VideoStatus, label: t("statusComposing") },
    { key: "COMPLETED" as VideoStatus, label: t("statusCompleted") },
  ];
}

function getStepIndex(status: VideoStatus, statusSteps: { key: VideoStatus; label: string }[]) {
  const idx = statusSteps.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("Dashboard");
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const statusSteps = getStatusSteps(t);

  async function fetchVideo() {
    try {
      const res = await fetch(`/api/videos/${params.id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setVideo(data);
    } catch {
      setVideo(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVideo();
    // Poll while processing
    const interval = setInterval(() => {
      if (
        video &&
        !["COMPLETED", "FAILED"].includes(video.status)
      ) {
        fetchVideo();
      }
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, video?.status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-lg font-semibold">{t("videoNotFound")}</h2>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard")}>
          {t("backToDashboard")}
        </Button>
      </div>
    );
  }

  const isProcessing = !["COMPLETED", "FAILED"].includes(video.status);
  const currentStep = getStepIndex(video.status, statusSteps);

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 cursor-pointer"
        onClick={() => router.push("/dashboard")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("backToVideos")}
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Video preview */}
        <div className="overflow-hidden rounded-xl border border-border/60 bg-black">
          {video.status === "COMPLETED" && video.videoUrl ? (
            <video
              src={video.videoUrl}
              controls
              className="aspect-[9/16] w-full"
              poster={video.thumbnailUrl || undefined}
            />
          ) : (
            <div className="flex aspect-[9/16] items-center justify-center">
              {video.status === "FAILED" ? (
                <div className="text-center text-red-400">
                  <AlertCircle className="mx-auto h-10 w-10" />
                  <p className="mt-2 text-sm">{t("generationFailed")}</p>
                  {video.errorMessage && (
                    <p className="mt-1 text-xs opacity-60">{video.errorMessage}</p>
                  )}
                </div>
              ) : (
                <div className="text-center text-white/60">
                  <Loader2 className="mx-auto h-10 w-10 animate-spin" />
                  <p className="mt-3 text-sm">{t("generatingVideo")}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold">{video.title}</h1>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {video.theme}
              </Badge>
              {video.duration && (
                <span className="text-sm text-muted-foreground">
                  {Math.floor(video.duration / 60)}:
                  {String(video.duration % 60).padStart(2, "0")}
                </span>
              )}
            </div>
          </div>

          {/* Progress steps */}
          {isProcessing && (
            <div className="mb-6 rounded-xl border border-border/60 p-4">
              <h3 className="mb-3 text-sm font-medium">{t("generationProgress")}</h3>
              <div className="space-y-2">
                {statusSteps.map((s, i) => (
                  <div
                    key={s.key}
                    className={cn(
                      "flex items-center gap-3 text-sm",
                      i <= currentStep
                        ? "text-foreground"
                        : "text-muted-foreground/40"
                    )}
                  >
                    {i < currentStep ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : i === currentStep ? (
                      <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {video.status === "COMPLETED" && video.videoUrl && (
            <div className="mb-6 flex flex-wrap gap-3">
              <Button className="gradient-bg border-0 text-white hover:opacity-90" asChild>
                <a href={video.videoUrl} download>
                  <Download className="mr-2 h-4 w-4" />
                  {t("downloadVideo")}
                </a>
              </Button>
            </div>
          )}

          {video.status === "FAILED" && (
            <div className="mb-6">
              <Button
                variant="outline"
                disabled={retrying}
                onClick={async () => {
                  setRetrying(true);
                  try {
                    const res = await fetch("/api/videos/generate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: video.title,
                        theme: video.theme,
                        prompt: video.prompt,
                        narratorText: video.narratorText,
                      }),
                    });
                    if (!res.ok) throw new Error("Failed");
                    const data = await res.json();
                    toast.success(t("videoStarted"));
                    if (data.videoId) {
                      router.push(`/dashboard/videos/${data.videoId}`);
                    }
                  } catch {
                    toast.error(t("failedGeneration"));
                    setRetrying(false);
                  }
                }}
              >
                {retrying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {t("retryGeneration")}
              </Button>
            </div>
          )}

          {/* Details section */}
          <div className="space-y-4 rounded-xl border border-border/60 p-4">
            <div>
              <h4 className="text-xs font-medium text-muted-foreground">{t("prompt")}</h4>
              <p className="mt-1 text-sm">{video.prompt}</p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-muted-foreground">{t("narration")}</h4>
              <p className="mt-1 text-sm">{video.narratorText}</p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-muted-foreground">{t("created")}</h4>
              <p className="mt-1 text-sm">
                {new Date(video.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
