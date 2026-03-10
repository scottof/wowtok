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
  Lock,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { videoThemes } from "@/config/themes";
import { plans } from "@/lib/stripe/config";
import { createCheckoutSessionByPlan } from "@/lib/stripe/actions";
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

const STARTER_THEME_LIMIT = 5;
const STARTER_VOICE_LIMIT = 3;

const NEXT_PLAN_MAP: Record<string, string> = {
  STARTER: "CREATOR",
  CREATOR: "PRO",
};

interface CreateVideoFormProps {
  plan: string;
  used: number;
  limit: number;
}

export function CreateVideoForm({ plan, used, limit }: CreateVideoFormProps) {
  const router = useRouter();
  const t = useTranslations("Dashboard");
  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState("");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [narratorText, setNarratorText] = useState("");
  const [voiceId, setVoiceId] = useState("adam");
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  const isStarter = plan === "STARTER";
  const isAtLimit = limit > 0 && used >= limit;

  const nextPlanId = NEXT_PLAN_MAP[plan];
  const nextPlan = nextPlanId ? plans.find((p) => p.id === nextPlanId) : null;

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

  async function handleUpgrade() {
    if (!nextPlanId) return;
    setUpgrading(true);
    try {
      await createCheckoutSessionByPlan(nextPlanId);
    } catch {
      toast.error(t("somethingWrong"));
      setUpgrading(false);
    }
  }

  // Upgrade overlay
  const upgradeOverlay = nextPlan ? (
    <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
              <Zap className="h-4 w-4 text-white" />
            </div>
            {t("upgradeTo", { plan: nextPlan.name })}
          </DialogTitle>
          <DialogDescription>
            {t("overlayDesc", { plan: nextPlan.name })}
          </DialogDescription>
        </DialogHeader>

        <div className="my-2">
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-bold">${nextPlan.price}</span>
            <span className="text-sm text-muted-foreground">{t("perMonth")}</span>
            <span className="ml-2 text-sm text-muted-foreground line-through">
              ${nextPlan.originalPrice}
            </span>
          </div>

          <ul className="space-y-2">
            {nextPlan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-violet-600" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="cursor-pointer gradient-bg border-0 text-white hover:opacity-90"
          >
            {upgrading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            {t("upgradeTo", { plan: nextPlan.name })}
          </Button>
          <Button
            variant="ghost"
            className="cursor-pointer"
            onClick={() => setShowUpgrade(false)}
          >
            {t("maybeLater")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  ) : null;

  // Show limit-reached message instead of the wizard
  if (isAtLimit) {
    return (
      <div>
        {upgradeOverlay}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{t("createTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("createSubtitle")}
          </p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Zap className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold">{t("limitReachedTitle")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {t("limitReachedCreateDesc", { used, limit })}
          </p>
          {nextPlan ? (
            <Button
              onClick={() => setShowUpgrade(true)}
              className="mt-4 cursor-pointer gradient-bg border-0 text-white hover:opacity-90"
            >
              <Zap className="mr-2 h-4 w-4" />
              {t("viewUpgradeOptions")}
            </Button>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              {t("maxPlanReached")}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {upgradeOverlay}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t("createTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("createSubtitle")}
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2 overflow-x-auto">
        {steps.map((s, i) => (
          <div key={s} className="flex shrink-0 items-center gap-2">
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
              <div className="mx-1 h-px w-4 sm:w-8 bg-border" />
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
              {videoThemes.map((th, i) => {
                const Icon = iconMap[th.icon] || Sparkles;
                const isLocked = isStarter && i >= STARTER_THEME_LIMIT;
                return (
                  <button
                    key={th.id}
                    onClick={() => {
                      if (isLocked) {
                        setShowUpgrade(true);
                      } else {
                        setTheme(th.id);
                      }
                    }}
                    className={cn(
                      "relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-all",
                      isLocked
                        ? "border-border/40 opacity-60 hover:border-violet-200 hover:opacity-80"
                        : theme === th.id
                          ? "border-violet-400 bg-violet-50 shadow-sm"
                          : "border-border/60 hover:border-violet-200"
                    )}
                  >
                    {isLocked && (
                      <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                        <Lock className="h-2.5 w-2.5" />
                        Creator
                      </div>
                    )}
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        isLocked
                          ? "bg-muted text-muted-foreground"
                          : theme === th.id
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
            {isStarter && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {t("unlockAllThemes")}{" "}
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="cursor-pointer font-medium text-violet-600 underline hover:text-violet-700"
                >
                  {t("upgradeToCreator")}
                </button>
              </p>
            )}
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
            <h2 className="text-lg font-semibold">{t("narrationText")}</h2>
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
              {narratorText.length > 0 && narratorText.length < 200 && (
                <p className="mt-1 text-xs text-amber-600">
                  ⚠ {t("shortNarrationWarning")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Voice */}
        {step === 3 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold">{t("chooseVoice")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {voiceOptions.map((v, i) => {
                const isLocked = isStarter && i >= STARTER_VOICE_LIMIT;
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      if (isLocked) {
                        setShowUpgrade(true);
                      } else {
                        setVoiceId(v.id);
                      }
                    }}
                    className={cn(
                      "relative flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-left transition-all",
                      isLocked
                        ? "border-border/40 opacity-60 hover:border-violet-200 hover:opacity-80"
                        : voiceId === v.id
                          ? "border-violet-400 bg-violet-50 shadow-sm"
                          : "border-border/60 hover:border-violet-200"
                    )}
                  >
                    {isLocked && (
                      <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                        <Lock className="h-2.5 w-2.5" />
                        Creator
                      </div>
                    )}
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full",
                        isLocked
                          ? "bg-muted text-muted-foreground"
                          : voiceId === v.id
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
                );
              })}
            </div>
            {isStarter && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {t("unlockAllVoices")}{" "}
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="cursor-pointer font-medium text-violet-600 underline hover:text-violet-700"
                >
                  {t("upgradeToCreator")}
                </button>
              </p>
            )}
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
        {step > 0 ? (
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => setStep(step - 1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back")}
          </Button>
        ) : (
          <div />
        )}

        {step < steps.length - 1 ? (
          <Button
            className="cursor-pointer"
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
            className="cursor-pointer gradient-bg border-0 text-white hover:opacity-90"
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
