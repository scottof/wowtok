"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const SUPPORT_TIERS: Record<string, { level: string; color: string }> = {
  STARTER: { level: "Basic", color: "bg-gray-100 text-gray-700" },
  CREATOR: { level: "Priority", color: "bg-violet-100 text-violet-700" },
  PRO: { level: "Dedicated", color: "bg-amber-100 text-amber-700" },
};

interface SupportContentProps {
  plan: string | null;
  userEmail: string;
}

export function SupportContent({ plan, userEmail }: SupportContentProps) {
  const t = useTranslations("Dashboard");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const tier = plan ? SUPPORT_TIERS[plan] : null;
  const supportLevel = tier?.level ?? "Basic";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          message,
          supportLevel,
        }),
      });

      if (res.ok) {
        setSent(true);
        setSubject("");
        setMessage("");
      }
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t("supportTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("supportSubtitle")}
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        <div className="rounded-xl border p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("contactUs")}</h2>
            {tier && (
              <Badge variant="secondary" className={cn("text-xs", tier.color)}>
                {supportLevel} {t("supportLabel")}
              </Badge>
            )}
          </div>

          {sent ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">{t("messageSent")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("messageSentDesc")}
              </p>
              <Button
                variant="outline"
                className="mt-4 cursor-pointer"
                onClick={() => setSent(false)}
              >
                {t("sendAnother")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("supportEmail")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={userEmail}
                  disabled
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="subject">{t("supportSubject")}</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t("supportSubjectPlaceholder")}
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="message">{t("supportMessage")}</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("supportMessagePlaceholder")}
                  required
                  className="mt-1.5 min-h-[150px]"
                />
              </div>

              <Button
                type="submit"
                disabled={sending || !subject.trim() || !message.trim()}
                className="w-full cursor-pointer gradient-bg border-0 text-white hover:opacity-90"
              >
                {sending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {t("sendMessage")}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
