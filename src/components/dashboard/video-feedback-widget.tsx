"use client";

import { useState, useEffect } from "react";
import { Star, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VideoFeedbackWidgetProps {
  videoId: string;
}

export function VideoFeedbackWidget({ videoId }: VideoFeedbackWidgetProps) {
  const t = useTranslations("Feedback");
  const [dismissed, setDismissed] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const key = `feedback-video-${videoId}`;
    setDismissed(localStorage.getItem(key) === "true");
  }, [videoId]);

  if (dismissed || submitted) return null;

  async function handleSubmit() {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "video-rating",
          rating,
          message: comment || undefined,
          videoId,
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      localStorage.setItem(`feedback-video-${videoId}`, "true");
      toast.success(t("thankYou"));
    } catch {
      toast.error(t("submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem(`feedback-video-${videoId}`, "true");
    setDismissed(true);
  }

  return (
    <div className="rounded-xl border border-border/60 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{t("rateVideo")}</h4>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="cursor-pointer p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                star <= (hoveredRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              )}
            />
          </button>
        ))}
      </div>

      {rating > 0 && (
        <div className="mt-3 space-y-3">
          <Textarea
            placeholder={t("commentPlaceholder")}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            className="text-sm resize-none"
          />
          <Button
            size="sm"
            className="gradient-bg border-0 text-white hover:opacity-90 cursor-pointer"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <Send className="mr-2 h-3 w-3" />
            {t("submit")}
          </Button>
        </div>
      )}
    </div>
  );
}
