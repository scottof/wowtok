"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CancellationSurveyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
}

const REASON_KEYS = [
  "tooExpensive",
  "notUsingEnough",
  "foundAlternative",
  "missingFeatures",
  "qualityNotGood",
  "other",
] as const;

export function CancellationSurveyModal({
  open,
  onOpenChange,
  onContinue,
}: CancellationSurveyModalProps) {
  const t = useTranslations("Feedback");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggleReason(reason: string) {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cancellation",
          reasons: selectedReasons.map((key) => t(`reason_${key}`)),
          message: comment || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("thankYou"));
    } catch {
      // Don't block the user from continuing
    } finally {
      setSubmitting(false);
      onOpenChange(false);
      onContinue();
    }
  }

  function handleSkip() {
    onOpenChange(false);
    onContinue();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("cancellationTitle")}</DialogTitle>
          <DialogDescription>{t("cancellationDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {REASON_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => toggleReason(key)}
              className={cn(
                "w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors cursor-pointer",
                selectedReasons.includes(key)
                  ? "border-violet-300 bg-violet-50 text-violet-900"
                  : "border-border/60 hover:bg-muted/50"
              )}
            >
              {t(`reason_${key}`)}
            </button>
          ))}
        </div>

        <Textarea
          placeholder={t("cancellationCommentPlaceholder")}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          className="text-sm resize-none"
        />

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {t("skip")}
          </button>
          <Button
            className="gradient-bg border-0 text-white hover:opacity-90 cursor-pointer"
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || selectedReasons.length === 0}
          >
            {t("submitAndContinue")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
