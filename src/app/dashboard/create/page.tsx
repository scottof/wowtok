"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ghost,
  Sparkles,
  Laugh,
  Rocket,
  Theater,
  Search,
  Heart,
  Zap,
  BookOpen,
  Flame,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { videoThemes } from "@/config/themes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Ghost,
  Sparkles,
  Laugh,
  Rocket,
  Theater,
  Search,
  Heart,
  Zap,
  BookOpen,
  Flame,
};

export default function CreateVideoPage() {
  const router = useRouter();
  const t = useTranslations("Dashboard");
  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState("");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [narratorText, setNarratorText] = useState("");
  const [voiceId, setVoiceId] = useState("adam");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const steps = [
    t("stepTheme"),
    t("stepPrompt"),
    t("stepNarration"),
    t("stepVoice"),
    t("stepReview"),
  ];

  const voiceOptions = [
    { id: "adam", name: "Adam", description: t("voiceAdam") },
    { id: "bella", name: "Bella", description: t("voiceBella") },
    { id: "charlie", name: "Charlie", description: t("voiceCharlie") },
    { id: "sarah", name: "Sarah", description: t("voiceSarah") },
    { id: "james", name: "James", description: t("voiceJames") },
    { id: "emily", name: "Emily", description: t("voiceEmily") },
  ];

  function canProceed() {
    switch (step) {
      case 0:
        return theme !== "";
      case 1:
        return title.trim() !== "" && prompt.trim() !== "";
      case 2:
        return narratorText.trim() !== "";
      case 3:
        return voiceId !== "";
      default:
        return true;
    }
  }

  async function handleGenerateScript() {
    setGenerating(true);
    try {
      const res = await fetch("/api/videos/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, prompt }),
      });
      const data = await res.json();
      if (data.script) {
        setNarratorText(data.script);
        toast.success(t("scriptGenerated"));
      }
    } catch {
      toast.error(t("failedScript"));
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/videos/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, theme, prompt, narratorText, voiceId }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || t("failedGeneration"));
        setLoading(false);
        return;
      }

      const data = await res.json();
      toast.success(t("videoStarted"));
      router.push(`/dashboard/videos/${data.videoId}`);
    } catch {
      toast.error(t("somethingWrong"));
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t("createTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("createSubtitle")}
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
                i === step
                  ? "gradient-bg text-white"
                  : i < step
                    ? "bg-violet-100 text-violet-700"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {i + 1}
            </div>
            <span
              className={cn(
                "hidden text-sm sm:inline",
                i === step ? "font-medium" : "text-muted-foreground"
              )}
            >
              {s}
            </span>
            {i < steps.length - 1 && (
              <div className="mx-1 h-px w-8 bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="rounded-xl border border-border/60 bg-card p-6">
        {/* Step 0: Theme */}
        {step === 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold">{t("chooseTheme")}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {videoThemes.map((th) => {
                const Icon = iconMap[th.icon] || Sparkles;
                return (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                      theme === th.id
                        ? "border-violet-400 bg-violet-50 shadow-sm"
                        : "border-border/60 hover:border-violet-200"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        theme === th.id
                          ? "bg-violet-100 text-violet-600"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{th.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {th.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 1: Prompt */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="mb-4 text-lg font-semibold">
              {t("describeVideo")}
            </h2>
            <div>
              <Label htmlFor="title">{t("videoTitle")}</Label>
              <Input
                id="title"
                placeholder={t("videoTitlePlaceholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="prompt">{t("whatAbout")}</Label>
              <Textarea
                id="prompt"
                placeholder={t("promptPlaceholder")}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-1.5 min-h-[120px]"
              />
            </div>
          </div>
        )}

        {/* Step 2: Narration */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("narrationText")}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateScript}
                disabled={generating}
              >
                {generating ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-3 w-3" />
                )}
                {t("autoGenerate")}
              </Button>
            </div>
            <div>
              <Label htmlFor="narration">
                {t("narratorLabel")}
              </Label>
              <Textarea
                id="narration"
                placeholder={t("narratorPlaceholder")}
                value={narratorText}
                onChange={(e) => setNarratorText(e.target.value)}
                className="mt-1.5 min-h-[200px]"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {narratorText.length} {t("characters")} &middot; ~
                {Math.ceil(narratorText.length / 15)} {t("seconds")}
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Voice */}
        {step === 3 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold">{t("chooseVoice")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {voiceOptions.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVoiceId(v.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
                    voiceId === v.id
                      ? "border-violet-400 bg-violet-50 shadow-sm"
                      : "border-border/60 hover:border-violet-200"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full",
                      voiceId === v.id
                        ? "gradient-bg text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <span className="text-xs font-medium">
                      {v.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{v.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="mb-4 text-lg font-semibold">{t("reviewGenerate")}</h2>
            <div className="space-y-3 rounded-lg bg-muted/50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("theme")}</span>
                <span className="font-medium capitalize">{theme}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("title")}</span>
                <span className="font-medium">{title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("voice")}</span>
                <span className="font-medium capitalize">{voiceId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("estDuration")}</span>
                <span className="font-medium">
                  ~{Math.ceil(narratorText.length / 15)}s
                </span>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground">{t("narrationPreview")}</p>
                <p className="mt-1 text-sm">
                  {narratorText.slice(0, 200)}
                  {narratorText.length > 200 && "..."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>

        {step < steps.length - 1 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
          >
            {t("next")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="gradient-bg border-0 text-white hover:opacity-90"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            {t("generateVideo")}
          </Button>
        )}
      </div>
    </div>
  );
}
