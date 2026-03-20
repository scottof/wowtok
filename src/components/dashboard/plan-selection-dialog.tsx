"use client";

import { useState } from "react";
import { Zap, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  formatPrice,
  getCurrencyForLocale,
  getPlanPricing,
  plans,
} from "@/lib/stripe/config";
import { createCheckoutSessionByPlan } from "@/lib/stripe/actions";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

interface PlanSelectionDialogProps {
  open: boolean;
  /** When true the dialog cannot be dismissed — used as a full-page blocker */
  blocking?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PlanSelectionDialog({
  open,
  blocking = false,
  onOpenChange,
}: PlanSelectionDialogProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Dashboard");
  const tPricing = useTranslations("Pricing");
  const [selectingPlan, setSelectingPlan] = useState<string | null>(null);
  const currency = getCurrencyForLocale(locale);

  async function handleSelectPlan(planId: string) {
    trackEvent("select_plan", { plan: planId, source: "dialog" });
    setSelectingPlan(planId);
    try {
      await createCheckoutSessionByPlan(planId, pathname);
    } catch (err) {
      // Next.js redirect() throws a NEXT_REDIRECT "error" — don't show toast for that
      if (typeof err === "object" && err !== null && "digest" in err) {
        const digest = (err as { digest?: string }).digest;
        if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) {
          return;
        }
      }
      toast.error(t("somethingWrong"));
      setSelectingPlan(null);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={blocking ? () => {} : onOpenChange}
    >
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        showCloseButton={!blocking}
        onPointerDownOutside={blocking ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={blocking ? (e) => e.preventDefault() : undefined}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
              <Zap className="h-4 w-4 text-white" />
            </div>
            {t("choosePlanTitle")}
          </DialogTitle>
          <DialogDescription>{t("choosePlanDesc")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-3 my-2">
          {plans.map((p) => {
            const pricing = getPlanPricing(p, currency);
            if (!pricing) return null;

            return (
              <div
                key={p.id}
                className={cn(
                  "rounded-xl border p-4 flex flex-col",
                  p.highlighted && "border-violet-400 ring-2 ring-violet-100"
                )}
              >
                <h3 className="font-semibold">{tPricing(p.nameKey)}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold">
                    {formatPrice(pricing.price, currency, locale)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("perMonth")}
                  </span>
                </div>
                {pricing.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(pricing.originalPrice, currency, locale)}
                  </span>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {p.videosPerMonth} {t("videosPerMonth")}
                </p>
                <ul className="mt-3 space-y-1.5 flex-1">
                  {p.featureKeys.slice(1, 4).map((featureKey) => (
                    <li key={featureKey} className="flex items-start gap-1.5 text-xs">
                      <Check className="h-3 w-3 shrink-0 text-violet-600 mt-0.5" />
                      {tPricing(featureKey)}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSelectPlan(p.id)}
                  disabled={selectingPlan !== null}
                  className={cn(
                    "mt-4 w-full cursor-pointer",
                    p.highlighted
                      ? "gradient-bg border-0 text-white hover:opacity-90"
                      : ""
                  )}
                  variant={p.highlighted ? "default" : "outline"}
                  size="sm"
                >
                  {selectingPlan === p.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t("selectPlan")}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
