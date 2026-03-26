"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  estimateCreditsForVideo,
  formatPrice,
  getCreditTopupPricing,
  getCurrencyForLocale,
  getPlanPricing,
  plans,
} from "@/lib/stripe/config";
import {
  createCheckoutSessionByPlan,
  createCreditTopupCheckoutSession,
} from "@/lib/stripe/actions";
import { PlanSelectionDialog } from "@/components/dashboard/plan-selection-dialog";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";
import { getTheme } from "@/config/themes";

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
const DRAFT_STORAGE_KEY = "wowtok:create-video-draft";

const NEXT_PLAN_MAP: Record<string, string> = {
  STARTER: "CREATOR",
  CREATOR: "PRO",
};

interface CreateVideoFormProps {
  plan: string | null;
  used: number;
  limit: number;
  hasSubscription: boolean;
  purchasedCreditsAvailable: number;
}

export function CreateVideoForm({
  plan,
  used,
  limit,
  hasSubscription,
  purchasedCreditsAvailable,
}: CreateVideoFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Dashboard");
  const tPricing = useTranslations("Pricing");
  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState("");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [narratorText, setNarratorText] = useState("");
  const [voiceId, setVoiceId] = useState("adam");
  const [loading, setLoading] = useState(false);
  const [topupLoading, setTopupLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [draftReady, setDraftReady] = useState(false);

  const applyStarterRestrictions = hasSubscription && plan === "STARTER";
  const currency = getCurrencyForLocale(locale);
  const paygStatus = searchParams.get("payg");
  const monthlyCreditsRemaining = hasSubscription
    ? Math.max(limit - used, 0)
    : 0;
  const requiredCredits = estimateCreditsForVideo(narratorText);
  const totalAvailableCredits =
    monthlyCreditsRemaining + purchasedCreditsAvailable;
  const creditShortfall = Math.max(requiredCredits - totalAvailableCredits, 0);
  const topupPricing = getCreditTopupPricing(creditShortfall, currency);

  const nextPlanId = plan ? NEXT_PLAN_MAP[plan] : undefined;
  const nextPlan = nextPlanId ? plans.find((p) => p.id === nextPlanId) : null;
  const nextPlanPricing = nextPlan
    ? getPlanPricing(nextPlan, currency)
    : undefined;

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

  const selectedTheme = theme ? getTheme(theme) : undefined;
  const selectedVoice = voiceOptions.find((voice) => voice.id === voiceId);

  useEffect(() => {
    const storedDraft = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (storedDraft) {
      try {
        const parsed = JSON.parse(storedDraft) as {
          theme?: string;
          title?: string;
          prompt?: string;
          narratorText?: string;
          voiceId?: string;
          step?: number;
        };
        setTheme(parsed.theme ?? "");
        setTitle(parsed.title ?? "");
        setPrompt(parsed.prompt ?? "");
        setNarratorText(parsed.narratorText ?? "");
        setVoiceId(parsed.voiceId ?? "adam");
        setStep(
          typeof parsed.step === "number"
            ? Math.max(0, Math.min(parsed.step, steps.length - 1))
            : 0
        );
      } catch {
        window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    }

    setDraftReady(true);
  }, [steps.length]);

  useEffect(() => {
    if (!draftReady) return;

    window.sessionStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({
        theme,
        title,
        prompt,
        narratorText,
        voiceId,
        step,
      })
    );
  }, [draftReady, narratorText, prompt, step, theme, title, voiceId]);

  useEffect(() => {
    if (!draftReady || !paygStatus) return;

    if (paygStatus === "success") {
      toast.success(t("creditCheckoutSuccess"));
      setStep(steps.length - 1);
    } else if (paygStatus === "canceled") {
      toast.message(t("creditCheckoutCanceled"));
      setStep(steps.length - 1);
    }

    router.replace(pathname);
  }, [draftReady, pathname, paygStatus, router, steps.length, t]);

  function getDraftFingerprint() {
    return [
      theme,
      title.trim(),
      prompt.trim(),
      narratorText.trim(),
      voiceId,
    ].join("|");
  }

  function canProceed() {
    switch (step) {
      case 0:
        return theme !== "";
      case 1:
        return title.trim() !== "" && prompt.trim() !== "";
      case 2:
        return narratorText.trim() !== "" && narratorText.length <= 600;
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
        if (res.status === 402) {
          toast.error(t("insufficientCredits"));
        } else {
          toast.error(data.error || t("failedGeneration"));
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      trackEvent("generate_video", {
        theme,
        voice: voiceId,
        requiredCredits,
      });
      window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
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
      await createCheckoutSessionByPlan(nextPlanId, pathname);
    } catch (err) {
      if (typeof err === "object" && err !== null && "digest" in err) {
        const digest = (err as { digest?: string }).digest;
        if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) {
          return;
        }
      }
      toast.error(t("somethingWrong"));
      setUpgrading(false);
    }
  }

  async function handleCreditCheckout() {
    if (creditShortfall <= 0) {
      return;
    }

    setTopupLoading(true);
    try {
      await createCreditTopupCheckoutSession({
        requiredCredits: creditShortfall,
        returnPath: pathname,
        draftFingerprint: getDraftFingerprint(),
      });
    } catch (err) {
      if (typeof err === "object" && err !== null && "digest" in err) {
        const digest = (err as { digest?: string }).digest;
        if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) {
          return;
        }
      }
      toast.error(t("somethingWrong"));
      setTopupLoading(false);
    }
  }

  const upgradeOverlay = nextPlan && nextPlanPricing ? (
    <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
              <Zap className="h-4 w-4 text-white" />
            </div>
            {t("upgradeTo", { plan: tPricing(nextPlan.nameKey) })}
          </DialogTitle>
          <DialogDescription>
            {t("creditsOverlayDesc", {
              plan: tPricing(nextPlan.nameKey),
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="my-2">
          <div className="mb-4 flex items-baseline gap-1">
            <span className="text-3xl font-bold">
              {formatPrice(nextPlanPricing.price, currency, locale)}
            </span>
            <span className="text-sm text-muted-foreground">
              {t("perMonth")}
            </span>
            <span className="ml-2 text-sm text-muted-foreground line-through">
              {formatPrice(nextPlanPricing.originalPrice, currency, locale)}
            </span>
          </div>

          <ul className="space-y-2">
            {nextPlan.featureKeys.map((featureKey) => (
              <li key={featureKey} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-violet-600" />
                {tPricing(featureKey)}
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
            {t("upgradeTo", { plan: tPricing(nextPlan.nameKey) })}
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

  return (
    <div>
      {upgradeOverlay}
      <PlanSelectionDialog
        open={showPlanDialog}
        onOpenChange={setShowPlanDialog}
      />

      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t("createTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("createSubtitle")}
        </p>
      </div>

      {!hasSubscription && (
        <div className="mb-6 rounded-xl border border-violet-200 bg-violet-50/60 p-4 text-sm">
          <p className="font-medium text-violet-900">
            {t("payAsYouGoTitle")}
          </p>
          <p className="mt-1 text-violet-800/80">
            {t("payAsYouGoDesc")}
          </p>
        </div>
      )}

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
              <div className="mx-1 h-px w-4 bg-border sm:w-8" />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-6">
        {step === 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold">{t("chooseTheme")}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {videoThemes.map((th, i) => {
                const Icon = iconMap[th.icon] || Sparkles;
                const isLocked = applyStarterRestrictions && i >= STARTER_THEME_LIMIT;
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
                        {tPricing("creator")}
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
                      <p className="text-sm font-medium">{t(th.nameKey)}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {t(th.descriptionKey)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            {applyStarterRestrictions && (
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

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t("narrationText")}</h2>
            <div>
              <Label htmlFor="narration">{t("narratorLabel")}</Label>
              <Textarea
                id="narration"
                placeholder={t("narratorPlaceholder")}
                value={narratorText}
                onChange={(e) => setNarratorText(e.target.value.slice(0, 600))}
                maxLength={600}
                className="mt-1.5 min-h-[200px]"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {narratorText.length}/600 {t("characters")} &middot; ~
                {Math.ceil(narratorText.length / 15)} {t("seconds")}
              </p>
              {narratorText.length > 0 && narratorText.length < 200 && (
                <p className="mt-1 text-xs text-amber-600">
                  {t("shortNarrationWarning")}
                </p>
              )}
              {narratorText.length >= 600 && (
                <p className="mt-1 text-xs text-destructive">
                  {t("maxNarrationWarning")}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold">{t("chooseVoice")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {voiceOptions.map((v, i) => {
                const isLocked =
                  applyStarterRestrictions && i >= STARTER_VOICE_LIMIT;
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
                        {tPricing("creator")}
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
                      <span className="text-xs font-medium">{v.name[0]}</span>
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
            {applyStarterRestrictions && (
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

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="mb-4 text-lg font-semibold">
              {t("reviewGenerate")}
            </h2>
            <div className="space-y-3 rounded-lg bg-muted/50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("theme")}</span>
                <span className="font-medium">
                  {selectedTheme ? t(selectedTheme.nameKey) : theme}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("title")}</span>
                <span className="font-medium">{title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("voice")}</span>
                <span className="font-medium">
                  {selectedVoice?.name ?? voiceId}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("estDuration")}
                </span>
                <span className="font-medium">
                  ~{Math.ceil(narratorText.length / 15)}s
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("creditsRequired")}
                </span>
                <span className="font-medium">{requiredCredits}</span>
              </div>
              {hasSubscription && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("monthlyCreditsRemaining")}
                  </span>
                  <span className="font-medium">{monthlyCreditsRemaining}</span>
                </div>
              )}
              {purchasedCreditsAvailable > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("purchasedCreditsAvailable")}
                  </span>
                  <span className="font-medium">{purchasedCreditsAvailable}</span>
                </div>
              )}
              {creditShortfall > 0 && (
                <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm">
                  <p className="font-medium text-violet-900">
                    {t("reviewPaymentPrompt")}
                  </p>
                  <p className="mt-1 text-violet-800/80">
                    {t("creditsShortfallDesc", {
                      credits: creditShortfall,
                      price: formatPrice(topupPricing.price, currency, locale),
                    })}
                  </p>
                </div>
              )}
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground">
                  {t("narrationPreview")}
                </p>
                <p className="mt-1 text-sm">
                  {narratorText.slice(0, 200)}
                  {narratorText.length > 200 && "..."}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-card p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("availableCredits")}
                </span>
                <span className="font-medium">{totalAvailableCredits}</span>
              </div>
            </div>
          </div>
        )}
      </div>

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
        ) : creditShortfall > 0 ? (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setShowPlanDialog(true)}
            >
              {t("viewPlans")}
            </Button>
            <Button
              onClick={handleCreditCheckout}
              disabled={topupLoading}
              className="cursor-pointer gradient-bg border-0 text-white hover:opacity-90"
            >
              {topupLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              {t("payAndCreate", {
                price: formatPrice(topupPricing.price, currency, locale),
              })}
            </Button>
          </div>
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
