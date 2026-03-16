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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORY_KEYS = ["bugReport", "featureRequest", "generalFeedback"] as const;

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const t = useTranslations("Feedback");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!category || !message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "general",
          reasons: [t(`category_${category}`)],
          message,
        }),
      });
      if (!res.ok) throw new Error();
      trackEvent("submit_feedback", { category });
      toast.success(t("thankYou"));
      setCategory("");
      setMessage("");
      onOpenChange(false);
    } catch {
      toast.error(t("submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("generalTitle")}</DialogTitle>
          <DialogDescription>{t("generalDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder={t("selectCategory")} />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_KEYS.map((key) => (
                <SelectItem key={key} value={key} className="cursor-pointer">
                  {t(`category_${key}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder={t("messagePlaceholder")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="resize-none"
          />

          <Button
            className="w-full gradient-bg border-0 text-white hover:opacity-90 cursor-pointer"
            onClick={handleSubmit}
            disabled={submitting || !category || !message.trim()}
          >
            <Send className="mr-2 h-4 w-4" />
            {t("submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
