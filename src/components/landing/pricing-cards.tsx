"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatPrice,
  getCurrencyForLocale,
  getPlanPricing,
  plans,
} from "@/lib/stripe/config";
import { createCheckoutSessionByPlan } from "@/lib/stripe/actions";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { trackEvent } from "@/lib/analytics";

interface PricingCardsProps {
  isLoggedIn?: boolean;
}

export function PricingCards({ isLoggedIn = false }: PricingCardsProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Pricing");
  const tDash = useTranslations("Dashboard");
  const [isPending, startTransition] = useTransition();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const currency = getCurrencyForLocale(locale);

  function handleSubscribe(planId: string) {
    trackEvent("select_plan", { plan: planId, source: "pricing_page" });
    trackEvent("begin_checkout", { plan: planId });
    setLoadingPlan(planId);
    startTransition(async () => {
      try {
        await createCheckoutSessionByPlan(planId, pathname);
      } catch {
        setLoadingPlan(null);
      }
    });
  }

  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            {t("badge")}
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, i) => {
            const pricing = getPlanPricing(plan, currency);
            if (!pricing) return null;

            const discount = Math.round(
              ((pricing.originalPrice - pricing.price) / pricing.originalPrice) *
                100
            );
            const isLoading = isPending && loadingPlan === plan.id;
            return (
              <motion.div
                key={plan.id}
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border bg-card p-8",
                  plan.highlighted
                    ? "border-violet-300 shadow-xl shadow-violet-500/10"
                    : "border-border/60"
                )}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="gradient-bg rounded-full px-3 py-1 text-xs font-medium text-white">
                      {t("mostPopular")}
                    </span>
                  </div>
                )}

                <div className="mb-8 flex min-h-[300px] flex-col">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold">{t(plan.nameKey)}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t(plan.descriptionKey)}
                    </p>
                  </div>

                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-lg text-muted-foreground/70 line-through decoration-red-400/60">
                      {formatPrice(pricing.originalPrice, currency, locale)}
                    </span>
                    <span className="rounded-md bg-green-100 px-1.5 py-0.5 text-[11px] font-semibold text-green-700">
                      {t("save", { discount })}
                    </span>
                  </div>
                  <div>
                    <span className="text-4xl font-bold">
                      {formatPrice(pricing.price, currency, locale)}
                    </span>
                    <span className="text-muted-foreground">{t("perMonth")}</span>
                  </div>

                  <div className="mt-auto pt-6">
                    {isLoggedIn ? (
                      <Button
                        className={cn(
                          "w-full cursor-pointer",
                          plan.highlighted
                            ? "gradient-bg border-0 text-white hover:opacity-90"
                            : ""
                        )}
                        variant={plan.highlighted ? "default" : "outline"}
                        disabled={isPending}
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {isLoading ? tDash("redirecting") : t("getStarted")}
                      </Button>
                    ) : (
                      <Button
                        className={cn(
                          "w-full cursor-pointer",
                          plan.highlighted
                            ? "gradient-bg border-0 text-white hover:opacity-90"
                            : ""
                        )}
                        variant={plan.highlighted ? "default" : "outline"}
                        asChild
                      >
                        <Link href="/signup">{t("getStarted")}</Link>
                      </Button>
                    )}
                  </div>
                </div>

                <ul className="space-y-3">
                  {plan.featureKeys.map((featureKey) => (
                    <li key={featureKey} className="flex items-start gap-3 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                      <span>{t(featureKey)}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}

          <motion.div
            className="relative flex h-full flex-col rounded-2xl border border-dashed border-violet-300 bg-violet-50/40 p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: plans.length * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="mb-8 flex min-h-[300px] flex-col">
              <div className="mb-6">
                <div className="mb-2 inline-flex items-center rounded-full border border-violet-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-700">
                  {t("paygBadge")}
                </div>
                <h3 className="text-lg font-semibold">{t("paygTitle")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("paygDesc")}
                </p>
              </div>

              <div className="mt-auto pt-6">
                {isLoggedIn ? (
                  <Button className="w-full cursor-pointer" variant="outline" asChild>
                    <Link href="/dashboard/create">{t("getStarted")}</Link>
                  </Button>
                ) : (
                  <Button className="w-full cursor-pointer" variant="outline" asChild>
                    <Link href="/signup">{t("getStarted")}</Link>
                  </Button>
                )}
              </div>
            </div>

            <ul className="space-y-3">
              {[
                "paygFeature1",
                "paygFeature2",
                "paygFeature3",
                "paygFeature4",
              ].map((featureKey) => (
                <li key={featureKey} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                  <span>{t(featureKey)}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
