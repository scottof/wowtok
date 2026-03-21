"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const t = useTranslations("ContactPage");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          company,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed");
      }

      setSent(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setCompany("");
    } catch {
      // Keep the page steady and let users retry quickly.
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold">{t("successTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("successDescription")}
        </p>
        <Button
          variant="outline"
          className="mt-5 cursor-pointer"
          onClick={() => setSent(false)}
        >
          {t("sendAnother")}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">{t("name")}</Label>
          <Input
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            className="mt-1.5"
            required
          />
        </div>
        <div>
          <Label htmlFor="contact-email">{t("email")}</Label>
          <Input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            className="mt-1.5"
            required
          />
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor="contact-subject">{t("subject")}</Label>
        <Input
          id="contact-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={t("subjectPlaceholder")}
          className="mt-1.5"
          required
        />
      </div>

      <div className="mt-4 hidden">
        <Label htmlFor="contact-company">{t("companyLabel")}</Label>
        <Input
          id="contact-company"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div className="mt-4">
        <Label htmlFor="contact-message">{t("message")}</Label>
        <Textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("messagePlaceholder")}
          className="mt-1.5 min-h-[180px]"
          required
        />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {t("responseTime")}
      </p>

      <Button
        type="submit"
        disabled={
          sending ||
          !name.trim() ||
          !email.trim() ||
          !subject.trim() ||
          !message.trim()
        }
        className="mt-5 w-full cursor-pointer gradient-bg border-0 text-white hover:opacity-90"
      >
        {sending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        {t("submit")}
      </Button>
    </form>
  );
}
